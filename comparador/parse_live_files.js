const fs = require('fs');

function parseMercadoCentral() {
  console.log("Parsing mc_live.html...");
  if (!fs.existsSync('mc_live.html')) return [];
  const html = fs.readFileSync('mc_live.html', 'utf-8');
  
  // Search card items
  // Pattern: id="ACELGA" ... class="card-title me-2">ACELGA</span> ... class="precio-convertible" data-ars="587.000000">$ 587</span> / Kg
  const products = [];
  const cardRegex = /<div class="card flex-row shadow p-1 mb-1 bg-white rounded"\s*id="([^"]+)"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/g;
  
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const cardHtml = match[0];
    const id = match[1];
    
    const titleMatch = cardHtml.match(/class="card-title me-2">([^<]+)<\/span>/);
    const subTitleMatch = cardHtml.match(/class="card-subtitle">([^<]+)<\/span>/);
    const priceMatch = cardHtml.match(/class="precio-convertible"[^>]*data-ars="([\d\.]+)"/);
    const imgMatch = cardHtml.match(/class="card-img-top"[^>]*src="([^"]+)"/);
    const dateMatch = cardHtml.match(/product-date-badge">([^<]+)<\/span>/);

    if (titleMatch && priceMatch) {
      const nombre = titleMatch[1].trim();
      const sub = subTitleMatch ? subTitleMatch[1].trim() : '';
      const rawPrice = parseFloat(priceMatch[1]);
      const priceKg = Math.round(rawPrice);

      products.push({
        id: id.toLowerCase(),
        nombre: sub ? `${nombre} (${sub})` : nombre,
        rawName: nombre,
        precioMercadoCentral: priceKg,
        imagen: imgMatch ? imgMatch[1] : '',
        fechaMercado: dateMatch ? dateMatch[1].trim() : ''
      });
    }
  }

  console.log(`Parsed ${products.length} products from Mercado Central.`);
  return products;
}

function parseCoto() {
  console.log("Parsing coto_live.html...");
  if (!fs.existsSync('coto_live.html')) return [];
  const html = fs.readFileSync('coto_live.html', 'utf-8');
  
  // Coto products pattern or JSON state inside window.__PRELOADED_STATE__ or HTML elements
  const items = [];

  // Search JSON state inside HTML
  const stateMatch = html.match(/window\.__PRELOADED_STATE__\s*=\s*({[\s\S]*?});/);
  if (stateMatch) {
    try {
      const state = JSON.parse(stateMatch[1]);
      console.log("Found Coto PRELOADED_STATE JSON!");
    } catch(e) {}
  }

  // HTML fallback regex: <div ... class="product_info"> or product card
  // Looking for product titles and prices ($ 1.999,00 or $ 2.999,00)
  const productBlockRegex = /<span class="product_name[^">]*">([^<]+)<\/span>[\s\S]*?class="atg_store_newPrice"[^>]*>\s*\$\s*([\d\.,]+)/g;
  let pMatch;
  while ((pMatch = productBlockRegex.exec(html)) !== null) {
    const pName = pMatch[1].trim();
    const pPriceStr = pMatch[2].replace('.', '').replace(',', '.');
    const pPrice = Math.round(parseFloat(pPriceStr));
    items.push({ nombre: pName, precio: pPrice });
  }

  console.log(`Parsed ${items.length} raw products from Coto.`);
  return items;
}

const mcProducts = parseMercadoCentral();
const cotoProducts = parseCoto();

console.log("Mercado Central sample:", mcProducts.slice(0, 5));
console.log("Coto sample:", cotoProducts.slice(0, 5));
