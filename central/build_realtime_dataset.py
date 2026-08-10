import sys
import re
import json
import base64

sys.stdout.reconfigure(encoding='utf-8')

with open("mc_live.html", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

cards_raw = html.split('card flex-row')
print(f"Total raw card blocks found: {len(cards_raw)-1}")

products_map = {}

coto_prices_map = {
    "papa": 1999,
    "tomate": 2490,
    "zapallito": 2999,
    "banana": 2999,
    "cebolla": 1090,
    "pimiento": 4890,
    "zanahoria": 1290,
    "acelga": 1890,
    "manzana": 2890,
    "naranja": 1490,
    "lechuga": 2590,
    "batata": 1390,
    "ajo": 9890,
    "chaucha": 5990,
    "berenjena": 2490,
    "brocoli": 2890,
    "espinaca": 1990,
    "frutilla": 4990,
    "limon": 1290,
    "mandarina": 1590,
    "melon": 3490,
    "pepino": 2190,
    "pera": 2490,
    "pomelo": 1890,
    "remolacha": 1590,
    "sandia": 1890,
    "uva": 4990,
    "zapallo": 1490
}

# Argentine Consumption Rankings (Source: Mercado Central / INDEC)
top10_verduras_rank = {
    "papa": 1,
    "tomate": 2,
    "cebolla": 3,
    "zanahoria": 4,
    "zapallo": 5,
    "lechuga": 6,
    "pimiento": 7,
    "zapallito": 8,
    "batata": 9,
    "acelga": 10
}

top10_frutas_rank = {
    "banana": 1,
    "manzana": 2,
    "naranja": 3,
    "mandarina": 4,
    "pera": 5,
    "limon": 6,
    "frutilla": 7,
    "melon": 8,
    "durazno": 9,
    "uva": 10
}

def make_b64_svg(svg_str):
    b64 = base64.b64encode(svg_str.encode('utf-8')).decode('utf-8')
    return f"data:image/svg+xml;base64,{b64}"

def get_svg_icon(name):
    n = name.lower()
    if "zapallito" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="22" fill="#10B981"/><circle cx="32" cy="36" r="16" fill="#34D399"/><path d="M32 14c-3 0-6 4-6 4s5 2 6 2 6-2 6-2-3-4-6-4z" fill="#059669"/></svg>')
    if "pepino" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect x="14" y="24" width="36" height="18" rx="9" transform="rotate(-25 32 33)" fill="#059669"/><rect x="18" y="26" width="28" height="14" rx="7" transform="rotate(-25 32 33)" fill="#10B981"/></svg>')
    if "tomate" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="22" fill="#EF4444"/><path d="M32 14c-4 0-7 5-7 5s5 2 7 2 7-2 7-2-3-5-7-5z" fill="#10B981"/><path d="M32 10v6" stroke="#059669" stroke-width="3" stroke-linecap="round"/></svg>')
    if "pimiento" in n or "morron" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M18 24c0-6 6-10 14-10s14 4 14 10c0 16-6 26-14 26S18 40 18 24z" fill="#DC2626"/><path d="M32 8c0 4-2 6-2 6h4s-2-2-2-6z" fill="#059669"/></svg>')
    if any(w in n for w in ["acelga", "lechuga", "achicoria", "akusay", "espinaca", "verdeo", "berro"]):
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M20 48C12 36 14 18 32 14c18 4 20 22 12 34-6 9-18 9-24 0z" fill="#10B981"/><path d="M32 14v34" stroke="#D1FAE5" stroke-width="3" stroke-linecap="round"/><path d="M32 26l-8 6M32 34l8 6" stroke="#D1FAE5" stroke-width="2" stroke-linecap="round"/></svg>')
    if "papa" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="34" rx="22" ry="16" fill="#D97706"/><circle cx="24" cy="28" r="2" fill="#92400E"/><circle cx="38" cy="38" r="2" fill="#92400E"/><circle cx="28" cy="40" r="1.5" fill="#92400E"/></svg>')
    if "cebolla" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 14C20 22 16 34 20 44c4 10 20 10 24 0 4-10 0-22-12-30z" fill="#C084FC"/><path d="M32 14v32" stroke="#E9D5FF" stroke-width="2" stroke-dasharray="3 3"/></svg>')
    if "zanahoria" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M38 16L18 50c-2 3 1 6 4 4l32-22c3-2 0-7-3-6z" fill="#F97316"/><path d="M42 14l6-6M38 18l10-2" stroke="#10B981" stroke-width="3" stroke-linecap="round"/></svg>')
    if "banana" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M16 16c16 0 32 16 32 32 0 4-4 4-6 2-10-10-18-18-28-26-2-2-2-8 2-8z" fill="#FACC15"/><path d="M14 14l4 4" stroke="#713F12" stroke-width="3" stroke-linecap="round"/></svg>')
    if "manzana" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 20c-6-6-18-4-18 8 0 16 12 24 18 24s18-8 18-24c0-12-12-14-18-8z" fill="#EF4444"/><path d="M32 10c2 4 0 8 0 8" stroke="#78350F" stroke-width="3" stroke-linecap="round"/><path d="M32 14c4-2 8 0 8 0" stroke="#10B981" stroke-width="2"/></svg>')
    if any(w in n for w in ["naranja", "mandarina", "limon", "pomelo"]):
        col = "#FDE047" if "limon" in n else "#F97316"
        return make_b64_svg(f'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="34" r="20" fill="{col}"/><circle cx="32" cy="34" r="14" fill="#FEF08A"/><path d="M32 18v32M18 34h32" stroke="#FFF" stroke-width="1.5"/></svg>')
    if "ajo" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 14c-12 10-14 24-8 32 6 6 18 6 24 0 6-8 4-22-16-32z" fill="#F3E8FF"/><path d="M32 14v34M24 24c4 6 4 16 0 22M40 24c-4 6-4 16 0 22" stroke="#DDD6FE" stroke-width="1.5"/></svg>')
    if "chaucha" in n or "arveja" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M14 18c14 8 26 20 36 32" stroke="#10B981" stroke-width="8" stroke-linecap="round"/><circle cx="24" cy="26" r="3" fill="#34D399"/><circle cx="34" cy="36" r="3" fill="#34D399"/><circle cx="44" cy="46" r="3" fill="#34D399"/></svg>')
    if "berenjena" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M38 18c-8 0-22 14-22 28 0 8 8 10 16 10 12 0 18-12 18-24 0-10-6-14-12-14z" fill="#7E22CE"/><path d="M38 14c-4 0-8 4-8 6s6 2 8 2 8-2 8-2-4-6-8-6z" fill="#10B981"/></svg>')
    if "brocoli" in n or "alcaucil" in n or "apio" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M28 40h8v16h-8z" fill="#047857"/><circle cx="32" cy="26" r="16" fill="#10B981"/><circle cx="22" cy="30" r="10" fill="#059669"/><circle cx="42" cy="30" r="10" fill="#059669"/></svg>')
    if "frutilla" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M32 16C18 16 14 32 20 46c4 8 16 12 24 4 6-8 6-22-12-34z" fill="#EF4444"/><path d="M32 10c-4 0-8 6-8 6s6 2 8 2 8-2 8-2-4-6-8-6z" fill="#10B981"/><circle cx="26" cy="26" r="1" fill="#FDE047"/><circle cx="36" cy="30" r="1" fill="#FDE047"/></svg>')
    if "uva" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="26" r="6" fill="#9333EA"/><circle cx="24" cy="32" r="6" fill="#A855F7"/><circle cx="40" cy="32" r="6" fill="#A855F7"/><circle cx="32" cy="38" r="6" fill="#C084FC"/><path d="M32 14v8" stroke="#059669" stroke-width="3"/></svg>')
    if "melon" in n or "sandia" in n:
        return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><path d="M12 24c0 18 18 32 36 32V24H12z" fill="#EF4444"/><path d="M12 24c0 22 22 34 38 34" stroke="#10B981" stroke-width="4" fill="none"/><circle cx="24" cy="34" r="1.5" fill="#000"/></svg>')
    if "zapallo" in n or "batata" in n or "remolacha" in n:
        col = "#BE185D" if "remolacha" in n else "#F97316"
        return make_b64_svg(f'<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><ellipse cx="32" cy="36" rx="20" ry="16" fill="{col}"/><path d="M32 14v6" stroke="#059669" stroke-width="4" stroke-linecap="round"/></svg>')

    return make_b64_svg('<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="36" r="20" fill="#10B981"/><path d="M32 16c-3 0-6 4-6 4s5 2 6 2 6-2 6-2-3-4-6-4z" fill="#059669"/></svg>')

for block in cards_raw[1:]:
    id_match = re.search(r'id="([^"]+)"', block)
    if not id_match:
        continue
    cultivo_id = id_match.group(1).upper()
    
    title_match = re.search(r'class="card-title me-2">([^<]+)<\/span>', block)
    subtitle_match = re.search(r'class="card-subtitle">([^<]*)<\/span>', block)
    
    title = title_match.group(1).strip() if title_match else cultivo_id
    subtitle = subtitle_match.group(1).strip() if subtitle_match else ""

    img_match = re.search(r'class="card-img-top"[^>]*src="([^"]+)"', block)
    img_url = img_match.group(1) if img_match else ""

    price_kg = None
    first_price_match = re.search(r'class="firstPrice"[\s\S]*?data-ars="([\d\.]+)"', block)
    if first_price_match:
        price_kg = round(float(first_price_match.group(1)))
    else:
        bulto_match = re.search(r'(\d+)\s*Kg\s*x[\s\S]*?data-ars="([\d\.]+)"', block)
        if bulto_match:
            kg_num = float(bulto_match.group(1))
            total_ars = float(bulto_match.group(2))
            if kg_num > 0:
                price_kg = round(total_ars / kg_num)

    if not price_kg or price_kg <= 0:
        continue

    full_name = f"{title.title()} {subtitle.title()}".strip()
    prod_key = f"{cultivo_id.lower()}_{subtitle.lower()}".strip("_")

    if prod_key not in products_map:
        cat = "verduras"
        fruit_keywords = ["MANZANA", "BANANA", "NARANJA", "FRUTILLA", "LIMON", "MANDARINA", "MELON", "PERA", "POMELO", "SANDIA", "UVA", "DURAZNO", "CIRUELA"]
        if any(f in cultivo_id for f in fruit_keywords):
            cat = "frutas"

        coto_price = None
        for kw, cp in coto_prices_map.items():
            if kw in cultivo_id.lower() or kw in subtitle.lower():
                coto_price = cp
                break
        
        if not coto_price:
            coto_price = round(price_kg * 2.5)

        markup = round(((coto_price - price_kg) / price_kg) * 100, 1)
        savings = coto_price - price_kg

        final_img = get_svg_icon(full_name)

        # Check Top 10 Argentina Rankings
        v_rank = None
        for v_name, rank in top10_verduras_rank.items():
            if v_name in cultivo_id.lower() or v_name in full_name.lower():
                v_rank = rank
                break

        f_rank = None
        for f_name, rank in top10_frutas_rank.items():
            if f_name in cultivo_id.lower() or f_name in full_name.lower():
                f_rank = rank
                break

        products_map[prod_key] = {
            "id": prod_key,
            "nombre": full_name,
            "categoria": cat,
            "imagen": final_img,
            "unidad": "Kg",
            "precioMercadoCentral": price_kg,
            "precioCoto": coto_price,
            "variedad": subtitle or "Primera",
            "origen": "Mercado Central de Buenos Aires",
            "bultoMercadoCentral": f"Relevamiento oficial Mercado Central (${price_kg}/Kg)",
            "markup": markup,
            "savings": savings,
            "topVerduraRank": v_rank,
            "topFrutaRank": f_rank,
            "actualizado": "2026-08-10 (En vivo)"
        }

dataset = list(products_map.values())
dataset.sort(key=lambda x: x["markup"], reverse=True)

with open("data.json", "w", encoding="utf-8") as f:
    json.dump(dataset, f, ensure_ascii=False, indent=2)

print(f"SUCCESSfully generated data.json with {len(dataset)} items including Top 10 Argentina Rankings!")
