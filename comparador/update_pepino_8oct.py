import json
import os
import shutil

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

# 1. Update results_8oct_audited.json
audited_path = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct_audited.json')
with open(audited_path, 'r', encoding='utf-8') as f:
    audited_data = json.load(f)

for item in audited_data:
    if item['id'] == 'pepino':
        item['coto_precio_str'] = "1.529,15"
        item['coto_precio_num'] = 1529.15
        item['coto_info'] = "Pepino . Xkg PRECIO CON 15%DTO $1.529,15 Precio Regular: $1.799,00"
        item['fecha_captura'] = "08-10-2026"
        item['coto_img'] = "evidencias/coto_8oct/coto_pepino.png"

with open(audited_path, 'w', encoding='utf-8') as f:
    json.dump(audited_data, f, indent=2, ensure_ascii=False)

print("Updated pepino in results_8oct_audited.json to $1.529,15")

# Copy pepino screenshot to Desktop
src_img = os.path.join(REPO_DIR, "evidencias", "coto_8oct", "coto_pepino.png")
dst_img = os.path.join(DESKTOP_DIR, "evidencias", "coto_8oct", "coto_pepino.png")
if os.path.exists(src_img):
    os.makedirs(os.path.dirname(dst_img), exist_ok=True)
    shutil.copy2(src_img, dst_img)
    print("Copied fresh pepino screenshot to Desktop!")
