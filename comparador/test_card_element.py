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
        await page.wait_for_timeout(2500)
        
        # Type search 'papa'
        search_input = page.locator('input[placeholder*="Buscar"]').first
        await search_input.fill('papa')
        await page.wait_for_timeout(2500)
        
        # Scroll down so cards are visible
        await page.evaluate('window.scrollBy(0, 520)')
        await page.wait_for_timeout(1000)
        
        # Find card containing 'PAPA SPUNTA'
        matching_cards = await page.locator('div').filter(has_text='PAPA SPUNTA').filter(has_text='Precio promedio').all()
        print(f"Found {len(matching_cards)} matching cards")
        
        for idx, c in enumerate(matching_cards):
            try:
                box = await c.bounding_box()
                print(f"Card {idx} box: {box}")
                if box and box['height'] < 500 and box['width'] > 300:
                    await c.screenshot(path=f'C:/Users/WORK/Documents/GitHub/hubador/comparador/test_papa_card_{idx}.png')
                    print(f"Saved card {idx} screenshot!")
            except Exception as e:
                print("Error taking screenshot:", e)
                
        await browser.close()

asyncio.run(test())
