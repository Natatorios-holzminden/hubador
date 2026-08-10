const fs = require('fs');

async function scrapeMercadoCentral() {
  console.log("Fetching Mercado Central...");
  try {
    const res = await fetch("https://preciosdelcentral.com.ar/buenosaires");
    const html = await res.text();
    
    // Parse cards with regex / DOM structure
    // Example pattern: data-cultivo="TOMATE" or id="TOMATE" ... class="firstPrice">$ 450</span> / Kg
    const items = [];
    const cardMatches = html.match(/<div class="card-wrapper card-item" data-cultivo="([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g);
    
    if (cardMatches) {
      for (const card of cardMatches) {
        const cultivoMatch = card.match(/data-cultivo="([^"]+)"/);
        const nameMatch = card.match(/<span class="card-title[^">]*">([^<]+)<\/span>/);
        const subMatch = card.match(/<span class="card-subtitle[^">]*">([^<]+)<\/span>/);
        const priceMatch = card.match(/class="precio-convertible"[^>]*>\$\s*([\d\.]+)<\/span>\s*\/\s*Kg/);
        const bultoMatch = card.match(/(\d+\s*Kg)\s*x\s*<span[^>]*data-ars="([\d\.]+)"/);
        const imgMatch = card.match(/class="card-img-top"[^>]*src="([^"]+)"/);

        if (nameMatch && priceMatch) {
          const name = nameMatch[1].trim();
          const sub = subMatch ? subMatch[1].trim() : '';
          const priceKg = parseFloat(priceMatch[1].replace('.', ''));
          const img = imgMatch ? imgMatch[1] : '';

          items.push({
            id: cultivoMatch ? cultivoMatch[1].toLowerCase() : name.toLowerCase(),
            nombre: `${name} ${sub}`.trim(),
            precioMercadoCentral: priceKg,
            imagen: img
          });
        }
      }
    }
    console.log(`Mercado Central found ${items.length} items.`);
    return items;
  } catch (err) {
    console.error("Error scraping Mercado Central:", err.message);
    return [];
  }
}

async function scrapeCoto() {
  console.log("Fetching Coto...");
  try {
    const res = await fetch("https://www.coto.com.ar/productos/categorias/catalogo-frescos-frutas-y-verduras/catv00003285?sort_by=relevance&sort_order=descending&filters%5Bgroup_id%5D=catv00003285", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    const html = await res.text();
    fs.writeFileSync("coto_raw.html", html);
    console.log("Saved Coto raw HTML");
  } catch (err) {
    console.error("Error scraping Coto:", err.message);
  }
}

async function run() {
  const mc = await scrapeMercadoCentral();
  console.log("Sample MC items:", mc.slice(0, 5));
  await scrapeCoto();
}

run();
