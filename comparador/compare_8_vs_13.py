import json

with open(r'C:\Users\WORK\Documents\GitHub\hubador\comparador\timeline_summary.json', encoding='utf-8') as f:
    items = json.load(f)

print(f"{'PRODUCTO':<28} | {'08-OCT':<12} | {'13-OCT (HOY)':<14} | {'VARIACIÓN'}")
print("-" * 75)
for it in items:
    p8 = it['prices'].get('8oct', '$---')
    p13 = it['prices'].get('13oct', '$---')
    
    def parse_num(s):
        if not s or s == '$---':
            return None
        clean = s.replace('$', '').replace('.', '').replace(',', '.').split()[0]
        try:
            return float(clean)
        except:
            return None

    n8 = parse_num(p8)
    n13 = parse_num(p13)
    
    if n8 is not None and n13 is not None:
        diff = n13 - n8
        if diff > 0:
            var = f"SUBIÓ (+${diff:,.2f})".replace(',', 'X').replace('.', ',').replace('X', '.')
        elif diff < 0:
            var = f"BAJÓ (-${abs(diff):,.2f})".replace(',', 'X').replace('.', ',').replace('X', '.')
        else:
            var = "IGUAL ($0)"
    else:
        var = "---"
        
    print(f"{it['name']:<28} | {p8:<12} | {p13:<14} | {var}")
