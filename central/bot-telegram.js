// Bot de Telegram con comandos — corre todo el tiempo (no es una tarea diaria),
// escucha mensajes entrantes y contesta consultando los CSV que arman los scrapers.
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'telegram-config.json');
const MC_CSV = path.join(__dirname, 'precios_historicos.csv');
const COTO_CSV = path.join(__dirname, 'precios_historicos_coto.csv');
const OFFSET_PATH = path.join(__dirname, 'bot-offset.json');
const LOG_PATH = path.join(__dirname, 'bot-telegram.log');

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_PATH, line + '\n');
}

function cargarConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function parseCsv(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  if (!raw) return [];
  const lines = raw.split('\n');
  const headers = lines[0].split(';');
  return lines.slice(1).map(line => {
    const vals = line.split(';');
    const obj = {};
    headers.forEach((h, i) => obj[h] = (vals[i] || '').trim());
    return obj;
  });
}

function normalizar(s) {
  return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function ultimaFilaPorProducto(rows) {
  // Mercado Central guarda varias variedades (ej: 3 tipos de tomate) bajo el mismo nombre
  // genérico, todas con el mismo scraped_at (mismo run). Ante empate de fecha, nos quedamos
  // con la más barata en vez de "la primera que aparezca" — que era el bug real.
  const map = {};
  for (const r of rows) {
    const prev = map[r.producto];
    if (!prev) { map[r.producto] = r; continue; }
    const tNuevo = new Date(r.scraped_at).getTime();
    const tPrev = new Date(prev.scraped_at).getTime();
    if (tNuevo > tPrev) { map[r.producto] = r; continue; }
    if (tNuevo === tPrev) {
      const precioNuevo = parseFloat(r.precio_promedio_kg_ars ?? r.precio_ars);
      const precioPrev = parseFloat(prev.precio_promedio_kg_ars ?? prev.precio_ars);
      if (!Number.isNaN(precioNuevo) && precioNuevo < precioPrev) map[r.producto] = r;
    }
  }
  return map;
}

function buscar(query, mapa) {
  const q = normalizar(query);
  return Object.values(mapa).filter(r => normalizar(r.producto).includes(q)).slice(0, 6);
}

function pctToNum(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace('%', '').replace('+', ''));
  return Number.isNaN(n) ? null : n;
}

function cmdMercado(query) {
  const mapa = ultimaFilaPorProducto(parseCsv(MC_CSV));
  const res = buscar(query, mapa);
  if (res.length === 0) return `No encontré "${query}" en Mercado Central.`;
  return res.map(r => `<b>${r.producto}</b>: $${Math.round(r.precio_promedio_kg_ars)}/kg — semanal ${r.variacion_semanal || '-'}, mensual ${r.variacion_mensual || '-'}`).join('\n');
}

function cmdCoto(query) {
  const mapa = ultimaFilaPorProducto(parseCsv(COTO_CSV));
  const res = buscar(query, mapa);
  if (res.length === 0) return `No encontré "${query}" en Coto.`;
  return res.map(r => `<b>${r.nombre_coto}</b>: $${Math.round(r.precio_ars)} (${r.presentacion})`).join('\n');
}

function cmdTop() {
  const filas = Object.values(ultimaFilaPorProducto(parseCsv(MC_CSV)));
  const conPct = filas.map(f => ({ ...f, pct: pctToNum(f.variacion_semanal) })).filter(f => f.pct !== null);
  const bajaron = [...conPct].sort((a, b) => a.pct - b.pct).slice(0, 5);
  const subieron = [...conPct].sort((a, b) => b.pct - a.pct).slice(0, 5);
  let out = '<b>📉 Más bajaron esta semana (Mercado Central):</b>\n';
  out += bajaron.map(f => `• ${f.producto}: ${f.variacion_semanal} ($${Math.round(f.precio_promedio_kg_ars)}/kg)`).join('\n');
  out += '\n\n<b>📈 Más subieron:</b>\n';
  out += subieron.map(f => `• ${f.producto}: ${f.variacion_semanal} ($${Math.round(f.precio_promedio_kg_ars)}/kg)`).join('\n');
  return out;
}

function cmdHelp() {
  return [
    '<b>Comandos disponibles:</b>',
    'Escribí el nombre de un producto (ej: "tomate") y busco en los dos catálogos.',
    '/mercado &lt;producto&gt; — solo Mercado Central',
    '/coto &lt;producto&gt; — solo Coto Digital',
    '/brecha &lt;producto&gt; — cuánto más caro está en Coto vs Mercado Central',
    '/top — qué más subió y bajó esta semana en Mercado Central',
    '/help — esta lista',
  ].join('\n');
}

async function responder(cfg, chatId, texto) {
  await fetch(`https://api.telegram.org/bot${cfg.botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML' }),
  });
}

function cmdBrecha(query) {
  const mcMapa = ultimaFilaPorProducto(parseCsv(MC_CSV));
  const cotoMapa = ultimaFilaPorProducto(parseCsv(COTO_CSV));
  const mcMatches = buscar(query, mcMapa);
  if (mcMatches.length === 0) return `No encontré "${query}" en Mercado Central.`;

  return mcMatches.map(mc => {
    const coto = cotoMapa[mc.producto]; // mismo nombre en los dos catálogos, por diseño
    const precioMc = parseFloat(mc.precio_promedio_kg_ars);
    if (!coto) return `<b>${mc.producto}</b>\nMercado Central: $${Math.round(precioMc)}/kg\nTodavía no tengo dato de Coto para este.`;
    const precioCoto = parseFloat(coto.precio_ars);
    const brecha = Math.round(((precioCoto - precioMc) / precioMc) * 100);
    return `<b>${mc.producto}</b>\nMercado Central: $${Math.round(precioMc)}/kg\nCoto (${coto.nombre_coto}): $${Math.round(precioCoto)} (${coto.presentacion})\nBrecha: +${brecha}%`;
  }).join('\n\n');
}

function cmdBusquedaLibre(query) {
  return `<b>🏬 Mercado Central</b>\n${cmdMercado(query)}\n\n<b>🛒 Coto</b>\n${cmdCoto(query)}`;
}

function procesarComando(text) {
  const trimmed = text.trim();

  // Si no arranca con "/", lo tratamos como búsqueda libre en los dos catálogos —
  // así no hay que acordarse de la sintaxis de comandos.
  if (!trimmed.startsWith('/')) return cmdBusquedaLibre(trimmed);

  const [cmdRaw, ...resto] = trimmed.split(/\s+/);
  const cmd = cmdRaw.toLowerCase().replace(/@.*/, ''); // saca "@Hubador_central_bot" si lo escriben así
  const arg = resto.join(' ');

  if (cmd === '/start' || cmd === '/help') return cmdHelp();
  if (cmd === '/top') return cmdTop();
  if (cmd === '/mercado') return arg ? cmdBrecha(arg) : 'Usalo así: /mercado tomate';
  if (cmd === '/coto') return arg ? cmdCoto(arg) : 'Usalo así: /coto tomate';
  if (cmd === '/brecha') return arg ? cmdBrecha(arg) : 'Usalo así: /brecha tomate';
  return 'No conozco ese comando. Mandá /help para ver la lista, o escribí directo el nombre de un producto (ej: "tomate") para buscarlo en los dos catálogos.';
}

let offset = 0;
if (fs.existsSync(OFFSET_PATH)) {
  try { offset = JSON.parse(fs.readFileSync(OFFSET_PATH, 'utf8')).offset || 0; } catch {}
}

async function loop() {
  const cfg = cargarConfig();
  log('Bot arrancado, escuchando comandos...');
  while (true) {
    try {
      // timeout corto (no long-polling): en este entorno las conexiones largas se cortaban
      // y Telegram terminaba devolviendo 409 (conflicto con la conexión anterior "colgada").
      const res = await fetch(`https://api.telegram.org/bot${cfg.botToken}/getUpdates?offset=${offset}&timeout=0`);
      const json = await res.json();
      if (json.ok) {
        for (const upd of json.result) {
          offset = upd.update_id + 1;
          fs.writeFileSync(OFFSET_PATH, JSON.stringify({ offset }));
          const msg = upd.message;
          if (!msg || !msg.text) continue;
          log(`Comando recibido: ${msg.text}`);
          const respuesta = procesarComando(msg.text);
          await responder(cfg, msg.chat.id, respuesta);
        }
      } else if (json.error_code !== 409) {
        log(`Telegram respondió error: ${JSON.stringify(json)}`);
      }
      await new Promise(r => setTimeout(r, 2500));
    } catch (err) {
      log(`ERROR en el loop: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
}

loop();
