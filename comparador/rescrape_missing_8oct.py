import asyncio
import json
import os
import re
import shutil
from playwright.async_api import async_playwright

BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"
REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"

TARGETS = [
    {'id': 'zapallo_tetsukab.', 'name': 'Zapallo Tetsukabuto', 'cat': 'verduras', 'rank': 4, 'coto_term': 'zapallo'},
    {'id': 'zapallito_redondo', 'name': 'Zapallito Redondo', 'cat': 'verduras', 'rank': 5, 'coto_term': 'zapallito'},
    {'id': 'zanahoria_chantenay', 'name': 'Zanahoria Chantenay', 'cat': 'verduras', 'rank': 6, 'coto_term': 'zanahoria'},
    {'id': 'frutilla', 'name': 'Frutilla Selección', 'cat': 'frutas', 'rank': 12, 'coto_term': 'frutilla'},
    {'id': 'mango', 'name': 'Mango Selección', 'cat': 'frutas', 'rank': 13, 'coto_term': 'mango'},
    {'id': 'pepino', 'name': 'Pepino', 'cat': 'verduras', 'rank': 19, 'coto_term': 'pepino'},
]

COTO_OUT = os.path.join(REPO_DIR, "evidencias", "coto_8oct")
COTO_DESK = os.path.join(DESKTOP_DIR, "evidencias", "coto_8oct")

async def rescrape():
    audited_path = os.path.join(BRAIN_DIR, 'scratch', 'results_8oct_audited.json')
    with open(audited_path, 'r', encoding='utf-8') as f:
        audited_data = json.load(f)
    audited_map = {item['id']: item for item in audited_data}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for item in TARGETS:
            pid = item['id']
            term = item['coto_term']
            url = f"https://www.coto.com.ar/productos/{term.replace(' ', '%20')}"
            
            context = await browser.new_context(
                viewport={"width": 1280, "height": 900},
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = await context.new_page()
            
            try:
                print(f"Rescraping {item['name']} ({url})...")
                await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                await page.wait_for_timeout(4000)
                
                # Try finding product cards with multiple selectors
                cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont, .product-item, .card').all()
                raw_price = None
                num_price = None
                card_info = None

                if cards:
                    card_text = await cards[0].inner_text()
                    lines = [l.strip() for l in card_text.splitlines() if l.strip()]
                    card_info = " ".join(lines[:4])
                    
                    offer_matches = re.findall(r'(?:OFERTA|PRECIO\s+OFERTA|OFERTA\s+CONTADO)\s*\$\s*([0-9\.\,]+)', card_text, re.IGNORECASE)
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

                # Scroll down slightly to position cards
                await page.evaluate('window.scrollBy(0, 360)')
                await page.wait_for_timeout(2000)

                filename = f"coto_{pid}.png"
                p_repo = os.path.join(COTO_OUT, filename)
                p_desk = os.path.join(COTO_DESK, filename)

                await page.screenshot(
                    path=p_repo,
                    clip={'x': 220, 'y': 100, 'width': 980, 'height': 520}
                )
                
                if os.path.exists(p_repo):
                    shutil.copy2(p_repo, p_desk)

                print(f"  [RE-SCRAPE SUCCESS] {item['name']:22} -> raw: {raw_price}, num: {num_price}")

                if pid in audited_map:
                    audited_map[pid]['coto_precio_str'] = raw_price
                    audited_map[pid]['coto_precio_num'] = num_price
                    audited_map[pid]['coto_info'] = card_info
                    audited_map[pid]['fecha_captura'] = '08-10-2026'

            except Exception as e:
                print(f"  [RE-SCRAPE ERR] {item['name']}: {e}")
            finally:
                await context.close()

        await browser.close()

    updated_list = list(audited_map.values())
    with open(audited_path, 'w', encoding='utf-8') as f:
        json.dump(updated_list, f, indent=2, ensure_ascii=False)
    print("Updated results_8oct_audited.json with re-scraped data.")

if __name__ == '__main__':
    asyncio.run(rescrape())
