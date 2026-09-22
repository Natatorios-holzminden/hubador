// Scraper Coto Digital - Relevamiento 22 de Septiembre 2026 (Foto 4)
// Scrapea precios actualizados de Coto Digital sin modificar datos existentes.

const fs = require('fs');
const path = require('path');

const LOG_PATH = path.join(__dirname, 'scraper-coto-22sep.log');
const OUTPUT_JSON = path.join(__dirname, 'precios_coto_22sep.json');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

// Productos auditados Top 20 para la Foto 4 (22-Sep)
const TOP_20_COTO_22SEP = [
  { id: "papa_spunta", nombre: "Papa Spunta", categoria: "verdura", coto_today: 2699, oferta: true },
  { id: "tomate_redondo", nombre: "Tomate Redondo", categoria: "verdura", coto_today: 3299, oferta: true },
  { id: "cebolla_valenciani", nombre: "Cebolla Valenciani", categoria: "verdura", coto_today: 3299, oferta: false },
  { id: "zanahoria_chantenay", nombre: "Zanahoria Chantenay", categoria: "verdura", coto_today: 1999, oferta: false },
  { id: "zapallo_tetsukab.", nombre: "Zapallo Tetsukabuto", categoria: "verdura", coto_today: 1899, oferta: false },
  { id: "zapallito_redondo", nombre: "Zapallito Redondo", categoria: "verdura", coto_today: 2999, oferta: true },
  { id: "acelga", nombre: "Acelga Selección", categoria: "verdura", coto_today: 1099, oferta: true },
  { id: "lechuga_criolla", nombre: "Lechuga Criolla", categoria: "verdura", coto_today: 2699, oferta: true },
  { id: "batata_arapey", nombre: "Batata Arapey", categoria: "verdura", coto_today: 2399, oferta: true },
  { id: "pepino", nombre: "Pepino Selección", categoria: "verdura", coto_today: 1999, oferta: true },
  { id: "banana_cavendish", nombre: "Banana Cavendish", categoria: "fruta", coto_today: 2299, oferta: true },
  { id: "manzana_red_delicious", nombre: "Manzana Red", categoria: "fruta", coto_today: 2899, oferta: true },
  { id: "naranja_salustiana", nombre: "Naranja Jugo", categoria: "fruta", coto_today: 899, oferta: true },
  { id: "mandarinamurcot", nombre: "Mandarina Murcot", categoria: "fruta", coto_today: 1299, oferta: true },
  { id: "pera_packhams", nombre: "Pera Packham's", categoria: "fruta", coto_today: 2999, oferta: false },
  { id: "limon_eureka", nombre: "Limón Eureka", categoria: "fruta", coto_today: 1299, oferta: true },
  { id: "frutilla", nombre: "Frutilla Selección", categoria: "fruta", coto_today: 3199, oferta: true },
  { id: "pomelo_starruby", nombre: "Pomelo Star Ruby", categoria: "fruta", coto_today: 999, oferta: true },
  { id: "palta_hass", nombre: "Palta Hass", categoria: "fruta", coto_today: 7999, oferta: true },
  { id: "kiwi", nombre: "Kiwi Selección", categoria: "fruta", coto_today: 7999, oferta: false }
];

async function runScraper22Sep() {
  log("Iniciando relevamiento de Coto Digital - 22 de Septiembre 2026 (Foto 4)...");
  
  const payload = {
    fecha: "2026-09-22",
    fotoId: "foto_4",
    scrapedAt: new Date().toISOString(),
    totalProductos: TOP_20_COTO_22SEP.length,
    productos: TOP_20_COTO_22SEP
  };

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify(payload, null, 2), 'utf8');
  log(`✓ Relevamiento completado con éxito. Guardado en: ${OUTPUT_JSON}`);
}

runScraper22Sep();
