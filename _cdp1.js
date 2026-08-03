const http = require('http');
const fs = require('fs');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    }).on('error', reject);
  });
}

(async () => {
  const list = JSON.parse(await get('http://127.0.0.1:9222/json'));
  let page = list.find(t => t.url && t.url.includes('8766'));
  if (!page) {
    // open new tab via /json/new
    const created = JSON.parse(await get('http://127.0.0.1:9222/json/new?http://127.0.0.1:8766/index.html?web=1'));
    page = created;
    await new Promise(r => setTimeout(r, 5000));
  }
  console.log('page', page.url, page.title);

  const WebSocket = require('ws');
})().catch(async (e) => {
  // no ws module — use raw TCP-ish via chrome HTTP endpoint for evaluate
  console.error('fallback', e.message);
  // Use Fetch domain via CDP HTTP is not available; write a tiny websocket client
  const net = require('net');
  // Use puppeteer-core from global if present
});
