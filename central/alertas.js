// Detecta movimientos fuertes de precio y manda una alerta a Telegram.
// Un movimiento fuerte = oportunidad: si el mayorista cayó mucho, es el mejor
// momento para comprar/ofertar ese producto (más margen vs Coto que cualquier otra semana).
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'telegram-config.json');
const UMBRAL_PORCENTAJE = 25; // % de variación semanal a partir del cual avisamos

function cargarConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    if (!cfg.botToken || !cfg.chatId) return null;
    return cfg;
  } catch {
    return null;
  }
}

function pctToNum(s) {
  if (!s) return null;
  const n = parseFloat(String(s).replace('%', '').replace('+', ''));
  return Number.isNaN(n) ? null : n;
}

async function enviarTelegram(botToken, chatId, texto) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: texto, parse_mode: 'HTML' }),
  });
  if (!res.ok) throw new Error(`Telegram respondió ${res.status}: ${await res.text()}`);
}

function armarMensaje(filas) {
  const bajaron = filas
    .map(f => ({ ...f, pct: pctToNum(f.variacion_semanal) }))
    .filter(f => f.pct !== null && f.pct <= -UMBRAL_PORCENTAJE)
    .sort((a, b) => a.pct - b.pct);

  const subieron = filas
    .map(f => ({ ...f, pct: pctToNum(f.variacion_semanal) }))
    .filter(f => f.pct !== null && f.pct >= UMBRAL_PORCENTAJE)
    .sort((a, b) => b.pct - a.pct);

  if (bajaron.length === 0 && subieron.length === 0) return null;

  let texto = `<b>📊 Movimientos fuertes — Mercado Central</b>\n`;
  if (bajaron.length) {
    texto += `\n🟢 <b>Oportunidad (bajaron ${UMBRAL_PORCENTAJE}%+):</b>\n`;
    texto += bajaron.map(f => `• ${f.producto}: ${f.variacion_semanal} ($${Math.round(f.precio_promedio_kg_ars)}/kg)`).join('\n');
  }
  if (subieron.length) {
    texto += `\n\n🔴 <b>Ojo (subieron ${UMBRAL_PORCENTAJE}%+):</b>\n`;
    texto += subieron.map(f => `• ${f.producto}: ${f.variacion_semanal} ($${Math.round(f.precio_promedio_kg_ars)}/kg)`).join('\n');
  }
  return texto;
}

async function chequearYAlertar(filas, log) {
  const cfg = cargarConfig();
  if (!cfg) {
    log('Alertas: no hay telegram-config.json todavía, salteo el aviso.');
    return;
  }
  const mensaje = armarMensaje(filas);
  if (!mensaje) {
    log('Alertas: sin movimientos fuertes hoy, no mando nada.');
    return;
  }
  await enviarTelegram(cfg.botToken, cfg.chatId, mensaje);
  log('Alertas: mensaje mandado a Telegram.');
}

module.exports = { chequearYAlertar };
