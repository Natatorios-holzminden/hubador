import asyncio
import os
import shutil
import re
from playwright.async_api import async_playwright

async def inspect_pepino():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()
        
        url = "https://www.coto.com.ar/productos/pepino"
        print(f"Going to {url}...")
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.wait_for_timeout(5000)
        
        # Check all text on page or search results
        body_text = await page.inner_text("body")
        print("Page text containing pepino or price:")
        for line in body_text.splitlines():
            if any(kw in line.lower() for kw in ["pepino", "$", "oferta", "precio"]):
                print("  LINE:", line[:120])
                
        # Scroll to view cards
        await page.evaluate("window.scrollBy(0, 360)")
        await page.wait_for_timeout(2000)
        
        p_path = r"C:\Users\WORK\Documents\GitHub\hubador\comparador\evidencias\coto_8oct\coto_pepino.png"
        p_desk = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador\evidencias\coto_8oct\coto_pepino.png"
        
        await page.screenshot(path=p_path, clip={'x': 220, 'y': 100, 'width': 980, 'height': 520})
        print("Saved screenshot for pepino. Size:", os.path.getsize(p_path))
        shutil.copy2(p_path, p_desk)
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_pepino())
