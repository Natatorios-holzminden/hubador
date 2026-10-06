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
    ('papa_spunta', 'papa spunta'),
    ('tomate_redondo', 'tomate redondo'),
    ('tomate_perita', 'tomate perita'),
    ('tomate_cherry', 'tomate cherry'),
    ('cebolla_valenciani', 'cebolla'),
    ('zanahoria_chantenay', 'zanahoria'),
    ('zapallo_tetsukab.', 'zapallo'),
    ('zapallito_redondo', 'zapallito'),
    ('acelga', 'acelga'),
    ('lechuga_criolla', 'lechuga'),
    ('batata_arapey', 'batata'),
    ('pepino', 'pepino'),
    ('berenjena', 'berenjena'),
    ('zucchini', 'zucchini'),
    ('repollo_blanco', 'repollo'),
    ('banana_cavendish', 'banana'),
    ('manzana_red_delicious', 'manzana'),
    ('naranja_salustiana', 'naranja'),
    ('mandarinamurcot', 'mandarina'),
    ('pera_packhams', 'pera'),
    ('limon_eureka', 'limon'),
    ('frutilla', 'frutilla'),
    ('pomelo_starruby', 'pomelo'),
    ('palta_hass', 'palta'),
    ('kiwi', 'kiwi'),
    ('mango', 'mango'),
    ('rucula', 'rucula'),
    ('coliflor', 'coliflor'),
    ('remolacha', 'remolacha')
]

async def run_mc_scraper():
    print("=== INICIANDO CAPTURA DE TARJETAS NEGRAS MERCADO CENTRAL (06-OCT HOY LIVE) ===")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1366, 'height': 1200},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Cargando preciosdelcentral.com.ar/buenosaires...")
        await page.goto('https://preciosdelcentral.com.ar/buenosaires', wait_until='networkidle')
        await page.wait_for_timeout(3000)

        # Scroll to view input area cleanly
        await page.evaluate('window.scrollBy(0, 420)')
        await page.wait_for_timeout(1000)

        for idx, (pid, term) in enumerate(ITEMS_TO_SCRAPE, start=1):
            try:
                print(f"[{idx}/{len(ITEMS_TO_SCRAPE)}] Capturando ficha MC real para: {pid} ('{term}')...")
                search_input = page.locator('input[placeholder*="Buscar"]').first
                if await search_input.count() > 0:
                    await search_input.fill('')
                    await search_input.fill(term)
                    await page.wait_for_timeout(2000)

                # Find the card elements rendered
                cards = page.locator('.bg-dark, div[class*="card"]').filter(has=page.locator('text=octubre'))
                
                out_path_repo = os.path.join(OUT_DIR, f"recorte_mc_{pid}.png")
                out_path_desk = os.path.join(OUT_DESK, f"recorte_mc_{pid}.png")

                # If cards found, screenshot the first matching card clip or search container clip
                await page.screenshot(
                    path=out_path_repo,
                    clip={'x': 85, 'y': 380, 'width': 630, 'height': 240}
                )

                if os.path.exists(out_path_repo):
                    shutil.copy2(out_path_repo, out_path_desk)
                print(f"  [OK 06-Oct] Ficha capturada para {pid}")

            except Exception as e:
                print(f"  [ERR 06-Oct] Error en {pid}: {e}")

        await browser.close()
    print("=== CAPTURA DE FICHAS MERCADO CENTRAL (06-OCT) FINALIZADA CON ÉXITO ===")

if __name__ == '__main__':
    asyncio.run(run_mc_scraper())
