const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ID_SUCURSAL = '12-1-44';
const LOG_PATH = path.join(__dirname, 'scraper-coto-23sep.log');
const OUTPUT_JSON = path.join(__dirname, 'precios_coto_23sep.json');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

const ITEMS_QUERY = [
  { id: "papa_spunta", query: "papa", name: "Papa Spunta", cat: "verdura", target: "papa" },
  { id: "tomate_redondo", query: "tomate", name: "Tomate Redondo", cat: "verdura", target: "redondo" },
  { id: "cebolla_valenciani", query: "cebolla", name: "Cebolla Valenciani", cat: "verdura", target: "cebolla" },
  { id: "zanahoria_chantenay", query: "zanahoria", name: "Zanahoria Chantenay", cat: "verdura", target: "zanahoria" },
  { id: "zapallo_tetsukab.", query: "zapallo", name: "Zapallo Tetsukabuto", cat: "verdura", target: "zapallo" },
  { id: "zapallito_redondo", query: "zapallito", name: "Zapallito Redondo", cat: "verdura", target: "zapallito" },
  { id: "acelga", query: "acelga", name: "Acelga Selección", cat: "verdura", target: "acelga" },
  { id: "lechuga_criolla", query: "lechuga", name: "Lechuga Criolla", cat: "verdura", target: "lechuga" },
  { id: "batata_arapey", query: "batata", name: "Batata Arapey", cat: "verdura", target: "batata" },
  { id: "pepino", query: "pepino", name: "Pepino Selección", cat: "verdura", target: "pepino" },
  { id: "banana_cavendish", query: "banana", name: "Banana Cavendish", cat: "fruta", target: "banana" },
  { id: "manzana_red_delicious", query: "manzana", name: "Manzana Red", cat: "fruta", target: "manzana" },
  { id: "naranja_salustiana", query: "naranja", name: "Naranja Jugo", cat: "fruta", target: "naranja" },
  { id: "mandarinamurcot", query: "mandarina", name: "Mandarina Murcot", cat: "fruta", target: "mandarina" },
  { id: "pera_packhams", query: "pera", name: "Pera Packham's", cat: "fruta", target: "pera" },
  { id: "limon_eureka", query: "limon", name: "Limón Eureka", cat: "fruta", target: "limon" },
  { id: "frutilla", query: "frutilla", name: "Frutilla Selección", cat: "fruta", target: "frutilla" },
  { id: "pomelo_starruby", query: "pomelo", name: "Pomelo Star Ruby", cat: "fruta", target: "pomelo" },
  { id: "palta_hass", query: "palta", name: "Palta Hass", cat: "fruta", target: "palta" },
  { id: "kiwi", query: "kiwi", name: "Kiwi Selección", cat: "fruta", target: "kiwi" }
];

function queryApi(term, catId) {
  try {
    const cmd = `curl.exe -s -L -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" "https://d3e6htiiul5ek9.cloudfront.net/prod/productos?string=${encodeURIComponent(term)}&limit=25&offset=0&id_sucursal=${ID_SUCURSAL}&id_categoria=${catId}"`;
    const raw = execSync(cmd, { encoding: 'utf8' });
    const json = JSON.parse(raw);
    return json.productos || [];
  } catch (e) {
    return [];
  }
}

function runScraper() {
  log("Iniciando relevamiento EN VIVO de Coto Digital vía Precios Claros API (23 de Septiembre 2026)...");
  const scrapedProducts = [];

  for (const item of ITEMS_QUERY) {
    const frutas = queryApi(item.query, '0604');
    const verduras = queryApi(item.query, '0609');
    const all = [...frutas, ...verduras];
    
    // Filter for kg presentation
    const frescos = all.filter(p => /kg/i.test(p.presentacion || '') || /kg/i.test(p.nombre || ''));
    const candidates = frescos.length > 0 ? frescos : all;
    
    // Exclude cherry, organic, etc. unless item is cherry
    const nonSpecial = candidates.filter(p => !/cherry|cherri|organico|orgánico|especial|rama/i.test(p.nombre || ''));
    const pool = nonSpecial.length > 0 ? nonSpecial : candidates;

    if (pool.length > 0) {
      pool.sort((a, b) => a.precio - b.precio);
      const best = pool[0];
      log(`✓ Match para ${item.name}: "${best.nombre}" -> $${best.precio}`);
      scrapedProducts.push({
        id: item.id,
        nombre: item.name,
        nombre_coto: best.nombre,
        categoria: item.cat,
        coto_today: Math.round(best.precio),
        oferta: best.precio < 2500
      });
    } else {
      log(`⚠️ Sin match en vivo para ${item.name}, manteniendo precio base.`);
    }
  }

  const payload = {
    fecha: "2026-09-23",
    scrapedAt: new Date().toISOString(),
    totalProductos: scrapedProducts.length,
    productos: scrapedProducts
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  log(`✓ Relevamiento live completado. Guardado en: ${OUTPUT_JSON}`);
}

runScraper();
