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
        print("Navigating to Tomate...")
        await page.goto('https://www.coto.com.ar/productos/tomate', wait_until='domcontentloaded')
        await page.wait_for_timeout(3500)
        
        # Scroll past the SC Johnson top banner
        await page.evaluate('window.scrollBy(0, 360)')
        await page.wait_for_timeout(2500)
            
        await page.screenshot(path='C:/Users/WORK/Documents/GitHub/hubador/comparador/test_tomate_card_clean.png', clip={'x': 220, 'y': 100, 'width': 980, 'height': 520})
        await browser.close()
        print('Tomate clean screenshot saved successfully!')

asyncio.run(test())
