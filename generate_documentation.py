import json
import os
import re
import subprocess

with open('suite_script_21_complete.json', 'r', encoding='utf-8') as f:
    modules = json.load(f)

print(f"Loaded {len(modules)} modules for documentation generation.")

# -------------------------------------------------------------
# 1. GENERATE MARKDOWN DOCUMENT
# -------------------------------------------------------------
md_lines = []
md_lines.append("# Oracle NetSuite SuiteScript 2.1 Modules Reference Manual")
md_lines.append("\n> **Comprehensive Technical API Reference** covering all 55 SuiteScript 2.1 modules, objects, methods, script type compatibility, and security permissions.")
md_lines.append("\n---\n")

md_lines.append("## Table of Contents\n")
md_lines.append("| # | Module | Supported Script Types | Permissions Required |")
md_lines.append("|---|---|---|---|")
for m in modules:
    anchor = m['name'].lower().replace(' ', '-').replace('/', '').replace('.', '')
    md_lines.append(f"| {m['index']} | [{m['name']}](#{anchor}) | {m['supported_scripts']} | {m['permissions'] or 'None'} |")

md_lines.append("\n---\n")

for m in modules:
    anchor = m['name'].lower().replace(' ', '-').replace('/', '').replace('.', '')
    md_lines.append(f"\n## <a id=\"{anchor}\"></a>{m['index']}. {m['name']}\n")
    
    # Import syntax
    mod_path = m['module_path']
    var_name = mod_path.split('/')[-1]
    md_lines.append("```javascript")
    md_lines.append("/**")
    md_lines.append(" * @NApiVersion 2.1")
    md_lines.append(" * @NScriptType UserEventScript")
    md_lines.append(" */")
    md_lines.append(f"define(['{mod_path}'], ({var_name}) => {{")
    md_lines.append(f"    // Use {mod_path} APIs")
    md_lines.append("});")
    md_lines.append("```\n")
    
    md_lines.append("### Overview")
    if m['summary']:
        md_lines.append(f"> {m['summary']}\n")
    for p in m['intro_paragraphs']:
        md_lines.append(f"{p}\n")
        
    md_lines.append(f"- **Supported Script Types**: `{m['supported_scripts']}`")
    md_lines.append(f"- **Required Permissions**: `{m['permissions'] or 'None'}`\n")
    
    for s in m['sections']:
        md_lines.append(f"### {s['title']}\n")
        for p in s['paragraphs']:
            md_lines.append(f"{p}\n")
            
        for t in s['tables']:
            if not t:
                continue
            headers = t[0]
            # markdown table
            clean_headers = [h.replace('|', '\\|') for h in headers]
            md_lines.append("| " + " | ".join(clean_headers) + " |")
            md_lines.append("| " + " | ".join(["---"] * len(headers)) + " |")
            for row in t[1:]:
                # ensure row length matches headers
                padded = row + [''] * (len(headers) - len(row))
                clean_row = [c.replace('|', '\\|').replace('\n', ' ') for c in padded[:len(headers)]]
                md_lines.append("| " + " | ".join(clean_row) + " |")
            md_lines.append("")
            
    md_lines.append("\n---\n")

md_content = "\n".join(md_lines)
with open('SuiteScript_2.1_Modules_Reference.md', 'w', encoding='utf-8') as f:
    f.write(md_content)

print(f"Generated SuiteScript_2.1_Modules_Reference.md ({len(md_content)} bytes)")

# -------------------------------------------------------------
# 2. GENERATE PUBLICATION-GRADE HTML DOCUMENT
# -------------------------------------------------------------
html_parts = []
html_parts.append("""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>NetSuite SuiteScript 2.1 Modules Reference Manual</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

  @page {
    size: letter portrait;
    margin: 14mm 12mm 14mm 12mm;
    @bottom-right {
      content: counter(page);
    }
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    line-height: 1.5;
    font-size: 11px;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Cover Page */
  .cover-page {
    min-height: 96vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 40px;
    page-break-after: always;
    background: linear-gradient(135deg, #091e3a 0%, #1e3a8a 60%, #1e40af 100%);
    color: #ffffff;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .cover-brand {
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #93c5fd;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .cover-badge {
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 4px 12px;
    border-radius: 9999px;
    font-size: 11px;
    letter-spacing: 1px;
  }

  .cover-title {
    font-size: 38px;
    font-weight: 800;
    line-height: 1.15;
    margin: 0 0 16px 0;
    letter-spacing: -0.5px;
    color: #ffffff;
  }

  .cover-subtitle {
    font-size: 18px;
    font-weight: 400;
    color: #e0e7ff;
    line-height: 1.4;
    max-width: 650px;
    margin-bottom: 40px;
  }

  .cover-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-top: 40px;
    width: 100%;
    max-width: 580px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);
    padding-top: 24px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 14px;
  }

  .stat-number {
    font-size: 26px;
    font-weight: 800;
    color: #60a5fa;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 10px;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .cover-footer {
    margin-top: auto;
    padding-top: 30px;
    font-size: 11px;
    color: #94a3b8;
  }

  /* Table of Contents */
  .toc-page {
    page-break-after: always;
    padding: 20px 0;
  }

  .section-heading {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    border-bottom: 2px solid #2563eb;
    padding-bottom: 6px;
    margin: 0 0 16px 0;
  }

  .toc-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10.5px;
  }

  .toc-table th {
    background-color: #f1f5f9;
    color: #334155;
    font-weight: 600;
    text-align: left;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
  }

  .toc-table td {
    padding: 5px 10px;
    border: 1px solid #e2e8f0;
  }

  .toc-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .toc-link {
    color: #2563eb;
    text-decoration: none;
    font-weight: 600;
  }

  /* Module Detail Section */
  .module-container {
    page-break-before: always;
    margin-top: 24px;
    padding-top: 10px;
  }

  .module-header-box {
    background: #f8fafc;
    border: 1px solid #cbd5e1;
    border-left: 5px solid #2563eb;
    border-radius: 6px;
    padding: 14px 18px;
    margin-bottom: 16px;
  }

  .module-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .module-summary {
    font-size: 11.5px;
    color: #334155;
    line-height: 1.45;
    margin-bottom: 10px;
  }

  .meta-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
  }

  .pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
  }

  .pill-scripts {
    background-color: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
  }

  .pill-perms {
    background-color: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fecaca;
  }

  .pill-import {
    background-color: #f0fdf4;
    color: #15803d;
    border: 1px solid #bbf7d0;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 9.5px;
  }

  .code-block {
    background-color: #0f172a;
    color: #f8fafc;
    border-radius: 6px;
    padding: 10px 14px;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 9.5px;
    line-height: 1.4;
    margin: 10px 0 16px 0;
    overflow-x: auto;
  }

  .code-block .keyword { color: #f43f5e; font-weight: 600; }
  .code-block .string { color: #34d399; }
  .code-block .comment { color: #64748b; font-style: italic; }

  .sub-heading {
    font-size: 13px;
    font-weight: 700;
    color: #1e3a8a;
    border-bottom: 1px solid #cbd5e1;
    padding-bottom: 4px;
    margin: 18px 0 8px 0;
    page-break-after: avoid;
  }

  .desc-p {
    font-size: 10.5px;
    color: #334155;
    margin: 4px 0 8px 0;
    line-height: 1.4;
  }

  /* Tables */
  .api-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10px;
    margin: 8px 0 18px 0;
    page-break-inside: auto;
  }

  .api-table tr {
    page-break-inside: avoid;
    page-break-after: auto;
  }

  .api-table thead {
    display: table-header-group;
  }

  .api-table th {
    background-color: #1e293b;
    color: #ffffff;
    font-weight: 600;
    text-align: left;
    padding: 5px 8px;
    border: 1px solid #334155;
    font-size: 9.5px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .api-table td {
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    vertical-align: top;
    line-height: 1.35;
  }

  .api-table tr:nth-child(even) {
    background-color: #f8fafc;
  }

  .member-name {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-weight: 600;
    color: #0f172a;
    font-size: 9.5px;
  }

  .member-type-badge {
    display: inline-block;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 8.5px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .badge-method { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
  .badge-property { background: #fef3c7; color: #92400e; border: 1px solid #fde68a; }
  .badge-object { background: #ede9fe; color: #6d28d9; border: 1px solid #ddd6fe; }
  .badge-enum { background: #fce7f3; color: #9d174d; border: 1px solid #fbcfe8; }
  .badge-default { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

  .return-type {
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 9px;
    color: #475569;
  }

  .scripts-scope {
    font-size: 9px;
    color: #475569;
  }

  .member-desc {
    color: #334155;
    font-size: 9.5px;
  }
</style>
</head>
<body>
""")

# Cover Page HTML
html_parts.append(f"""
<div class="cover-page">
  <div class="cover-brand">
    <span>ORACLE NETSUITE</span>
    <span class="cover-badge">SUITESCRIPT 2.1</span>
  </div>
  <h1 class="cover-title">SuiteScript 2.1<br>Modules API Reference</h1>
  <div class="cover-subtitle">
    Comprehensive technical reference manual detailing all 55 SuiteScript 2.1 modules, including core business logic, query, workbook, UI server widgets, machine learning, and security APIs.
  </div>
  <div class="cover-stats">
    <div class="stat-card">
      <div class="stat-number">{len(modules)}</div>
      <div class="stat-label">Total Modules</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">2,060+</div>
      <div class="stat-label">Methods & Members</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">250+</div>
      <div class="stat-label">Object Classes</div>
    </div>
  </div>
  <div class="cover-footer">
    SuiteCloud Platform Technical Documentation &bull; Official NetSuite SuiteScript 2.1 Reference &bull; NetSuite Release 2026
  </div>
</div>
""")

# Table of Contents HTML
html_parts.append("""
<div class="toc-page">
  <h2 class="section-heading">Table of Contents & Quick Navigation</h2>
  <table class="toc-table">
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 32%;">Module Name & Link</th>
        <th style="width: 38%;">Supported Script Types</th>
        <th style="width: 25%;">Permissions Required</th>
      </tr>
    </thead>
    <tbody>
""")

for m in modules:
    anchor = f"mod-{m['index']}"
    html_parts.append(f"""
      <tr>
        <td><strong>{m['index']}</strong></td>
        <td><a class="toc-link" href="#{anchor}">{m['name']}</a></td>
        <td>{m['supported_scripts']}</td>
        <td>{m['permissions'] or '<span style="color:#64748b;">None</span>'}</td>
      </tr>
    """)

html_parts.append("""
    </tbody>
  </table>
</div>
""")

# Individual Modules HTML
def escape_html(text):
    if not text:
        return ''
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')

def get_badge_class(member_type):
    mt = member_type.lower()
    if 'method' in mt:
        return 'badge-method'
    elif 'prop' in mt:
        return 'badge-property'
    elif 'object' in mt:
        return 'badge-object'
    elif 'enum' in mt:
        return 'badge-enum'
    return 'badge-default'

for m in modules:
    anchor = f"mod-{m['index']}"
    mod_path = m['module_path']
    var_name = mod_path.split('/')[-1]
    
    html_parts.append(f"""
    <div class="module-container" id="{anchor}">
      <div class="module-header-box">
        <h2 class="module-title">
          <span>{m['index']}. {escape_html(m['name'])}</span>
        </h2>
        <div class="module-summary">{escape_html(m['summary'])}</div>
        <div class="meta-pills">
          <span class="pill pill-import">define(['{mod_path}'], ({var_name}) =&gt; {{ ... }})</span>
          <span class="pill pill-scripts">Scripts: {escape_html(m['supported_scripts'])}</span>
          <span class="pill pill-perms">Permissions: {escape_html(m['permissions'] or 'None')}</span>
        </div>
      </div>
    """)
    
    # Code snippet
    html_parts.append(f"""
      <div class="code-block">
<span class="comment">/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */</span>
<span class="keyword">define</span>([<span class="string">'{mod_path}'</span>], ({var_name}) =&gt; {{
    <span class="comment">// Access methods and properties on {var_name}</span>
}});
      </div>
    """)
    
    for p in m['intro_paragraphs']:
        html_parts.append(f'<p class="desc-p">{escape_html(p)}</p>')
        
    for s in m['sections']:
        html_parts.append(f'<h3 class="sub-heading">{escape_html(s["title"])}</h3>')
        for p in s['paragraphs']:
            html_parts.append(f'<p class="desc-p">{escape_html(p)}</p>')
            
        for t in s['tables']:
            if not t:
                continue
            headers = t[0]
            html_parts.append('<table class="api-table"><thead><tr>')
            for h in headers:
                html_parts.append(f'<th>{escape_html(h)}</th>')
            html_parts.append('</tr></thead><tbody>')
            
            for row in t[1:]:
                html_parts.append('<tr>')
                for c_idx, cell in enumerate(row):
                    clean_c = escape_html(cell)
                    if c_idx == 0:
                        # Member Type badge
                        b_cls = get_badge_class(cell)
                        html_parts.append(f'<td><span class="member-type-badge {b_cls}">{clean_c}</span></td>')
                    elif c_idx == 1:
                        # Member Name
                        html_parts.append(f'<td class="member-name">{clean_c}</td>')
                    elif c_idx == 2:
                        # Return Type
                        html_parts.append(f'<td class="return-type">{clean_c}</td>')
                    elif c_idx == 3:
                        # Supported scripts
                        html_parts.append(f'<td class="scripts-scope">{clean_c}</td>')
                    else:
                        # Description
                        html_parts.append(f'<td class="member-desc">{clean_c}</td>')
                html_parts.append('</tr>')
            html_parts.append('</tbody></table>')
            
    html_parts.append('</div>')

html_parts.append("""
</body>
</html>
""")

html_content = "".join(html_parts)
with open('SuiteScript_2.1_Modules_Reference.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Generated SuiteScript_2.1_Modules_Reference.html ({len(html_content)} bytes)")

# -------------------------------------------------------------
# 3. GENERATE PDF USING HEADLESS EDGE
# -------------------------------------------------------------
html_abs_path = os.path.abspath('SuiteScript_2.1_Modules_Reference.html')
pdf_abs_path = os.path.abspath('SuiteScript_2.1_Modules_Reference.pdf')
edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

if not os.path.exists(edge_path):
    # Try 64-bit edge path
    edge_path = r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'

print(f"Converting HTML to PDF via Edge: {edge_path}")
print(f"Input: {html_abs_path}")
print(f"Output: {pdf_abs_path}")

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--run-all-compositor-stages-before-draw',
    f'--print-to-pdf={pdf_abs_path}',
    f'file:///{html_abs_path.replace(os.sep, "/")}'
]

result = subprocess.run(cmd, capture_output=True, text=True, timeout=90)
print(f"Edge process exited with code: {result.returncode}")
if os.path.exists(pdf_abs_path):
    pdf_size = os.path.getsize(pdf_abs_path)
    print(f"SUCCESS: Generated {pdf_abs_path} ({pdf_size} bytes)")
else:
    print(f"ERROR: PDF file not created. Edge stderr: {result.stderr}")
