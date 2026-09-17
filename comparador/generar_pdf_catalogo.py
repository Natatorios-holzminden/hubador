"""
Genera el PDF catalogo de precios usando Playwright.
Abre pdf_catalogo.html (que carga data.js con los 148 productos)
y exporta a PDF A4 con todas las fotos embebidas.
"""
import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

# Paths
COMPARADOR_DIR = r"C:\Users\WORK\Documents\GitHub\hubador\comparador"
DESKTOP_DIR = r"C:\Users\WORK\Desktop\hubador antes del formulario\hubador\comparador"
HTML_FILE = os.path.join(COMPARADOR_DIR, "pdf_catalogo.html")
OUTPUT_PDF = os.path.join(COMPARADOR_DIR, "Catalogo_Precios_16Sep2026.pdf")

async def main():
    print("Iniciando Playwright...")
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Navigate to the local HTML file
        file_url = "file:///" + HTML_FILE.replace("\\", "/")
        print("Cargando: " + file_url)
        await page.goto(file_url, wait_until="networkidle", timeout=30000)

        # Wait for content to render
        await page.wait_for_selector(".product-card", timeout=10000)

        # Count products rendered
        count = await page.evaluate("document.querySelectorAll('.product-card').length")
        print("Productos renderizados: " + str(count))

        # Check how many images loaded
        img_count = await page.evaluate("""
            () => {
                const imgs = document.querySelectorAll('.product-card img');
                let loaded = 0;
                let broken = 0;
                imgs.forEach(img => {
                    if (img.naturalWidth > 0) loaded++;
                    else broken++;
                });
                return {total: imgs.length, loaded: loaded, broken: broken};
            }
        """)
        print("Imagenes - Total: " + str(img_count["total"]) +
              " | Cargadas: " + str(img_count["loaded"]) +
              " | Rotas: " + str(img_count["broken"]))

        # Generate PDF
        print("Generando PDF...")
        await page.pdf(
            path=OUTPUT_PDF,
            format="A4",
            print_background=True,
            margin={
                "top": "10mm",
                "bottom": "10mm",
                "left": "8mm",
                "right": "8mm"
            }
        )

        pdf_size = os.path.getsize(OUTPUT_PDF)
        print("PDF generado: " + OUTPUT_PDF)
        print("Tamano: " + str(round(pdf_size / 1024 / 1024, 2)) + " MB")

        await browser.close()

    # Copy to desktop
    desktop_pdf = os.path.join(DESKTOP_DIR, "Catalogo_Precios_16Sep2026.pdf")
    if os.path.exists(DESKTOP_DIR):
        shutil.copy2(OUTPUT_PDF, desktop_pdf)
        print("Copiado a Desktop: " + desktop_pdf)

    # Also copy the HTML
    desktop_html = os.path.join(DESKTOP_DIR, "pdf_catalogo.html")
    if os.path.exists(DESKTOP_DIR):
        shutil.copy2(HTML_FILE, desktop_html)
        print("HTML copiado a Desktop: " + desktop_html)

    print("\nListo! El PDF esta en:")
    print("  " + OUTPUT_PDF)

if __name__ == "__main__":
    asyncio.run(main())
