import json
import os
import urllib.request
import time
import re

with open('modules_list.json', 'r', encoding='utf-8') as f:
    modules = json.load(f)

base_url = 'https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/'
cache_dir = 'cache_docs'
os.makedirs(cache_dir, exist_ok=True)

print(f"Total modules to check: {len(modules)}")

for i, mod in enumerate(modules, 1):
    href = mod.get('href')
    name = mod.get('name')
    if not href:
        print(f"[{i}/{len(modules)}] {name} - No href (skipping fetch)")
        continue
    
    cache_file = os.path.join(cache_dir, href)
    if os.path.exists(cache_file) and os.path.getsize(cache_file) > 1000:
        print(f"[{i}/{len(modules)}] {name} - Cached ({os.path.getsize(cache_file)} bytes)")
        continue
    
    url = base_url + href
    print(f"[{i}/{len(modules)}] Fetching {name} from {url}...")
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            content = resp.read()
            with open(cache_file, 'wb') as f_out:
                f_out.write(content)
            print(f"    Saved {len(content)} bytes.")
    except Exception as e:
        print(f"    ERROR fetching {url}: {e}")
    time.sleep(0.15)

print("All module pages fetched/checked!")
