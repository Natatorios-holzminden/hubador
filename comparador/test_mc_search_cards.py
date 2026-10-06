import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1366, 'height': 950},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Navigating to preciosdelcentral.com.ar...")
        await page.goto('https://preciosdelcentral.com.ar/buenosaires', wait_until='networkidle')
        await page.wait_for_timeout(3000)
        
        # Type search 'papa'
        search_input = page.locator('input[type="text"], input[placeholder*="Buscar"], input#search').first
        if await search_input.count() > 0:
            await search_input.fill('papa')
            await page.wait_for_timeout(2000)
            
        await page.screenshot(path='C:/Users/WORK/Documents/GitHub/hubador/comparador/test_mc_search_papa.png', clip={'x': 30, 'y': 120, 'width': 880, 'height': 650})
        await browser.close()
        print("MC search screenshot saved!")

asyncio.run(test())
