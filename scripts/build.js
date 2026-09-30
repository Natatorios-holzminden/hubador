// Genera index.html + app.bundle.js (lo que se publica en hubador.com) a partir de src/index.html.
//
// Por que existe esto: src/index.html tiene el codigo React/JSX metido en <script type="text/babel">,
// y sin este build, el navegador de cada visitante tiene que compilar ese JSX en vivo con Babel
// (varios segundos en cada visita). Este script lo compila UNA sola vez acá, y publica ya listo.
//
// No se edita index.html (raiz) a mano: se pisa solo en cada build. Editar siempre src/index.html.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC_HTML = path.join(ROOT, 'src', 'index.html');
const OUT_HTML = path.join(ROOT, 'index.html');
const OUT_BUNDLE = path.join(ROOT, 'app.bundle.js');
const TMP_JSX = path.join(ROOT, '.build-tmp.jsx');

const BABEL_STANDALONE_TAG =
  '<script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js"></script>\n';

const html = fs.readFileSync(SRC_HTML, 'utf8');

const scriptRe = /<script type="text\/babel">([\s\S]*?)<\/script>/g;
let jsx = '';
let matchCount = 0;
let m;
while ((m = scriptRe.exec(html))) {
  jsx += m[1] + '\n';
  matchCount++;
}
if (matchCount === 0) {
  console.error('[build] No se encontro ningun <script type="text/babel"> en src/index.html');
  process.exit(1);
}

fs.writeFileSync(TMP_JSX, jsx, 'utf8');
try {
  execFileSync(
    'npx',
    ['--yes', 'esbuild@0.24.0', TMP_JSX, '--minify', '--target=es2019', `--outfile=${OUT_BUNDLE}`],
    { stdio: 'inherit', shell: true }
  );
} finally {
  fs.unlinkSync(TMP_JSX);
}

const bundleContent = fs.readFileSync(OUT_BUNDLE, 'utf8');
const hash = crypto.createHash('md5').update(bundleContent).digest('hex').slice(0, 8);

// El <script> con el bundle va en la posicion del ULTIMO bloque original (al final
// del body, despues de <div id="root">). Si va antes, ReactDOM.render se ejecuta
// antes de que el nodo #root exista en el DOM y la pagina queda en blanco.
let idx = 0;
let outHtml = html.replace(scriptRe, () => {
  idx++;
  if (idx === matchCount) {
    return `<script src="app.bundle.js?v=${hash}"></script>`;
  }
  return '';
});

outHtml = outHtml.replace(BABEL_STANDALONE_TAG, '');
outHtml =
  '<!-- ARCHIVO GENERADO AUTOMATICAMENTE. No editar a mano: editar src/index.html y hacer push. -->\n' +
  outHtml;

fs.writeFileSync(OUT_HTML, outHtml, 'utf8');
console.log(`[build] OK: index.html y app.bundle.js generados (hash ${hash}, ${matchCount} bloques JSX)`);
