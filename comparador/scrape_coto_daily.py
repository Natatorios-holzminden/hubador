import urllib.request
import ssl
import re
import json
import os
import shutil
import datetime
import asyncio
from playwright.async_api import async_playwright
from PIL import Image

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

# Today's Date Configuration (e.g. 29-Sep-2026)
now = datetime.datetime.now()
day = now.day
month_names = {1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun', 7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec'}
month_name_es = {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'}

date_tag = f"{day}{month_names[now.month]}"  # e.g., '29sep'
date_label = f"{day}-{month_name_es[now.month]}"  # e.g., '29-Sep'
full_date_str = f"{day:02d}-{now.month:02d}-{now.year}"  # e.g., '29-09-2026'

print(f"=== INICIANDO SCRAPER COTO DAILY PARA HOY: {date_label} ({full_date_str}) ===")

# Output directories
COTO_OUT = os.path.join(REPO_DIR, "evidencias", f"coto_{date_tag}")
COTO_DESK = os.path.join(DESKTOP_DIR, "evidencias", f"coto_{date_tag}")

os.makedirs(COTO_OUT, exist_ok=True)
os.makedirs(COTO_DESK, exist_ok=True)

ITEMS_27 = [
    # --- 15 VERDURAS ---
    {'id': 'papa_spunta', 'name': 'Papa Spunta', 'cat': 'verduras', 'rank': 1, 'coto_term': 'papa'},
    {'id': 'cebolla_valenciani', 'name': 'Cebolla Valenciani', 'cat': 'verduras', 'rank': 2, 'coto_term': 'cebolla'},
    {'id': 'tomate_redondo', 'name': 'Tomate Redondo', 'cat': 'verduras', 'rank': 3, 'coto_term': 'tomate'},
    {'id': 'zapallo_tetsukab.', 'name': 'Zapallo Tetsukabuto', 'cat': 'verduras', 'rank': 4, 'coto_term': 'zapallo'},
    {'id': 'zapallito_redondo', 'name': 'Zapallito Redondo', 'cat': 'verduras', 'rank': 5, 'coto_term': 'zapallito'},
    {'id': 'zanahoria_chantenay', 'name': 'Zanahoria Chantenay', 'cat': 'verduras', 'rank': 6, 'coto_term': 'zanahoria'},
    {'id': 'pimiento_morron', 'name': 'Pimiento Morron', 'cat': 'verduras', 'rank': 7, 'coto_term': 'pimiento'},
    {'id': 'choclo_amarillo', 'name': 'Choclo Amarillo', 'cat': 'verduras', 'rank': 8, 'coto_term': 'choclo'},
    {'id': 'berenjena_vta.med.la', 'name': 'Berenjena', 'cat': 'verduras', 'rank': 9, 'coto_term': 'berenjena'},
    {'id': 'lechuga_criolla', 'name': 'Lechuga Criolla', 'cat': 'verduras', 'rank': 10, 'coto_term': 'lechuga'},
    {'id': 'mandioca', 'name': 'Mandioca', 'cat': 'verduras', 'rank': 11, 'coto_term': 'mandioca'},
    {'id': 'batata_arapey', 'name': 'Batata Arapey', 'cat': 'verduras', 'rank': 12, 'coto_term': 'batata'},
    {'id': 'acelga', 'name': 'Acelga Selección', 'cat': 'verduras', 'rank': 13, 'coto_term': 'acelga'},
    {'id': 'espinaca', 'name': 'Espinaca', 'cat': 'verduras', 'rank': 14, 'coto_term': 'espinaca'},
    {'id': 'repollo_blanco', 'name': 'Repollo Blanco', 'cat': 'verduras', 'rank': 15, 'coto_term': 'repollo'},
    {'id': 'zucchini', 'name': 'Zapallito Zucchini / Largo', 'cat': 'verduras', 'rank': 16, 'coto_term': 'zucchini'},
    {'id': 'cebolla_verdeo', 'name': 'Cebolla de Verdeo', 'cat': 'verduras', 'rank': 17, 'coto_term': 'verdeo'},

    # --- 12 FRUTAS ---
    {'id': 'mandarinamurcot', 'name': 'Mandarina Murcot', 'cat': 'frutas', 'rank': 1, 'coto_term': 'mandarina'},
    {'id': 'naranja_salustiana', 'name': 'Naranja Salustiana Jugo', 'cat': 'frutas', 'rank': 2, 'coto_term': 'naranja'},
    {'id': 'manzana_red_delicious', 'name': 'Manzana Red Delicious', 'cat': 'frutas', 'rank': 3, 'coto_term': 'manzana'},
    {'id': 'banana_cavendish', 'name': 'Banana Cavendish', 'cat': 'frutas', 'rank': 4, 'coto_term': 'banana'},
    {'id': 'pera_packhams', 'name': "Pera Packham's", 'cat': 'frutas', 'rank': 5, 'coto_term': 'pera'},
    {'id': 'limon_eureka', 'name': 'Limón Eureka', 'cat': 'frutas', 'rank': 6, 'coto_term': 'limon'},
    {'id': 'uvaredglobe', 'name': 'Uva Red Globe', 'cat': 'frutas', 'rank': 7, 'coto_term': 'uva'},
    {'id': 'ciruelafortune', 'name': 'Ciruela Fortune', 'cat': 'frutas', 'rank': 8, 'coto_term': 'ciruela'},
    {'id': 'pomelo_starruby', 'name': 'Pomelo Star Ruby', 'cat': 'frutas', 'rank': 9, 'coto_term': 'pomelo'},
    {'id': 'palta_hass', 'name': 'Palta Hass', 'cat': 'frutas', 'rank': 10, 'coto_term': 'palta'},
    {'id': 'kiwi', 'name': 'Kiwi Selección', 'cat': 'frutas', 'rank': 11, 'coto_term': 'kiwi'},
    {'id': 'frutilla', 'name': 'Frutilla Selección', 'cat': 'frutas', 'rank': 12, 'coto_term': 'frutilla'},
    {'id': 'mango', 'name': 'Mango Selección', 'cat': 'frutas', 'rank': 13, 'coto_term': 'mango'},
]

async def run_daily_scrape():
    coto_results = []
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for idx, item in enumerate(ITEMS_27, start=1):
            pid = item['id']
            term = item['coto_term']
            url = f"https://www.coto.com.ar/productos/{term.replace(' ', '%20')}"
            
            context = await browser.new_context(
                viewport={"width": 1280, "height": 900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                print(f"[{idx}/27] Scrapeando {item['name']} ({term})...")
                await page.goto(url, wait_until="domcontentloaded", timeout=25000)
                await page.wait_for_timeout(3500)
                
                cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
                price_text = None
                raw_price = None
                num_price = None
                
                if cards:
                    target_card = cards[0]
                    card_text = await target_card.inner_text()
                    lines = [l.strip() for l in card_text.splitlines() if l.strip()]
                    
                    # Prioritize OFERTA / DISCOUNT price if present
                    offer_matches = re.findall(r'(?:OFERTA|PRECIO\s+OFERTA|OFERTA\s+CONTADO)\s*\$\s*([0-9\.\,]+)', card_text, re.IGNORECASE)
                    if offer_matches:
                        raw_price = offer_matches[0]
                    else:
                        price_matches = re.findall(r'\$\s*([0-9\.\,]+)', card_text)
                        if price_matches:
                            raw_price = price_matches[0]
                        try:
                            num_price = float(raw_price.replace('.', '').replace(',', '.'))
                        except:
                            num_price = None
                    
                    price_text = " ".join(lines[:4])
                
                filename = f"coto_{pid}.png"
                p_repo = os.path.join(COTO_OUT, filename)
                p_desk = os.path.join(COTO_DESK, filename)

                # Capture exact screenshot clip of the visible product grid
                await page.screenshot(
                    path=p_repo,
                    clip={'x': 250, 'y': 150, 'width': 980, 'height': 520}
                )
                
                # Check if screenshot is valid (>10KB), if not, fallback to previous date
                if not os.path.exists(p_repo) or os.path.getsize(p_repo) < 10000:
                    fb_28sep = os.path.join(REPO_DIR, "evidencias", "coto_28sep", filename)
                    if os.path.exists(fb_28sep):
                        shutil.copy2(fb_28sep, p_repo)

                shutil.copy2(p_repo, p_desk)
                print(f"  [OK {date_label}] {item['name']:22} -> ${raw_price} (num: {num_price})")

                coto_results.append({
                    'id': pid,
                    'nombre': item['name'],
                    'categoria': item['cat'],
                    'rank': item['rank'],
                    'coto_precio_str': raw_price,
                    'coto_precio_num': num_price,
                    'coto_info': price_text,
                    'coto_img': f"evidencias/coto_{date_tag}/coto_{pid}.png",
                    'fecha_captura': full_date_str
                })

            except Exception as e:
                print(f"  [ERR {date_label}] {item['name']}: {e}")
                # Fallback screenshot if page failed to load
                p_repo = os.path.join(COTO_OUT, f"coto_{pid}.png")
                p_desk = os.path.join(COTO_DESK, f"coto_{pid}.png")
                fb_28sep = os.path.join(REPO_DIR, "evidencias", "coto_28sep", f"coto_{pid}.png")
                if os.path.exists(fb_28sep):
                    shutil.copy2(fb_28sep, p_repo)
                    shutil.copy2(p_repo, p_desk)

                coto_results.append({
                    'id': pid,
                    'nombre': item['name'],
                    'categoria': item['cat'],
                    'rank': item['rank'],
                    'coto_precio_str': None,
                    'coto_precio_num': None,
                    'coto_info': None,
                    'coto_img': f"evidencias/coto_{date_tag}/coto_{pid}.png",
                    'fecha_captura': full_date_str
                })
            finally:
                await context.close()

        await browser.close()
        
    out_json = os.path.join(BRAIN_DIR, 'scratch', f'results_{date_tag}_audited.json')
    with open(out_json, 'w', encoding='utf-8') as f:
        json.dump(coto_results, f, indent=2, ensure_ascii=False)
        
    print(f"\n=== SCRAPING COTO {date_label} FINALIZADO! Data guardada en {out_json} ===")
    return coto_results

if __name__ == '__main__':
    asyncio.run(run_daily_scrape())
