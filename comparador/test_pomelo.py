import asyncio
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for term in ['pomelo', 'pomelo starruby', 'pomelo rosado']:
            url = f"https://www.coto.com.ar/productos/{term.replace(' ', '%20')}"
            page = await browser.new_page()
            try:
                await page.goto(url, wait_until='domcontentloaded', timeout=20000)
                await page.wait_for_timeout(3000)
                cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
                print(f"=== TERM: {term} === (found {len(cards)} cards)")
                for i, c in enumerate(cards[:4]):
                    txt = await c.inner_text()
                    lines = [l.strip() for l in txt.splitlines() if l.strip()]
                    print(f"  Card {i}:", " | ".join(lines[:4]))
            except Exception as e:
                print(f"Error for {term}:", e)
            finally:
                await page.close()
        await browser.close()

if __name__ == '__main__':
    asyncio.run(test())
