import json, os, re

repo_dir = r'C:\Users\WORK\Documents\GitHub\hubador\comparador'
brain_dir = r'C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19'

f5 = os.path.join(brain_dir, 'scratch', 'results_5oct_audited.json')
if not os.path.exists(f5): f5 = os.path.join(brain_dir, 'scratch', 'results_5oct.json')
with open(f5, encoding='utf-8') as f: data_5 = json.load(f)

f6 = os.path.join(brain_dir, 'scratch', 'results_6oct_audited.json')
if not os.path.exists(f6): f6 = os.path.join(brain_dir, 'scratch', 'results_6oct.json')
with open(f6, encoding='utf-8') as f: data_6 = json.load(f)

map5 = {x['id']: x for x in data_5}
map6 = {x['id']: x for x in data_6}

def parse_p(raw):
    if not raw: return 0.0
    s = re.sub(r'[^\d,]', '', str(raw)).replace(',', '.')
    try: return float(s)
    except: return 0.0

diffs = []
for pid in sorted(map6.keys()):
    item6 = map6[pid]
    item5 = map5.get(pid, {})
    name = item6['nombre']
    cat = item6['categoria']
    
    p5_str = item5.get('coto_precio_str') or item5.get('coto_precio_num')
    p6_str = item6.get('coto_precio_str') or item6.get('coto_precio_num')
    
    p5_val = parse_p(p5_str)
    p6_val = parse_p(p6_str)
    
    diff = p6_val - p5_val
    pct = ((p6_val - p5_val) / p5_val * 100) if p5_val > 0 else 0.0
    
    diffs.append({
        'id': pid,
        'name': name,
        'cat': cat,
        'p5': p5_val,
        'p6': p6_val,
        'diff': diff,
        'pct': pct
    })

print("=== COMPARATIVA DE PRECIOS COTO: 5 DE OCTUBRE VS 6 DE OCTUBRE ===\n")
aumentos = [x for x in diffs if x['diff'] > 0]
bajas = [x for x in diffs if x['diff'] < 0]
iguales = [x for x in diffs if x['diff'] == 0]

print(f"Total productos auditados: {len(diffs)}")
print(f"[AUMENTOS] Subieron de precio: {len(aumentos)}")
print(f"[BAJAS] Bajaron de precio: {len(bajas)}")
print(f"[SIN CAMBIOS] Mantuvieron precio: {len(iguales)}\n")

if aumentos:
    print("--- PRODUCTOS QUE SUBIERON DE PRECIO ---")
    for x in aumentos:
        print(f"{x['name']:30} | 5-Oct: ${x['p5']:>8,.2f} | 6-Oct: ${x['p6']:>8,.2f} | Var: +${x['diff']:>7,.2f} (+{x['pct']:.1f}%)")

if bajas:
    print("\n--- PRODUCTOS QUE BAJARON DE PRECIO ---")
    for x in bajas:
        print(f"{x['name']:30} | 5-Oct: ${x['p5']:>8,.2f} | 6-Oct: ${x['p6']:>8,.2f} | Var: -${abs(x['diff']):>7,.2f} ({x['pct']:.1f}%)")

print("\n--- PRODUCTOS QUE MANTUVIERON PRECIO ---")
for x in iguales:
    print(f"{x['name']:30} | Precio: ${x['p6']:>8,.2f}")
