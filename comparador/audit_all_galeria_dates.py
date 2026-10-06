import json, os, re

galeria_path = r'C:\Users\WORK\Documents\GitHub\hubador\comparador\coto_top20_galeria.html'
with open(galeria_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Let's check which products have 5oct and 6oct in galeria
items_in_galeria = re.findall(r'"id":\s*"([^"]+)"', html)
print(f"Total products in galeria JS: {len(items_in_galeria)}")

missing_5oct = []
missing_6oct = []

for pid in items_in_galeria:
    pos_id = html.find(f"id:'{pid}'")
    pos_end = html.find("},", pos_id)
    if pos_end == -1:
        pos_end = html.find("}]", pos_id)
    block = html[pos_id:pos_end+500]
    
    if '"5oct":' not in block:
        missing_5oct.append(pid)
    if '"6oct":' not in block:
        missing_6oct.append(pid)

print("Products missing 5oct in galeria:", missing_5oct)
print("Products missing 6oct in galeria:", missing_6oct)
