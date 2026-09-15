"""
SuiteScript 2.1 - Method Code Reference Scraper
Author: Krushna Gore
Extracts official method-level code snippets and references directly from Oracle Help documentation.
"""

import os
import re
import json
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_DIR = "d:/Projects/SuiteDocs"
CACHE_DOCS_DIR = os.path.join(BASE_DIR, "cache_docs")
CACHE_METHODS_DIR = os.path.join(BASE_DIR, "cache_methods")
MODULES_FILE = os.path.join(BASE_DIR, "modules_list.json")
OUTPUT_FILE = os.path.join(BASE_DIR, "scraped_method_samples.json")

os.makedirs(CACHE_METHODS_DIR, exist_ok=True)

BASE_URL = "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

def clean_code(raw_html):
    code = re.sub(r'<[^>]+>', '', raw_html)
    code = code.replace('&lt;', '<').replace('&gt;', '>').replace('&amp;', '&').replace('&quot;', '"').replace('&#39;', "'")
    lines = [line.rstrip() for line in code.strip().split('\n')]
    return '\n'.join(lines)

def collect_method_links():
    if not os.path.exists(MODULES_FILE):
        print(f"Error: {MODULES_FILE} not found.")
        return {}

    with open(MODULES_FILE, "r", encoding="utf-8") as f:
        modules = json.load(f)

    methods_to_fetch = {}

    for mod in modules:
        href = mod.get("href")
        if not href:
            continue
        mod_path = os.path.join(CACHE_DOCS_DIR, href)
        if not os.path.exists(mod_path):
            continue

        with open(mod_path, "r", encoding="utf-8", errors="ignore") as f:
            html = f.read()

        tables = re.findall(r'<table[^>]*>(.*?)</table>', html, re.DOTALL)
        for t in tables:
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.DOTALL)
            for r in rows:
                cells = re.findall(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
                for c in cells:
                    links = re.findall(r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>', c, re.DOTALL)
                    for lh, lt in links:
                        clean_lt = re.sub(r'<[^>]+>', '', lt).strip()
                        if lh.startswith("#") or "sample" in clean_lt.lower() or "help" in clean_lt.lower():
                            continue
                        if "(" in clean_lt or "." in clean_lt or re.match(r'^[A-Z][a-zA-Z0-9]+$', clean_lt):
                            if lh not in methods_to_fetch:
                                methods_to_fetch[lh] = []
                            methods_to_fetch[lh].append({
                                'module': mod["name"],
                                'module_path': mod.get("name", "").replace(" Module", "").replace(" Modules", "").strip(),
                                'method_name': clean_lt
                            })

    return methods_to_fetch

def fetch_and_extract(href, meta_list):
    local_file = os.path.join(CACHE_METHODS_DIR, href)
    html_content = ""

    if os.path.exists(local_file) and os.path.getsize(local_file) > 500:
        try:
            with open(local_file, "r", encoding="utf-8", errors="ignore") as f:
                html_content = f.read()
        except Exception:
            pass

    if not html_content:
        url = BASE_URL + href
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20) as resp:
                raw_bytes = resp.read()
                with open(local_file, "wb") as f_out:
                    f_out.write(raw_bytes)
                html_content = raw_bytes.decode("utf-8", errors="ignore")
                time.sleep(0.04)
        except Exception as e:
            return href, None

    pres = re.findall(r'<pre[^>]*>(.*?)</pre>', html_content, re.DOTALL)
    if not pres:
        return href, None

    extracted_code = None
    for p in pres:
        cleaned = clean_code(p)
        if len(cleaned) > 20 and not cleaned.startswith("<!DOCTYPE") and not cleaned.startswith("<html"):
            extracted_code = cleaned
            break

    if not extracted_code:
        return href, None

    desc_match = re.search(r'<p[^>]*>(.*?)</p>', html_content, re.DOTALL)
    method_desc = clean_code(desc_match.group(1)) if desc_match else ""

    return href, {
        'href': href,
        'code': extracted_code,
        'description': method_desc,
        'oracle_url': BASE_URL + href,
        'meta': meta_list
    }

def main():
    print("=== SuiteScript 2.1 Method Code Reference Scraper ===")
    methods_to_fetch = collect_method_links()
    total_links = len(methods_to_fetch)
    print(f"Discovered {total_links} unique method/member documentation topics.")

    all_method_snippets = {}
    if os.path.exists(OUTPUT_FILE):
        try:
            with open(OUTPUT_FILE, "r", encoding="utf-8") as f:
                all_method_snippets = json.load(f)
            print(f"Loaded {len(all_method_snippets)} previously extracted method samples.")
        except Exception:
            pass

    print(f"Fetching and parsing method topics with 12 parallel threads...")
    success_count = 0

    with ThreadPoolExecutor(max_workers=12) as executor:
        future_map = {
            executor.submit(fetch_and_extract, href, meta): href
            for href, meta in methods_to_fetch.items()
        }

        completed = 0
        for future in as_completed(future_map):
            completed += 1
            if completed % 150 == 0 or completed == total_links:
                print(f"  Progress: [{completed}/{total_links}] topics processed...")

            href, res = future.result()
            if res and res.get('code'):
                success_count += 1
                for item in res['meta']:
                    m_name = item['method_name']
                    all_method_snippets[m_name] = {
                        'module': item['module'],
                        'module_path': item['module_path'],
                        'method_name': m_name,
                        'href': href,
                        'oracle_url': res['oracle_url'],
                        'code': res['code']
                    }
                    short_name = m_name.split('(')[0].split('.').pop()
                    if short_name and short_name not in all_method_snippets:
                        all_method_snippets[f"{item['module_path']}.{short_name}"] = all_method_snippets[m_name]

    print(f"\nExtracted official code references for {len(all_method_snippets)} method signatures across NetSuite modules!")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_method_snippets, f, indent=2)
    print(f"Saved database to {OUTPUT_FILE}")

    site_dest = os.path.join(BASE_DIR, "SuiteDocs Site", "public", "data", "scraped_method_samples.json")
    try:
        os.makedirs(os.path.dirname(site_dest), exist_ok=True)
        with open(site_dest, "w", encoding="utf-8") as f:
            json.dump(all_method_snippets, f, indent=2)
        print(f"Synchronized to {site_dest}")
    except Exception as e:
        print(f"Notice: site public data sync: {e}")

if __name__ == "__main__":
    main()
