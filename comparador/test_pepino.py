import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1280, 'height': 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Navigating to Pepino...")
        await page.goto('https://www.coto.com.ar/productos/pepino', wait_until='domcontentloaded')
        await page.wait_for_timeout(3500)
        
        cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
        print(f"Found {len(cards)} cards for pepino")
        for idx, card in enumerate(cards[:3]):
            txt = await card.inner_text()
            print(f"=== CARD {idx} ===")
            print(txt)
            print("-" * 40)
            
        await page.evaluate('window.scrollBy(0, 360)')
        await page.wait_for_timeout(2000)
        await page.screenshot(path='C:/Users/WORK/Documents/GitHub/hubador/comparador/test_pepino_live.png', clip={'x': 220, 'y': 100, 'width': 980, 'height': 520})
        await browser.close()
        print("Pepino test finished!")

asyncio.run(test())
