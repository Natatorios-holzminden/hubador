import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1366, 'height': 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Navigating to preciosdelcentral.com.ar for PAPA SPUNTA...")
        await page.goto('https://preciosdelcentral.com.ar/buenosaires/detalles45/PAPA/SPUNTA', wait_until='domcontentloaded')
        await page.wait_for_timeout(3500)
        
        # Look for the product card element
        cards = await page.locator('.card, .card-body, div[class*="card"]').all()
        print(f"Found {len(cards)} card elements")
        
        # Take full clip of the card area
        await page.screenshot(path='C:/Users/WORK/Documents/GitHub/hubador/comparador/test_mc_papa_spunta_card.png', clip={'x': 50, 'y': 80, 'width': 780, 'height': 420})
        await browser.close()
        print("MC Papa Spunta screenshot saved!")

asyncio.run(test())
