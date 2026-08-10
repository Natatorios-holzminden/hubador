// Scraper diario de precios de Coto — usa Precios Claros (preciosclaros.gob.ar),
// la API pública y oficial donde por ley los supermercados publican sus precios.
// Es más confiable que reversear la web de Coto y, de yapa, permite comparar
// contra otras cadenas más adelante sin cambiar de fuente.
const fs = require('fs');
const path = require('path');

const API_BASE = 'https://d3e6htiiul5ek9.cloudfront.net/prod';
// Sucursal Coto más cercana a Saavedra (Av. Monroe 3284, CABA), detectada por lat/lng.
// Si en algún momento hace falta otra sucursal/zona, este es el único valor a cambiar.
const ID_SUCURSAL_COTO = '12-1-44';

const MC_CSV_PATH = path.join(__dirname, 'precios_historicos.csv');
const CSV_PATH = path.join(__dirname, 'precios_historicos_coto.csv');
const LOG_PATH = path.join(__dirname, 'scraper-coto.log');
const CSV_SEP = ';';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function csvEscape(v) {
  const s = String(v ?? '');
  return new RegExp(`["${CSV_SEP}\\n]`).test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Usamos la misma lista de productos que ya scrapea Mercado Central, así los dos
// catálogos quedan alineados por el mismo nombre y se puede calcular la brecha directo.
function productosMercadoCentral() {
  if (!fs.existsSync(MC_CSV_PATH)) throw new Error('No existe precios_historicos.csv — corré primero scraper.js');
  const lines = fs.readFileSync(MC_CSV_PATH, 'utf8').trim().split('\n');
  const headers = lines[0].split(CSV_SEP);
  const idx = headers.indexOf('producto');
  return [...new Set(lines.slice(1).map(l => l.split(CSV_SEP)[idx]))];
}

// Categorías oficiales de Precios Claros bajo FRESCOS — restringimos la búsqueda acá
// para no traer falsos positivos (ej: una pasta rellena que dice "Albahaca" en el nombre).
const ID_CATEGORIA_FRUTAS = '0604';
const ID_CATEGORIA_VERDURAS = '0609';

async function buscarEnCategoria(termino, idCategoria) {
  const url = `${API_BASE}/productos?string=${encodeURIComponent(termino)}&limit=25&offset=0&id_sucursal=${ID_SUCURSAL_COTO}&id_categoria=${idCategoria}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HubadorBot/1.0)' } });
  if (!res.ok) return [];
  const json = await res.json();
  if (json.status !== 200 || !json.productos) return [];
  return json.productos;
}

// Variedades especiales que no queremos como "representante" del producto —
// si aparecen más baratas que la variedad común (por promo, por ej.), antes se elegían por error.
const PALABRAS_VARIEDAD_ESPECIAL = ['cherry', 'cherri', 'organic', 'orgánic', 'premium', 'gourmet', 'especial', 'baby', 'grape'];

function esVariedadEstandar(nombre) {
  const n = (nombre || '').toLowerCase();
  return !PALABRAS_VARIEDAD_ESPECIAL.some(palabra => n.includes(palabra));
}

async function buscarEnCoto(termino) {
  const [frutas, verduras] = await Promise.all([
    buscarEnCategoria(termino, ID_CATEGORIA_FRUTAS),
    buscarEnCategoria(termino, ID_CATEGORIA_VERDURAS),
  ]);
  // Dentro de Frutas/Verduras, nos quedamos con lo que se vende por kg (fresco a granel).
  const frescos = [...frutas, ...verduras].filter(p => /kg/i.test(p.presentacion || ''));
  if (frescos.length === 0) return null;

  // Preferimos la variedad estándar; solo si no hay ninguna, recurrimos a lo que sea.
  const estandar = frescos.filter(p => esVariedadEstandar(p.nombre));
  const candidatos = estandar.length > 0 ? estandar : frescos;

  candidatos.sort((a, b) => a.precio - b.precio);
  return candidatos[0];
}

async function scrape() {
  const scrapedAt = new Date().toISOString();
  const terminos = productosMercadoCentral();
  const filas = [];

  for (const termino of terminos) {
    try {
      const match = await buscarEnCoto(termino);
      if (match) {
        filas.push({
          scraped_at: scrapedAt,
          producto: termino, // mismo nombre que usa Mercado Central, para poder cruzar
          nombre_coto: match.nombre,
          precio_ars: match.precio,
          presentacion: match.presentacion,
        });
      } else {
        log(`Sin match fresco para "${termino}" en Coto.`);
      }
    } catch (err) {
      log(`Aviso: falló la búsqueda de "${termino}" (${err.message}), sigo con el resto.`);
    }
    await new Promise(r => setTimeout(r, 300)); // no golpear la API muy rápido
  }

  return filas;
}

function appendCsv(filas) {
  const headers = ['scraped_at', 'producto', 'nombre_coto', 'precio_ars', 'presentacion'];
  const isNew = !fs.existsSync(CSV_PATH);
  const lines = [];
  if (isNew) lines.push(headers.join(CSV_SEP));
  for (const f of filas) lines.push(headers.map(h => csvEscape(f[h])).join(CSV_SEP));
  fs.appendFileSync(CSV_PATH, lines.join('\n') + '\n');
}

(async () => {
  try {
    log('Arrancando scrape de Coto vía Precios Claros (oficial) ...');
    const filas = await scrape();
    if (filas.length === 0) throw new Error('No se encontró ningún producto — revisar la API o la sucursal.');
    appendCsv(filas);
    log(`OK — ${filas.length} de ${productosMercadoCentral().length} productos guardados en precios_historicos_coto.csv`);
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exitCode = 1;
  }
})();
