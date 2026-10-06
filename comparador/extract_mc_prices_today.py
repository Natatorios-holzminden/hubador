import urllib.request, ssl, re, json

ctx = ssl._create_unverified_context()
headers = {'User-Agent': 'Mozilla/5.0'}

items = [
    ('Pera', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/PERA/PACKHAM%27S'),
    ('Manzana', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/MANZANA/RED%20DELICI'),
    ('Frutilla', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/FRUTILLA/'),
    ('Mandarina', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/MANDARINA/MURCOT'),
    ('Naranja jugo', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/NARANJA/SALUSTIANA'),
    ('Tomate perita', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/TOMATE/PERITA'),
    ('Tomate cherry', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/TOMATE/CHERRY'),
    ('Tomate redondo grande', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/TOMATE/REDONDO'),
    ('Palta', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/PALTA/HASS'),
    ('Mango', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/MANGO/'),
    ('Papa', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/PAPA/SPUNTA'),
    ('Cebolla', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/CEBOLLA/VALENCIANI'),
    ('Berenjena', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/BERENJENA/VTA.MED.LA'),
    ('Zucchini', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/ZAPALLITO/ZUCCHINI'),
    ('Repollo blanco', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/REPOLLO/BLANCO'),
    ('Lechuga', 'https://preciosdelcentral.com.ar/buenosaires/detalles45/LECHUGA/CRIOLLA')
]

mc_prices = {}

for name, url in items:
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=6) as resp:
            html = resp.read().decode('utf-8', errors='ignore')
            m = re.search(r'var chartData\s*=\s*(\{.*?\});', html)
            if m:
                cd = json.loads(m.group(1))
                labels = cd.get('labels', [])
                datasets = cd.get('datasets', [])
                
                # Iterate from latest to oldest
                for last_idx in range(len(labels)-1, -1, -1):
                    vals = [ds['data'][last_idx] for ds in datasets if len(ds.get('data', [])) > last_idx and ds['data'][last_idx] is not None]
                    if vals:
                        price_val = float(vals[0])
                        date_lbl = labels[last_idx]
                        mc_prices[name] = {'price': price_val, 'date': date_lbl}
                        print(f"{name:22} | {date_lbl} | MC: ${price_val:,.2f}")
                        break
    except Exception as e:
        print(f"{name:22} | Error: {e}")

print("\n--- Summary of fetched MC prices ---")
print(json.dumps(mc_prices, indent=2, ensure_ascii=False))
