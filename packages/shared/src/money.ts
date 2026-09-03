/** Formato y parseo de montos en pesos argentinos — dedupe de `formatNumber`,
 *  `fmtPrecioAR`, `parsePrecioAR`, `pctToNum` repartidos por el repo. */

const AR_NUMBER = new Intl.NumberFormat('es-AR');
const AR_CURRENCY = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function formatNumberAR(n: number): string {
  return AR_NUMBER.format(Math.round(n));
}

export function formatARS(n: number): string {
  return AR_CURRENCY.format(Math.round(n));
}

/** Parsea "1.234,56" o "$ 2.999,00" (formato AR) a number. Devuelve 0 si no parsea. */
export function parseARS(input: string): number {
  const cleaned = String(input)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number.parseFloat(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

/** "+25%" | "-12,5%" | 25 -> number | null. */
export function pctToNumber(value: string | number | null | undefined): number | null {
  if (value == null) return null;
  const n = Number.parseFloat(String(value).replace('%', '').replace('+', '').replace(',', '.').trim());
  return Number.isNaN(n) ? null : n;
}
