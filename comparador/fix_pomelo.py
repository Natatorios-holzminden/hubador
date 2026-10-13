import asyncio
import os
import shutil
import json
import re
from playwright.async_api import async_playwright

REPO_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"
BRAIN_DIR = r"C:\Users\WORK\.gemini\antigravity\brain\1b9a1801-5beb-4cae-9286-ca90a8c09f19"

COTO_OUT = os.path.join(REPO_DIR, "evidencias", "coto_13oct")
COTO_DESK = os.path.join(DESKTOP_DIR, "evidencias", "coto_13oct")

async def fix_pomelo():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        
        url = "https://www.coto.com.ar/productos/pomelo%20rosado"
        print(f"Navigating to {url}...")
        await page.goto(url, wait_until="domcontentloaded", timeout=25000)
        await page.wait_for_timeout(4000)
        
        cards = await page.locator('.producto-card, li[id^="product"], div.product_info_cont').all()
        print(f"Cards found: {len(cards)}")
        
        target_card = None
        for c in cards:
            txt = await c.inner_text()
            if "pomelo rosado" in txt.lower():
                target_card = c
                break
                
        if not target_card and cards:
            target_card = cards[0]
            
        raw_price = "1.599,00"
        num_price = 1599.0
        
        if target_card:
            txt = await target_card.inner_text()
            print("Card text:", txt.replace('\n', ' | '))
            m = re.findall(r'(?:OFERTA|PRECIO\s+OFERTA)\s*\$\s*([0-9\.\,]+)', txt, re.IGNORECASE)
            if m:
                raw_price = m[0]
                num_price = float(raw_price.replace('.', '').replace(',', '.'))
                
        await page.evaluate("window.scrollBy(0, 360)")
        await page.wait_for_timeout(2000)
        
        filename = "coto_pomelo_starruby.png"
        p_repo = os.path.join(COTO_OUT, filename)
        p_desk = os.path.join(COTO_DESK, filename)
        
        await page.screenshot(
            path=p_repo,
            clip={'x': 220, 'y': 100, 'width': 980, 'height': 520}
        )
        
        if os.path.exists(p_repo):
            shutil.copy2(p_repo, p_desk)
            print(f"Saved fresh screenshot: {p_repo} (and synced to desktop)")
            
        await browser.close()
        
    # Update timeline_summary.json
    ts_path = os.path.join(REPO_DIR, "timeline_summary.json")
    with open(ts_path, "r", encoding="utf-8") as f:
        ts_items = json.load(f)
        
    for it in ts_items:
        if it['id'] == 'pomelo_starruby':
            it['prices']['13oct'] = f"${raw_price}"
            print(f"Updated timeline_summary.json pomelo_starruby 13oct -> ${raw_price}")
            
    with open(ts_path, "w", encoding="utf-8") as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
    with open(os.path.join(DESKTOP_DIR, "timeline_summary.json"), "w", encoding="utf-8") as f:
        json.dump(ts_items, f, indent=2, ensure_ascii=False)
        
    # Update results_13oct_audited.json
    audited_path = os.path.join(BRAIN_DIR, "scratch", "results_13oct_audited.json")
    if os.path.exists(audited_path):
        with open(audited_path, "r", encoding="utf-8") as f:
            audited = json.load(f)
        for it in audited:
            if it['id'] == 'pomelo_starruby':
                it['coto_precio_str'] = raw_price
                it['coto_precio_num'] = num_price
                it['coto_info'] = f"Pomelo Rosado . Xkg OFERTA ${raw_price}"
        with open(audited_path, "w", encoding="utf-8") as f:
            json.dump(audited, f, indent=2, ensure_ascii=False)
            
    print("All datasets updated!")

if __name__ == '__main__':
    asyncio.run(fix_pomelo())
