import asyncio
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
from playwright.async_api import async_playwright

# Configurar stdout/stderr a UTF-8
if sys.stdout:
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr:
    sys.stderr.reconfigure(encoding='utf-8')

# --- CONFIGURACIÓN DE RUTAS ---
BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

# --- DETECCIÓN AUTOMÁTICA DE FECHA ACTUAL ---
now = datetime.datetime.now()
day = now.day
month_names = {1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun', 7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec'}
month_name_es = {1: 'Ene', 2: 'Feb', 3: 'Mar', 4: 'Abr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Ago', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dic'}

date_tag = f"{day}{month_names[now.month]}"            # ej: '13oct'
date_label = f"{day:02d}-{month_name_es[now.month]}"    # ej: '13-Oct'
full_date_str = f"{day:02d}-{now.month:02d}-{now.year}"  # ej: '13-10-2026'

print("============================================================")
print(f" [*] INICIANDO SCRAPER COTO EN VIVO PARA HOY: {date_label} ({full_date_str})")
print("============================================================")

COTO_OUT = os.path.join(REPO_DIR, "evidencias", f"coto_{date_tag}")
COTO_DESK = os.path.join(DESKTOP_DIR, "evidencias", f"coto_{date_tag}")
os.makedirs(COTO_OUT, exist_ok=True)
os.makedirs(COTO_DESK, exist_ok=True)

ITEMS_27 = [
    # Verduras
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
    {'id': 'tomate_cherry', 'name': 'Tomate Cherry', 'cat': 'verduras', 'rank': 18, 'coto_term': 'cherry'},
    {'id': 'pepino', 'name': 'Pepino', 'cat': 'verduras', 'rank': 19, 'coto_term': 'pepino'},

    # Frutas
    {'id': 'mandarinamurcot', 'name': 'Mandarina Murcot', 'cat': 'frutas', 'rank': 1, 'coto_term': 'mandarina'},
    {'id': 'naranja_salustiana', 'name': 'Naranja Salustiana Jugo', 'cat': 'frutas', 'rank': 2, 'coto_term': 'naranja'},
    {'id': 'manzana_red_delicious', 'name': 'Manzana Red Delicious', 'cat': 'frutas', 'rank': 3, 'coto_term': 'manzana'},
    {'id': 'banana_cavendish', 'name': 'Banana Cavendish', 'cat': 'frutas', 'rank': 4, 'coto_term': 'banana'},
    {'id': 'pera_packhams', 'name': "Pera Packham's", 'cat': 'frutas', 'rank': 5, 'coto_term': 'pera'},
    {'id': 'limon_eureka', 'name': 'Limón Eureka', 'cat': 'frutas', 'rank': 6, 'coto_term': 'limon'},
    {'id': 'uvaredglobe', 'name': 'Uva Red Globe', 'cat': 'frutas', 'rank': 7, 'coto_term': 'uva'},
    {'id': 'ciruelafortune', 'name': 'Ciruela Fortune', 'cat': 'frutas', 'rank': 8, 'coto_term': 'ciruela'},
    {'id': 'pomelo_starruby', 'name': 'Pomelo Star Ruby', 'cat': 'frutas', 'rank': 9, 'coto_term': 'pomelo rosado'},
    {'id': 'palta_hass', 'name': 'Palta Hass', 'cat': 'frutas', 'rank': 10, 'coto_term': 'palta'},
    {'id': 'kiwi', 'name': 'Kiwi Selección', 'cat': 'frutas', 'rank': 11, 'coto_term': 'kiwi'},
    {'id': 'frutilla', 'name': 'Frutilla Selección', 'cat': 'frutas', 'rank': 12, 'coto_term': 'frutilla'},
    {'id': 'mango', 'name': 'Mango Selección', 'cat': 'frutas', 'rank': 13, 'coto_term': 'mango'},
]

def get_previous_fallback_img(pid):
    for f_date in ["coto_8oct", "coto_6oct", "coto_5oct", "coto_4oct", "coto_1oct", "coto_29sep"]:
        fb = os.path.join(REPO_DIR, "evidencias", f_date, f"coto_{pid}.png")
        if os.path.exists(fb) and os.path.getsize(fb) > 5000:
            return fb
    return None

async def scrape_single_item(browser, item):
    pid = item['id']
    term = item['coto_term']
    url = f"https://www.coto.com.ar/productos/{term.replace(' ', '%20')}"
    
    context = await browser.new_context(
        viewport={"width": 1280, "height": 900},
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    )
    page = await context.new_page()
    
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(4000)
        
        cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont, .product-item, .card').all()
        raw_price = None
        num_price = None
        card_info = None

        if cards:
            card_text = await cards[0].inner_text()
            lines = [l.strip() for l in card_text.splitlines() if l.strip()]
            card_info = " ".join(lines[:4])
            
            offer_matches = re.findall(r'(?:OFERTA|PRECIO\s+OFERTA|OFERTA\s+CONTADO|PRECIO\s+CON\s+\d+%\s*DTO)\s*\$\s*([0-9\.\,]+)', card_text, re.IGNORECASE)
            if offer_matches:
                raw_price = offer_matches[0]
            else:
                price_matches = re.findall(r'\$\s*([0-9\.\,]+)', card_text)
                if price_matches:
                    raw_price = price_matches[0]
                    
            if raw_price:
                try:
                    num_price = float(raw_price.replace('.', '').replace(',', '.'))
                except ValueError:
                    num_price = None

        await page.evaluate('window.scrollBy(0, 360)')
        await page.wait_for_timeout(2000)

        filename = f"coto_{pid}.png"
        p_repo = os.path.join(COTO_OUT, filename)
        p_desk = os.path.join(COTO_DESK, filename)

        await page.screenshot(
            path=p_repo,
            clip={'x': 220, 'y': 100, 'width': 980, 'height': 520}
        )
        
        if not os.path.exists(p_repo) or os.path.getsize(p_repo) < 10000:
            fb = get_previous_fallback_img(pid)
            if fb:
                shutil.copy2(fb, p_repo)

        if os.path.exists(p_repo):
            shutil.copy2(p_repo, p_desk)

        return {
            'id': pid,
            'nombre': item['name'],
            'categoria': item['cat'],
            'rank': item['rank'],
            'coto_precio_str': raw_price,
            'coto_precio_num': num_price,
            'coto_info': card_info,
            'coto_img': f"evidencias/coto_{date_tag}/coto_{pid}.png",
            'fecha_captura': full_date_str
        }

    except Exception as e:
        print(f"   [!] Error scrapeando {item['name']}: {e}")
        p_repo = os.path.join(COTO_OUT, f"coto_{pid}.png")
        p_desk = os.path.join(COTO_DESK, f"coto_{pid}.png")
        fb = get_previous_fallback_img(pid)
        if fb:
            shutil.copy2(fb, p_repo)
            shutil.copy2(p_repo, p_desk)

        return {
            'id': pid,
            'nombre': item['name'],
            'categoria': item['cat'],
            'rank': item['rank'],
            'coto_precio_str': None,
            'coto_precio_num': None,
            'coto_info': None,
            'coto_img': f"evidencias/coto_{date_tag}/coto_{pid}.png",
            'fecha_captura': full_date_str
        }
    finally:
        await context.close()

async def main():
    results = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for idx, item in enumerate(ITEMS_27, start=1):
            print(f"[{idx}/{len(ITEMS_27)}] Scrapeando {item['name']}...")
            res = await scrape_single_item(browser, item)
            results.append(res)
            print(f"   -> ${res['coto_precio_str']} (num: {res['coto_precio_num']})")
        await browser.close()

    # Re-scrape retries for any missing item
    missing_items = [item for res, item in zip(results, ITEMS_27) if not res.get('coto_precio_str')]
    if missing_items:
        print(f"\n[*] Realizando Re-try de seguridad para {len(missing_items)} productos...")
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            for item in missing_items:
                print(f"   -> Re-intentando {item['name']}...")
                res_retry = await scrape_single_item(browser, item)
                if res_retry.get('coto_precio_str'):
                    for i, orig in enumerate(results):
                        if orig['id'] == item['id']:
                            results[i] = res_retry
                            print(f"   [OK] Re-try Exitoso para {item['name']}: ${res_retry['coto_precio_str']}")
            await browser.close()

    # Guardar audited JSON
    audited_json_path = os.path.join(BRAIN_DIR, 'scratch', f'results_{date_tag}_audited.json')
    with open(audited_json_path, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n[+] Guardado {audited_json_path}")

    # --- INTEGRAR EN timeline_summary.json SIN ALTERAR HISTORIAL ---
    ts_path = os.path.join(REPO_DIR, 'timeline_summary.json')
    with open(ts_path, 'r', encoding='utf-8') as f:
        ts_items = json.load(f)

    res_map = {r['id']: r for r in results}
    for item in ts_items:
        pid = item['id']
        if pid in res_map:
            res = res_map[pid]
            p_str = res.get('coto_precio_str')
            if p_str:
                formatted = f"${p_str}"
            else:
                p_num = res.get('coto_precio_num')
                formatted = f"${p_num:,.2f}".replace('.', ',') if p_num else "$---"
            
            # Asignar la nueva fecha manteniendo las anteriores intactas
            item['prices'][date_tag] = formatted

    with open(ts_path, 'w', encoding='utf-8') as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
    with open(os.path.join(DESKTOP_DIR, 'timeline_summary.json'), 'w', encoding='utf-8') as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
    print("[+] timeline_summary.json actualizado dinamicamente con la nueva fecha.")

    # --- RECONSTRUIR HTMLs DE GALERÍA Y TIMELINE ---
    subprocess.run([sys.executable, os.path.join(REPO_DIR, "rebuild_galeria_complete.py")], cwd=REPO_DIR, check=True)
    subprocess.run([sys.executable, os.path.join(REPO_DIR, "generate_timeline_card.py")], cwd=REPO_DIR, check=True)

    # Sync to Desktop
    for html_name in ["coto_top20_galeria.html", "timeline_coto_4fechas.html", "timeline_coto_todasfechas.html", "timeline_summary.json"]:
        shutil.copy2(os.path.join(REPO_DIR, html_name), os.path.join(DESKTOP_DIR, html_name))

    # Asegurar sync de evidencias completas a Escritorio
    for fname in os.listdir(COTO_OUT):
        src_f = os.path.join(COTO_OUT, fname)
        dst_f = os.path.join(COTO_DESK, fname)
        if os.path.isfile(src_f):
            shutil.copy2(src_f, dst_f)

    print("\n============================================================")
    print(f" [DONE] PROCESO FINALIZADO PARA HOY: {date_label}! Todos los sitios y Escritorio actualizados.")
    print("============================================================")

if __name__ == '__main__':
    asyncio.run(main())
