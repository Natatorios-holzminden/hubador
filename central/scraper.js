// Scraper diario de precios del Mercado Central (preciosdelcentral.com.ar)
// Guarda un historial en precios_historicos.csv — un run por día alcanza,
// porque el sitio mismo fecha cada producto (data-fecha) y no cambia más seguido.
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { chequearYAlertar } = require('./alertas');

const URL_BASE = 'https://preciosdelcentral.com.ar/buenosaires';
const CSV_PATH = path.join(__dirname, 'precios_historicos.csv');
const LOG_PATH = path.join(__dirname, 'scraper.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

const CSV_SEP = ';'; // Excel en configuración regional Argentina espera ; como separador de columnas

function csvEscape(v) {
  const s = String(v ?? '');
  return new RegExp(`["${CSV_SEP}\\n]`).test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function scrape() {
  const res = await fetch(URL_BASE, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HubadorBot/1.0)' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} al pedir ${URL_BASE}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const filas = [];
  const scrapedAt = new Date().toISOString();

  $('.card-body').each((_, el) => {
    const card = $(el);
    const nombre = card.find('.card-title').first().text().trim();
    if (!nombre) return;

    const fechaDato = card.closest('.card').find('[data-fecha]').first().attr('data-fecha') || '';

    let semanal = '';
    let mensual = '';
    card.find('.badge.rounded-pill').each((_, b) => {
      const t = $(b).text().trim();
      if (t.startsWith('Semanal:')) semanal = t.replace('Semanal:', '').trim();
      if (t.startsWith('Mensual:')) mensual = t.replace('Mensual:', '').trim();
    });

    const precioKgSpan = card.find('.firstPrice .precio-convertible').first();
    const precioKg = precioKgSpan.attr('data-ars') || '';

    filas.push({
      scraped_at: scrapedAt,
      producto: nombre,
      fecha_dato: fechaDato,
      precio_promedio_kg_ars: precioKg,
      variacion_semanal: semanal,
      variacion_mensual: mensual,
    });
  });

  return filas;
}

function appendCsv(filas) {
  const headers = ['scraped_at', 'producto', 'fecha_dato', 'precio_promedio_kg_ars', 'variacion_semanal', 'variacion_mensual'];
  const isNew = !fs.existsSync(CSV_PATH);
  const lines = [];
  if (isNew) lines.push(headers.join(CSV_SEP));
  for (const f of filas) lines.push(headers.map(h => csvEscape(f[h])).join(CSV_SEP));
  fs.appendFileSync(CSV_PATH, lines.join('\n') + '\n');
}

(async () => {
  try {
    log('Arrancando scrape de preciosdelcentral.com.ar ...');
    const filas = await scrape();
    if (filas.length === 0) throw new Error('No se encontró ningún producto — la estructura del sitio puede haber cambiado.');
    appendCsv(filas);
    log(`OK — ${filas.length} productos guardados en precios_historicos.csv`);
    await chequearYAlertar(filas, log);
  } catch (err) {
    log(`ERROR: ${err.message}`);
    process.exitCode = 1;
  }
})();
