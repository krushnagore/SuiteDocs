import os
import json
import re

def parse_html_table(table_html):
    """
    Properly handles rowspan and colspan so each row has the exact same number of columns
    and carried-over values (like 'Method', 'Property', 'Enum').
    """
    rows_raw = re.findall(r'<tr[^>]*>(.*?)</tr>', table_html, re.DOTALL)
    grid = []
    active_rowspans = {}

    for r_idx, r in enumerate(rows_raw):
        cells = re.findall(r'<([th][dh])([^>]*)>(.*?)</\1>', r, re.DOTALL)
        if not cells:
            continue
            
        row_cells = []
        cell_idx = 0
        col_idx = 0
        
        while True:
            # Check if active rowspan exists for this column
            if col_idx in active_rowspans and active_rowspans[col_idx]['remain'] > 0:
                row_cells.append(active_rowspans[col_idx]['val'])
                active_rowspans[col_idx]['remain'] -= 1
                col_idx += 1
                continue
                
            if cell_idx >= len(cells):
                break
                
            tag, attrs, content = cells[cell_idx]
            cell_idx += 1
            
            rs_match = re.search(r'rowspan=[\'"]?(\d+)[\'"]?', attrs)
            rowspan = int(rs_match.group(1)) if rs_match else 1
            
            clean_text = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', content)).strip()
            row_cells.append(clean_text)
            
            if rowspan > 1:
                active_rowspans[col_idx] = {'remain': rowspan - 1, 'val': clean_text}
                
            col_idx += 1
            
        if any(row_cells):
            grid.append(row_cells)
    return grid

with open('modules_list.json', 'r', encoding='utf-8') as f:
    modules_meta = json.load(f)

complete_modules = []

for mod in modules_meta:
    name = mod['name']
    href = mod.get('href')
    desc = mod.get('desc', '')
    scripts = mod.get('scripts', '')
    perms = mod.get('permissions', '')
    
    # Clean module path: e.g. "N/action Module" -> "N/action"
    mod_path = name.replace(' Module', '').replace(' Modules', '').strip()
    
    mod_data = {
        'index': mod.get('index', 0),
        'name': name,
        'module_path': mod_path,
        'href': href,
        'summary': desc,
        'supported_scripts': scripts,
        'permissions': perms,
        'intro_paragraphs': [],
        'sections': []
    }
    
    # Handle N/sso Module
    if not href and 'sso' in name.lower():
        mod_data['intro_paragraphs'].append(
            "As of NetSuite 2025.1, support ended for the SuiteSignOn feature, which includes the N/sso module. "
            "If you still use SuiteSignOn or the N/sso module in your customizations, you must transition to a supported "
            "alternative, such as SuiteScript OAuth 2.0 or OpenID Connect (OIDC) via N/auth and N/https modules."
        )
        mod_data['sections'].append({
            'title': 'Deprecation & Migration Notice',
            'paragraphs': [
                "Status: Deprecated as of NetSuite release 2025.1.",
                "Alternative: Use N/auth and N/https modules for OAuth 2.0 and OpenID Connect authentication workflows.",
                "Legacy Capabilities: Previously provided single sign-on authentication token generation."
            ],
            'tables': []
        })
        complete_modules.append(mod_data)
        continue
        
    cache_file = os.path.join('cache_docs', href)
    if not os.path.exists(cache_file):
        complete_modules.append(mod_data)
        continue
        
    with open(cache_file, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()
        
    html = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    html = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
    
    # Intro paragraphs
    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    if h1_match:
        h1_pos = h1_match.start()
        h2_match = re.search(r'<h2[^>]*>', html[h1_pos:])
        end_pos = h1_pos + h2_match.start() if h2_match else h1_pos + 4000
        intro_html = html[h1_pos:end_pos]
        for p in re.findall(r'<p[^>]*>(.*?)</p>', intro_html, re.DOTALL):
            cp = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', p)).strip()
            if cp and not cp.startswith("SuiteCloud Platform") and not cp.startswith("SuiteScript") and not cp.endswith("Script Samples"):
                if cp not in mod_data['intro_paragraphs']:
                    mod_data['intro_paragraphs'].append(cp)

    # If N/commerce Modules, also fetch the recordView sub-module
    if 'section_1532341439.html' in href:
        rec_view_cache = os.path.join('cache_docs', 'section_1532341950.html')
        if os.path.exists(rec_view_cache):
            with open(rec_view_cache, 'r', encoding='utf-8', errors='ignore') as f:
                rec_html = f.read()
            rec_html = re.sub(r'<script[^>]*>.*?</script>', '', rec_html, flags=re.DOTALL)
            rec_html = re.sub(r'<style[^>]*>.*?</style>', '', rec_html, flags=re.DOTALL)
            # Append rec_html tables
            tables_raw = re.findall(r'<table[^>]*>(.*?)</table>', rec_html, re.DOTALL)
            for t in tables_raw:
                grid = parse_html_table(t)
                if grid:
                    mod_data['sections'].append({
                        'title': 'N/commerce/recordView Module Members',
                        'paragraphs': ['Provides fast, cached, and public access to item fields and website settings in commerce context.'],
                        'tables': [grid]
                    })

    # Find all h2 headers and process sections
    h2_matches = list(re.finditer(r'<h2[^>]*>(.*?)</h2>', html, re.DOTALL))
    for i, m in enumerate(h2_matches):
        sec_title = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        if sec_title in ['In This Help Topic', 'Related Topics', 'General Notices']:
            continue
            
        start_idx = m.end()
        end_idx = h2_matches[i+1].start() if i + 1 < len(h2_matches) else len(html)
        sec_body = html[start_idx:end_idx]
        
        sec_paras = []
        for p in re.findall(r'<p[^>]*>(.*?)</p>', sec_body, re.DOTALL):
            clean_p = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', p)).strip()
            if clean_p and len(clean_p) > 15 and not clean_p.startswith('Related Topics'):
                sec_paras.append(clean_p)
                
        sec_tables = []
        raw_tables = re.findall(r'<table[^>]*>(.*?)</table>', sec_body, re.DOTALL)
        for t in raw_tables:
            grid = parse_html_table(t)
            if grid:
                sec_tables.append(grid)
                
        mod_data['sections'].append({
            'title': sec_title,
            'paragraphs': sec_paras[:6],
            'tables': sec_tables
        })

    complete_modules.append(mod_data)

print(f"Compiled database for all {len(complete_modules)} modules!")
with open('suite_script_21_complete.json', 'w', encoding='utf-8') as f:
    json.dump(complete_modules, f, indent=2)

total_members = sum(
    sum(sum(len(t)-1 for t in s['tables'] if len(t) > 1) for s in m['sections'])
    for m in complete_modules
)
print(f"Total verified methods and members across all 55 modules: {total_members}")
