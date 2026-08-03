const { spawn } = require('child_process');
const fs = require('fs');
const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const outShot = 'C:\\Users\\WORK\\Downloads\\CONLATT7\\conlat-SUBIR-WEB\\_shot-detail.png';
const outDom = 'C:\\Users\\WORK\\Downloads\\CONLATT7\\conlat-SUBIR-WEB\\_dom-detail.html';
const url = 'http://127.0.0.1:8766/index.html';

// Use chrome remote debugging + puppeteer-core if available; else dump-dom with wide window
const args = [
  '--headless=new',
  '--disable-gpu',
  '--window-size=1440,1100',
  '--virtual-time-budget=15000',
  `--screenshot=${outShot}`,
  `--dump-dom`,
  url
];
const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
let html = '';
child.stdout.on('data', d => { html += d.toString('utf8'); });
child.stderr.on('data', d => process.stderr.write(d));
child.on('close', code => {
  fs.writeFileSync(outDom, html, 'utf8');
  console.log('exit', code, 'dom bytes', html.length);
  // Find rendered otros section in root
  const rootIdx = html.lastIndexOf('<div id="root">');
  const root = rootIdx >= 0 ? html.slice(rootIdx, rootIdx + 50000) : '';
  const hasOtros = root.includes('Otros productos') || root.includes('web-otros');
  const bodies = (root.match(/web-prod-body/g) || []).length;
  const cards = (root.match(/web-prod-card/g) || []).length;
  const names = ['Tomate', 'Papa', 'Zapallo', 'Cebolla', 'Naranja', 'Mandarina'];
  console.log({ hasOtros, bodies, cards, shotExists: fs.existsSync(outShot) });
  names.forEach(n => console.log(n, root.includes(n)));
  // extract a snippet around web-otros if present
  const i = root.indexOf('web-otros');
  if (i >= 0) console.log(root.slice(Math.max(0,i-100), i+800));
  else {
    // maybe mobile
    console.log('root starts:', root.slice(0, 400));
  }
});
