import json, sys
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\WORK\Documents\GitHub\hubador\comparador\timeline_summary.json', encoding='utf-8') as f:
    items = json.load(f)

def parse(p):
    if not p or p == '$---': return None
    c = p.replace('$', '').replace('.', '').replace(',', '.').split()[0]
    try: return float(c)
    except: return None

def fmt(v):
    return f"${v:,.2f}".replace(',', 'X').replace('.', ',').replace('X', '.')

print("==========================================================================")
print(" COMPARATIVA: HOY 13-OCT vs ÚLTIMA AUDITORÍA (08-OCT)")
print("==========================================================================")

subieron_8 = []
bajaron_8 = []
iguales_8 = []

for it in items:
    p8 = parse(it['prices'].get('8oct'))
    p13 = parse(it['prices'].get('13oct'))
    p6 = parse(it['prices'].get('6oct'))
    
    if p8 is not None and p13 is not None:
        diff = p13 - p8
        pct = (diff / p8) * 100
        row = {'name': it['name'], 'cat': it['cat'], 'atomic': it.get('atomic', False), 'p8': p8, 'p13': p13, 'diff': diff, 'pct': pct, 'p6': p6}
        if diff > 0.01: subieron_8.append(row)
        elif diff < -0.01: bajaron_8.append(row)
        else: iguales_8.append(row)

subieron_8.sort(key=lambda x: x['diff'], reverse=True)
bajaron_8.sort(key=lambda x: x['diff'])

print(f"\n[📉 BAJARON] ({len(bajaron_8)} productos)")
for r in bajaron_8:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p8'])} -> {fmt(r['p13'])} | Bajo {fmt(abs(r['diff']))} ({r['pct']:.1f}%)")

print(f"\n[📈 SUBIERON] ({len(subieron_8)} productos)")
for r in subieron_8:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p8'])} -> {fmt(r['p13'])} | Subio +{fmt(r['diff'])} (+{r['pct']:.1f}%)")

print(f"\n[➖ ESTABLES / SIN CAMBIO] ({len(iguales_8)} productos)")
for r in iguales_8:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p13'])}")

print("\n==========================================================================")
print(" COMPARATIVA DE SEMANA COMPLETA: HOY 13-OCT vs HACE 7 DÍAS (06-OCT)")
print("==========================================================================")

subieron_6 = []
bajaron_6 = []
iguales_6 = []

for it in items:
    p6 = parse(it['prices'].get('6oct'))
    p13 = parse(it['prices'].get('13oct'))
    if p6 is not None and p13 is not None:
        diff = p13 - p6
        pct = (diff / p6) * 100
        row = {'name': it['name'], 'p6': p6, 'p13': p13, 'diff': diff, 'pct': pct, 'atomic': it.get('atomic', False)}
        if diff > 0.01: subieron_6.append(row)
        elif diff < -0.01: bajaron_6.append(row)
        else: iguales_6.append(row)

subieron_6.sort(key=lambda x: x['diff'], reverse=True)
bajaron_6.sort(key=lambda x: x['diff'])

print(f"\n[📉 BAJARON RESPECTO AL 06-OCT] ({len(bajaron_6)} productos)")
for r in bajaron_6:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p6'])} -> {fmt(r['p13'])} | Bajo {fmt(abs(r['diff']))} ({r['pct']:.1f}%)")

print(f"\n[📈 SUBIERON RESPECTO AL 06-OCT] ({len(subieron_6)} productos)")
for r in subieron_6:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p6'])} -> {fmt(r['p13'])} | Subio +{fmt(r['diff'])} (+{r['pct']:.1f}%)")

print(f"\n[➖ ESTABLES RESPECTO AL 06-OCT] ({len(iguales_6)} productos)")
for r in iguales_6:
    at = " [ATOMIC]" if r['atomic'] else ""
    print(f"  * {r['name']}{at}: {fmt(r['p13'])}")
