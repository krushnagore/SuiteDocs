import os
import re
import json
import urllib.request
import time

with open('modules_list.json', 'r', encoding='utf-8') as f:
    modules = json.load(f)

base_url = 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/'
samples_dir = 'cache_samples'
os.makedirs(samples_dir, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def fetch_url(url_suffix):
    local_path = os.path.join(samples_dir, url_suffix)
    if os.path.exists(local_path) and os.path.getsize(local_path) > 500:
        with open(local_path, 'r', encoding='utf-8', errors='ignore') as f:
            return f.read()
            
    url = base_url + url_suffix
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read()
            with open(local_path, 'wb') as f:
                f.write(content)
            time.sleep(0.08)
            return content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error fetching {url_suffix}: {e}")
        return ""

module_samples = {}

for mod in modules:
    m_name = mod['name']
    href = mod.get('href')
    if not href:
        continue
    mod_html_path = os.path.join('cache_docs', href)
    if not os.path.exists(mod_html_path):
        continue
        
    with open(mod_html_path, 'r', encoding='utf-8', errors='ignore') as f:
        mod_html = f.read()
        
    # Find all links to "Sample" or "Samples"
    sample_links = re.findall(r'<a\s+href="([^"]+)">([^<]*[sS]ample[^<]*)</a>', mod_html)
    
    samples_found = []
    
    # 1. Check if there are pres directly on the module page
    pres_on_page = re.findall(r'<pre[^>]*>(.*?)</pre>', mod_html, re.DOTALL)
    for p in pres_on_page:
        code = re.sub(r'<[^>]+>', '', p).strip()
        if len(code) > 25 and ('define(' in code or 'require(' in code or 'function' in code or '=>' in code):
            samples_found.append({
                'title': f'{m_name} Sample',
                'code': code
            })
            
    # 2. Check each sample link
    for s_href, s_text in sample_links:
        s_html = fetch_url(s_href)
        if not s_html:
            continue
            
        # Check if s_html has pre blocks directly
        s_pres = re.findall(r'<pre[^>]*>(.*?)</pre>', s_html, re.DOTALL)
        if s_pres:
            for sp in s_pres:
                code = re.sub(r'<[^>]+>', '', sp).strip()
                if len(code) > 25:
                    samples_found.append({
                        'title': s_text.strip(),
                        'code': code
                    })
        else:
            # Check if this is an index of sub-sample pages!
            # e.g. section_0302035713.html has subsect_...
            sub_links = re.findall(r'<a\s+href="(subsect_[^"]+|section_[^"]+|article_[^"]+)">([^<]+)</a>', s_html)
            for sub_href, sub_title in sub_links:
                if 'Module' in sub_title or 'SuiteScript' in sub_title:
                    continue
                sub_html = fetch_url(sub_href)
                sub_pres = re.findall(r'<pre[^>]*>(.*?)</pre>', sub_html, re.DOTALL)
                for sbp in sub_pres:
                    code = re.sub(r'<[^>]+>', '', sbp).strip()
                    if len(code) > 25:
                        samples_found.append({
                            'title': sub_title.strip(),
                            'code': code
                        })
                        
    module_samples[m_name] = samples_found
    print(f"{m_name}: Found {len(samples_found)} code samples")

with open('scraped_samples.json', 'w', encoding='utf-8') as f:
    json.dump(module_samples, f, indent=2)

total_samples = sum(len(v) for v in module_samples.values())
print(f"\nTOTAL OFFICIAL CODE SAMPLES EXTRACTED: {total_samples}")
