import json
import os
import re
import shutil

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_6oct_audited.json')
if not os.path.exists(res_file):
    res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_6oct.json')

if not os.path.exists(res_file):
    print(f"Error: {res_file} does not exist yet.")
    exit(1)

with open(res_file, 'r', encoding='utf-8') as f:
    data_6oct = json.load(f)

map_6oct = {item['id']: item for item in data_6oct}
print(f"Loaded {len(map_6oct)} items for 06-Oct.")

# 1. Update timeline_summary.json
ts_path = os.path.join(REPO_DIR, 'timeline_summary.json')
if os.path.exists(ts_path):
    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_items = json.load(f)
    
    for item in ts_items:
        pid = item['id']
        if pid in map_6oct:
            res = map_6oct[pid]
            p_str = res.get('coto_precio_str')
            if p_str:
                formatted = f"${p_str}"
            else:
                p_num = res.get('coto_precio_num')
                formatted = f"${p_num:,.2f}".replace('.', ',') if p_num else "$---"
            item['prices']['6oct'] = formatted
            
    with open(ts_path, 'w', encoding='utf-8') as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
    with open(os.path.join(DESKTOP_DIR, 'timeline_summary.json'), 'w', encoding='utf-8') as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
    print("timeline_summary.json updated with 6oct prices.")

# 2. Update coto_top20_galeria.html
galeria_path = os.path.join(REPO_DIR, 'coto_top20_galeria.html')
with open(galeria_path, 'r', encoding='utf-8') as f:
    html = f.read()

html = html.replace("let currentDate = '5oct';", "let currentDate = '6oct';")
html = html.replace("let currentDate = '4oct';", "let currentDate = '6oct';")

if 'id="btnDate6oct"' not in html:
    html = html.replace('class="date-btn active"', 'class="date-btn"')
    btn_6oct_html = """        <button class="date-btn active" id="btnDate6oct" onclick="selectDate('6oct')">
          <i class="fa-solid fa-camera" style="color:#38bdf8;"></i> Scraper 06-Oct (Hoy Live)
        </button>\n"""
    if 'id="btnDate5oct"' in html:
        pos_5 = html.find('id="btnDate5oct"')
        pos_button_start = html.rfind('<button', 0, pos_5)
        if pos_button_start != -1:
            html = html[:pos_button_start] + btn_6oct_html + html[pos_button_start:]
    elif 'id="btnDate4oct"' in html:
        pos_4 = html.find('id="btnDate4oct"')
        pos_button_start = html.rfind('<button', 0, pos_4)
        if pos_button_start != -1:
            html = html[:pos_button_start] + btn_6oct_html + html[pos_button_start:]

if "document.getElementById('btnDate6oct')" not in html:
    html = html.replace(
        "document.getElementById('btnDate5oct')?.classList.toggle('active', dateKey === '5oct');",
        "document.getElementById('btnDate6oct')?.classList.toggle('active', dateKey === '6oct');\n      document.getElementById('btnDate5oct')?.classList.toggle('active', dateKey === '5oct');"
    )

for pid, item6oct in map_6oct.items():
    p_str = item6oct.get('coto_precio_str')
    if p_str:
        coto_formatted = f"${p_str}"
    else:
        p_num = item6oct.get('coto_precio_num')
        coto_formatted = f"${p_num:,.2f}".replace('.', ',') if p_num else "$---"

    img_path = f"evidencias/coto_6oct/coto_{pid}.png?v=6oct"
    entry_6oct = f",\n          '6oct': {{ dateLabel: '06-Oct (Hoy Live)', coto: '{coto_formatted}', mc: '$1.125', img: '{img_path}' }}"
    
    pos_id = html.find(f"id:'{pid}'")
    if pos_id != -1:
        pos_5oct = html.find("'5oct':", pos_id)
        if pos_5oct != -1:
            pos_end_line = html.find("\n", pos_5oct)
            if pos_end_line != -1 and "'6oct':" not in html[pos_5oct:pos_5oct+400]:
                html = html[:pos_end_line] + entry_6oct + html[pos_end_line:]
        else:
            pos_4oct = html.find("'4oct':", pos_id)
            if pos_4oct != -1:
                pos_end_line = html.find("\n", pos_4oct)
                if pos_end_line != -1 and "'6oct':" not in html[pos_4oct:pos_4oct+400]:
                    html = html[:pos_end_line] + entry_6oct + html[pos_end_line:]

with open(galeria_path, 'w', encoding='utf-8') as f:
    f.write(html)
with open(os.path.join(DESKTOP_DIR, 'coto_top20_galeria.html'), 'w', encoding='utf-8') as f:
    f.write(html)

# Copy evidencias/coto_6oct to Desktop
ev_6oct_repo = os.path.join(REPO_DIR, "evidencias", "coto_6oct")
ev_6oct_desk = os.path.join(DESKTOP_DIR, "evidencias", "coto_6oct")
if os.path.exists(ev_6oct_repo):
    os.makedirs(ev_6oct_desk, exist_ok=True)
    for fname in os.listdir(ev_6oct_repo):
        shutil.copy2(os.path.join(ev_6oct_repo, fname), os.path.join(ev_6oct_desk, fname))

print("coto_top20_galeria.html and evidences updated and synced for 06-Oct!")
