import os
import json
import re

with open('modules_list.json', 'r', encoding='utf-8') as f:
    modules_meta = json.load(f)

print(f"Total modules to process: {len(modules_meta)}")

parsed_data = []

for mod in modules_meta:
    name = mod['name']
    href = mod.get('href')
    desc = mod.get('desc', '')
    scripts = mod.get('scripts', '')
    perms = mod.get('permissions', '')
    
    mod_info = {
        'name': name,
        'href': href,
        'overview': desc,
        'supported_scripts': scripts,
        'permissions': perms,
        'intro_paragraphs': [],
        'sections': []
    }
    
    if not href:
        # e.g. N/sso Module
        parsed_data.append(mod_info)
        continue
    
    cache_path = os.path.join('cache_docs', href)
    if not os.path.exists(cache_path):
        parsed_data.append(mod_info)
        continue
    
    with open(cache_path, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
        
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
    
    # Extract intro paragraphs
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if h1_match:
        h1_pos = h1_match.start()
        # Find first h2 after h1
        h2_match = re.search(r'<h2[^>]*>', html[h1_pos:])
        if h2_match:
            intro_html = html[h1_pos:h1_pos + h2_match.start()]
        else:
            intro_html = html[h1_pos:h1_pos + 4000]
            
        paras = re.findall(r'<p[^>]*>(.*?)</p>', intro_html, re.DOTALL)
        for p in paras:
            clean = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', p)).strip()
            # Filter out breadcrumb or empty or generic lines
            if clean and not clean.startswith("SuiteCloud Platform") and not clean.startswith("SuiteScript"):
                if clean not in mod_info['intro_paragraphs'] and not clean.endswith('Script Samples'):
                    mod_info['intro_paragraphs'].append(clean)

    # Split by H2 to extract sections and tables
    # Match headers h2
    h2_matches = list(re.finditer(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL))
    for i, m in enumerate(h2_matches):
        sec_title = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        if sec_title in ['In This Help Topic', 'Related Topics']:
            continue
            
        # Get content between this h2 and next h2
        start_idx = m.end()
        end_idx = h2_matches[i+1].start() if i + 1 < len(h2_matches) else len(html)
        sec_body = html[start_idx:end_idx]
        
        # Check for tables in this section
        tables_in_sec = []
        raw_tables = re.findall(r'<table[^>]*>(.*?)</table>', sec_body, re.DOTALL)
        
        for t in raw_tables:
            table_rows = []
            rows = re.findall(r'<tr[^>]*>(.*?)</tr>', t, re.DOTALL)
            for r in rows:
                cols = re.findall(r'<t[dh][^>]*>(.*?)</t[dh]>', r, re.DOTALL)
                clean_cols = [re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', c)).strip() for c in cols]
                if any(clean_cols):
                    table_rows.append(clean_cols)
            if table_rows:
                tables_in_sec.append(table_rows)
                
        # Also grab any explanatory paragraphs in sec_body
        sec_paras = []
        for p in re.findall(r'<p[^>]*>(.*?)</p>', sec_body, re.DOTALL):
            clean_p = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', p)).strip()
            if clean_p and len(clean_p) > 20:
                sec_paras.append(clean_p)
                
        mod_info['sections'].append({
            'title': sec_title,
            'paragraphs': sec_paras[:5], # top 5 paras
            'tables': tables_in_sec
        })

    parsed_data.append(mod_info)

print(f"Successfully parsed {len(parsed_data)} modules.")
with open('all_parsed_modules.json', 'w', encoding='utf-8') as out:
    json.dump(parsed_data, out, indent=2)

# Summarize stats
total_sections = sum(len(m['sections']) for m in parsed_data)
total_tables = sum(sum(len(s['tables']) for s in m['sections']) for m in parsed_data)
total_methods_members = 0
for m in parsed_data:
    for s in m['sections']:
        for t in s['tables']:
            # rows minus header
            total_methods_members += max(0, len(t) - 1)

print(f"Total sections extracted: {total_sections}")
print(f"Total member tables: {total_tables}")
print(f"Total methods/members documented: {total_methods_members}")
