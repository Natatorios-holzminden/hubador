import asyncio
import os
import shutil
from playwright.async_api import async_playwright

REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"
OUT_DIR = os.path.join(REPO_DIR, "evidencias", "mc_6oct")
OUT_DESK = os.path.join(DESKTOP_DIR, "evidencias", "mc_6oct")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(OUT_DESK, exist_ok=True)

ITEMS_TO_SCRAPE = [
    ('pera_packhams', 'pera'),
    ('manzana_red_delicious', 'manzana'),
    ('frutilla', 'frutilla'),
    ('mandarinamurcot', 'mandarina'),
    ('naranja_salustiana', 'naranja'),
    ('lechuga_francesa', 'lechuga'),
    ('lechuga_morada', 'lechuga'),
    ('espinaca', 'espinaca'),
    ('acelga', 'acelga'),
    ('rucula', 'rucula'),
    ('cebolla_verdeo', 'verdeo'),
    ('coliflor', 'coliflor'),
    ('remolacha', 'remolacha'),
    ('brocoli', 'brocoli'),
    ('apio', 'apio'),
    ('ciboulette', 'ciboulette'),
    ('radicheta', 'radicheta'),
    ('tomate_perita', 'tomate perita'),
    ('tomate_cherry', 'tomate cherry'),
    ('tomate_redondo', 'tomate redondo'),
    ('palta_hass', 'palta'),
    ('mango', 'mango'),
    ('papa_spunta', 'papa spunta'),
    ('cebolla_valenciani', 'cebolla'),
    ('berenjena', 'berenjena'),
    ('zucchini', 'zucchini'),
    ('repollo_blanco', 'repollo'),
    ('lechuga_criolla', 'lechuga'),
    ('verdeo', 'verdeo')
]

async def run_mc_exact_scraper():
    print("=== INICIANDO CAPTURA DE FICHAS EXACTAS REALES MERCADO CENTRAL (06-OCT) ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1366, 'height': 1200},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Cargando preciosdelcentral.com.ar/buenosaires...")
        await page.goto('https://preciosdelcentral.com.ar/buenosaires', wait_until='networkidle')
        await page.wait_for_timeout(2500)

        for idx, (pid, term) in enumerate(ITEMS_TO_SCRAPE, start=1):
            try:
                print(f"[{idx}/{len(ITEMS_TO_SCRAPE)}] Capturando ficha negra real para {pid} ('{term}')...")
                search_input = page.locator('input[placeholder*="Buscar"]').first
                await search_input.fill('')
                await search_input.fill(term)
                await page.wait_for_timeout(2000)

                # Find the smallest matching card element containing 'Precio promedio'
                matching = await page.locator('div').filter(has_text='Precio promedio').all()
                target_card = None
                
                for c in matching:
                    try:
                        box = await c.bounding_box()
                        if box and 180 < box['height'] < 420 and 320 < box['width'] < 650:
                            target_card = c
                            break
                    except:
                        pass

                out_repo = os.path.join(OUT_DIR, f"recorte_mc_{pid}.png")
                out_desk = os.path.join(OUT_DESK, f"recorte_mc_{pid}.png")

                if target_card:
                    await target_card.scroll_into_view_if_needed()
                    await page.wait_for_timeout(500)
                    await target_card.screenshot(path=out_repo)
                    shutil.copy2(out_repo, out_desk)
                    print(f"  [OK 06-Oct] Ficha recortada exitosamente para {pid}")
                else:
                    # Fallback to viewport scroll
                    await page.evaluate('window.scrollBy(0, 520)')
                    await page.wait_for_timeout(500)
                    await page.screenshot(path=out_repo, clip={'x': 230, 'y': 780, 'width': 500, 'height': 290})
                    if os.path.exists(out_repo):
                        shutil.copy2(out_repo, out_desk)
                    print(f"  [OK Fallback] Recorte clip guardado para {pid}")

            except Exception as e:
                print(f"  [ERR 06-Oct] {pid}: {e}")

        await browser.close()
    print("=== CAPTURA DE FICHAS NEGRAS REALES MERCADO CENTRAL FINALIZADA ===")

if __name__ == '__main__':
    asyncio.run(run_mc_exact_scraper())
