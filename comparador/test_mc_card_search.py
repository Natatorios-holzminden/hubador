import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 1366, 'height': 1200},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        print("Navigating to preciosdelcentral.com.ar/buenosaires...")
        await page.goto('https://preciosdelcentral.com.ar/buenosaires', wait_until='networkidle')
        await page.wait_for_timeout(3000)
        
        # Scroll down to where products list / search bar is
        await page.evaluate('window.scrollBy(0, 450)')
        await page.wait_for_timeout(1000)
        
        # Type search 'papa'
        inputs = await page.locator('input').all()
        print(f"Found {len(inputs)} inputs")
        for inp in inputs:
            try:
                vis = await inp.is_visible()
                ph = await inp.get_attribute('placeholder')
                print(f"  Input visible={vis}, placeholder={ph}")
                if vis and ph and ('buscar' in ph.lower() or 'producto' in ph.lower() or 'especie' in ph.lower()):
                    await inp.fill('papa')
                    await page.wait_for_timeout(2000)
                    break
            except Exception as e:
                pass

        await page.screenshot(path='C:/Users/WORK/Documents/GitHub/hubador/comparador/test_mc_papa_cards_real.png')
        await browser.close()
        print("Papa cards screenshot saved!")

asyncio.run(test())
