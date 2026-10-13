import asyncio
from playwright.async_api import async_playwright

async def check():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1280, "height": 900})
        url = "https://www.coto.com.ar/productos/pomelo%20starruby"
        print(f"Navigating to {url}...")
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)
        
        cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
        print(f"Total cards found: {len(cards)}")
        for idx, c in enumerate(cards):
            txt = await c.inner_text()
            if "pomelo" in txt.lower():
                lines = [l.strip() for l in txt.splitlines() if l.strip()]
                print(f"Card {idx}: {' | '.join(lines[:4])}")
                
        # Also check searching 'pomelo rosado'
        url2 = "https://www.coto.com.ar/productos/pomelo%20rosado"
        print(f"\nNavigating to {url2}...")
        await page.goto(url2, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)
        cards2 = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
        print(f"Total cards found for pomelo rosado: {len(cards2)}")
        for idx, c in enumerate(cards2[:3]):
            txt = await c.inner_text()
            lines = [l.strip() for l in txt.splitlines() if l.strip()]
            print(f"Card {idx}: {' | '.join(lines[:4])}")
            
        await browser.close()

if __name__ == '__main__':
    asyncio.run(check())
