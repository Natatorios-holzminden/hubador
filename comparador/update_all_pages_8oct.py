import json
import os
import re
import shutil

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct_audited.json')
if not os.path.exists(res_file):
    res_file = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct.json')

if not os.path.exists(res_file):
    print(f"Error: {res_file} does not exist yet.")
    exit(1)

with open(res_file, 'r', encoding='utf-8') as f:
    data_8oct = json.load(f)

map_8oct = {item['id']: item for item in data_8oct}
print(f"Loaded {len(map_8oct)} items for 08-Oct.")

# 1. Update timeline_summary.json
ts_path = os.path.join(REPO_DIR, 'timeline_summary.json')
if os.path.exists(ts_path):
    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_items = json.load(f)
    
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
    print("timeline_summary.json updated with 8oct prices.")

# Copy evidencias/coto_8oct to Desktop
ev_8oct_repo = os.path.join(REPO_DIR, "evidencias", "coto_8oct")
ev_8oct_desk = os.path.join(DESKTOP_DIR, "evidencias", "coto_8oct")
if os.path.exists(ev_8oct_repo):
    os.makedirs(ev_8oct_desk, exist_ok=True)
    for fname in os.listdir(ev_8oct_repo):
        shutil.copy2(os.path.join(ev_8oct_repo, fname), os.path.join(ev_8oct_desk, fname))

print("08-Oct evidences copied and synced!")
