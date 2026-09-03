/**
 * Icono por nombre de producto — consolida las TRES copias actuales:
 *  - central/app.js  getProduceSvg()      (SVG data-uri)
 *  - jorge/jorge.js  getFruitIcon()       (emoji)
 *  - central/build_realtime_dataset.py  get_svg_icon()
 * Reglas ordenadas: gana la primera que matchea. Extender = agregar una fila.
 */

function toBase64(str: string): string {
  // Isomorfo: Node (Buffer) o navegador (btoa). Los SVG de acá son ASCII.
  const g = globalThis as typeof globalThis & {
    Buffer?: { from(input: string, encoding: string): { toString(encoding: string): string } };
    btoa?: (data: string) => string;
  };
  if (g.Buffer) return g.Buffer.from(str, 'utf8').toString('base64');
  if (g.btoa) return g.btoa(str);
  throw new Error('toBase64: sin Buffer ni btoa disponibles en este entorno');
}

function svgDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${toBase64(svg)}`;
}

interface IconRule {
  match: readonly string[];
  emoji: string;
  svg: string;
}

const S = (body: string): string =>
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

const RULES: readonly IconRule[] = [
  {
    match: ['tomate'],
    emoji: '\u{1F345}',
    svg: S('<circle cx="32" cy="36" r="22" fill="#EF4444"/><path d="M32 14c-4 0-7 5-7 5s5 2 7 2 7-2 7-2-3-5-7-5z" fill="#10B981"/>'),
  },
  {
    match: ['papa', 'batata'],
    emoji: '\u{1F954}',
    svg: S('<ellipse cx="32" cy="34" rx="22" ry="16" fill="#D97706"/><circle cx="24" cy="28" r="2" fill="#92400E"/><circle cx="38" cy="38" r="2" fill="#92400E"/>'),
  },
  {
    match: ['cebolla'],
    emoji: '\u{1F9C5}',
    svg: S('<path d="M32 14C20 22 16 34 20 44c4 10 20 10 24 0 4-10 0-22-12-30z" fill="#C084FC"/><path d="M32 14v32" stroke="#E9D5FF" stroke-width="2" stroke-dasharray="3 3"/>'),
  },
  {
    match: ['zanahoria'],
    emoji: '\u{1F955}',
    svg: S('<path d="M38 16L18 50c-2 3 1 6 4 4l32-22c3-2 0-7-3-6z" fill="#F97316"/><path d="M42 14l6-6M38 18l10-2" stroke="#10B981" stroke-width="3" stroke-linecap="round"/>'),
  },
  {
    match: ['zapallito', 'pepino', 'pimiento', 'morron', 'zucchini'],
    emoji: '\u{1FAD1}',
    svg: S('<rect x="14" y="24" width="36" height="18" rx="9" transform="rotate(-25 32 33)" fill="#059669"/><rect x="18" y="26" width="28" height="14" rx="7" transform="rotate(-25 32 33)" fill="#10B981"/>'),
  },
  {
    match: ['lechuga', 'acelga', 'achicoria', 'espinaca', 'rucula', 'verdeo', 'berro'],
    emoji: '\u{1F96C}',
    svg: S('<path d="M20 48C12 36 14 18 32 14c18 4 20 22 12 34-6 9-18 9-24 0z" fill="#10B981"/><path d="M32 14v34" stroke="#D1FAE5" stroke-width="3" stroke-linecap="round"/>'),
  },
  {
    match: ['banana'],
    emoji: '\u{1F34C}',
    svg: S('<path d="M16 16c16 0 32 16 32 32 0 4-4 4-6 2-10-10-18-18-28-26-2-2-2-8 2-8z" fill="#FACC15"/>'),
  },
  {
    match: ['manzana'],
    emoji: '\u{1F34E}',
    svg: S('<path d="M32 20c-6-6-18-4-18 8 0 16 12 24 18 24s18-8 18-24c0-12-12-14-18-8z" fill="#EF4444"/><path d="M32 10c2 4 0 8 0 8" stroke="#78350F" stroke-width="3" stroke-linecap="round"/>'),
  },
  {
    match: ['pera'],
    emoji: '\u{1F350}',
    svg: S('<path d="M32 18c-4 0-6 4-6 8 0 3-6 6-6 14 0 8 6 12 12 12s12-4 12-12c0-8-6-11-6-14 0-4-2-8-6-8z" fill="#A3E635"/>'),
  },
  {
    match: ['naranja', 'mandarina', 'limon', 'pomelo'],
    emoji: '\u{1F34A}',
    svg: S('<circle cx="32" cy="34" r="20" fill="#F97316"/><circle cx="32" cy="34" r="14" fill="#FEF08A"/><path d="M32 18v32M18 34h32" stroke="#FFF" stroke-width="1.5"/>'),
  },
  {
    match: ['zapallo', 'calabaza'],
    emoji: '\u{1F383}',
    svg: S('<ellipse cx="32" cy="36" rx="20" ry="16" fill="#F97316"/><path d="M32 14v6" stroke="#059669" stroke-width="4" stroke-linecap="round"/>'),
  },
  {
    match: ['uva'],
    emoji: '\u{1F347}',
    svg: S('<circle cx="32" cy="26" r="6" fill="#9333EA"/><circle cx="24" cy="32" r="6" fill="#A855F7"/><circle cx="40" cy="32" r="6" fill="#A855F7"/><circle cx="32" cy="38" r="6" fill="#C084FC"/>'),
  },
  {
    match: ['frutilla'],
    emoji: '\u{1F353}',
    svg: S('<path d="M32 16C18 16 14 32 20 46c4 8 16 12 24 4 6-8 6-22-12-34z" fill="#EF4444"/><circle cx="26" cy="26" r="1" fill="#FDE047"/><circle cx="36" cy="30" r="1" fill="#FDE047"/>'),
  },
  {
    match: ['hongo', 'champignon'],
    emoji: '\u{1F344}',
    svg: S('<path d="M14 34c0-12 8-18 18-18s18 6 18 18z" fill="#EF4444"/><rect x="28" y="34" width="8" height="16" rx="3" fill="#F5F5DC"/>'),
  },
];

const DEFAULT_EMOJI = '\u{1F9FA}';
const DEFAULT_SVG = S('<circle cx="32" cy="36" r="20" fill="#10B981"/><path d="M32 16c-3 0-6 4-6 4s5 2 6 2 6-2 6-2-3-4-6-4z" fill="#059669"/>');

function ruleFor(name: string): IconRule | null {
  const n = (name || '').toLowerCase();
  for (const rule of RULES) {
    if (rule.match.some((kw) => n.includes(kw))) return rule;
  }
  return null;
}

export function produceEmoji(name: string): string {
  return ruleFor(name)?.emoji ?? DEFAULT_EMOJI;
}

export function produceSvgDataUri(name: string): string {
  return svgDataUri(ruleFor(name)?.svg ?? DEFAULT_SVG);
}
