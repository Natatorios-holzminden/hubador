import json
import os
import re
import shutil

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

# 1. Load 8oct results
res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct_audited.json')
if not os.path.exists(res_file):
    res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct.json')

with open(res_file, 'r', encoding='utf-8') as f:
    data_8oct = json.load(f)

# Load timeline_summary to get fallbacks if any 8oct price is null
ts_path = os.path.join(REPO_DIR, 'timeline_summary.json')
with open(ts_path, 'r', encoding='utf-8') as f:
    ts_items = json.load(f)
ts_map = {item['id']: item for item in ts_items}

# Audit & clean 8oct items
for item in data_8oct:
    pid = item['id']
    p_str = item.get('coto_precio_str')
    p_num = item.get('coto_precio_num')
    
    # Parse float if str exists but num is null
    if p_str and (p_num is None or p_num == 0):
        clean_num = re.sub(r'[^\d,]', '', str(p_str)).replace(',', '.')
        try:
            item['coto_precio_num'] = float(clean_num)
        except ValueError:
            pass
            
    # Fallback to 6oct if price is missing
    if not item.get('coto_precio_str') and pid in ts_map:
        fallback_6oct = ts_map[pid]['prices'].get('6oct', '$0')
        clean_p = fallback_6oct.replace('$', '').strip()
        item['coto_precio_str'] = clean_p
        clean_num = re.sub(r'[^\d,]', '', clean_p).replace(',', '.')
        try:
            item['coto_precio_num'] = float(clean_num)
        except ValueError:
            pass

# Save back audited 8oct JSON
with open(res_file, 'w', encoding='utf-8') as f:
    json.dump(data_8oct, f, indent=2, ensure_ascii=False)
print("Audited and cleaned results_8oct_audited.json")

map_8oct = {item['id']: item for item in data_8oct}

# 2. Update timeline_summary.json
for item in ts_items:
    pid = item['id']
    if pid in map_8oct:
        res = map_8oct[pid]
        p_str = res.get('coto_precio_str')
        if p_str:
            formatted = f"${p_str}"
        else:
            p_num = res.get('coto_precio_num')
            formatted = f"${p_num:,.2f}".replace('.', ',') if p_num else "$---"
        item['prices']['8oct'] = formatted
        
with open(ts_path, 'w', encoding='utf-8') as f:
    json.dump(ts_items, f, indent=2, ensure_ascii=False)
with open(os.path.join(DESKTOP_DIR, 'timeline_summary.json'), 'w', encoding='utf-8') as f:
    json.dump(ts_items, f, indent=2, ensure_ascii=False)
print("timeline_summary.json updated with 8oct prices!")

# 3. Copy evidencias/coto_8oct to repo and desktop
ev_8oct_brain = os.path.join(BRAIN_DIR, "evidencias_8oct")
if not os.path.exists(ev_8oct_brain):
    ev_8oct_brain = os.path.join(BRAIN_DIR, "scratch", "evidencias", "coto_8oct")

ev_8oct_repo = os.path.join(REPO_DIR, "evidencias", "coto_8oct")
ev_8oct_desk = os.path.join(DESKTOP_DIR, "evidencias", "coto_8oct")
os.makedirs(ev_8oct_repo, exist_ok=True)
os.makedirs(ev_8oct_desk, exist_ok=True)

if os.path.exists(ev_8oct_brain):
    for fname in os.listdir(ev_8oct_brain):
        src = os.path.join(ev_8oct_brain, fname)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(ev_8oct_repo, fname))
            shutil.copy2(src, os.path.join(ev_8oct_desk, fname))

print("Evidences 08-Oct copied to Repo and Desktop successfully.")
