/**
 * Modelo de precios — UNA sola definición.
 * Hoy la fórmula de "sobreprecio" está repetida (con variantes) en
 * central/app.js, comparador/app.js, jorge/jorge.js, central/bot-telegram.js
 * y central/build_realtime_dataset.py. Todo eso debe pasar a importar de acá.
 */

import type { Source } from './types.js';

export const REFERENCE_SOURCE: Source = 'mercado_central';

/** Sobreprecio (markup / brecha / remarcación) de `retail` respecto de `base`, en %. */
export function gapPct(base: number, retail: number): number {
  if (!(base > 0)) return 0;
  return ((retail - base) / base) * 100;
}

/** Ahorro por unidad al comprar a `base` en vez de a `retail`. */
export function savingsPerUnit(base: number, retail: number): number {
  return retail - base;
}

/** Ahorro como porcentaje del precio `retail` (cuánto te sacás de encima). */
export function savingsPct(base: number, retail: number): number {
  if (!(retail > 0)) return 0;
  return ((retail - base) / retail) * 100;
}

export interface SourceComparison {
  source: Source;
  precio: number;
  /** Sobreprecio vs la fuente de referencia. */
  gapPct: number;
  /** Diferencia absoluta vs la fuente de referencia. */
  savingsVsReference: number;
}

export interface ComparisonResult {
  reference: Source;
  referencePrice: number;
  /** Ordenado de más barato a más caro. */
  bySource: SourceComparison[];
  cheapest: SourceComparison;
  dearest: SourceComparison;
}

/**
 * Compara el precio de un producto entre fuentes.
 * Si no hay precio para la fuente de referencia, cae a la más barata disponible.
 * Devuelve `null` si no hay ningún precio válido.
 */
export function compareSources(
  pricesBySource: Partial<Record<Source, number>>,
  reference: Source = REFERENCE_SOURCE,
): ComparisonResult | null {
  const entries = Object.entries(pricesBySource).filter(
    (e): e is [Source, number] => typeof e[1] === 'number' && e[1] > 0,
  );
  if (entries.length === 0) return null;

  const refPrice = pricesBySource[reference];
  const hasRef = typeof refPrice === 'number' && refPrice > 0;

  const cheapestEntry = entries.reduce((a, b) => (b[1] < a[1] ? b : a));
  const actualReference: Source = hasRef ? reference : cheapestEntry[0];
  const base: number = hasRef ? (refPrice as number) : cheapestEntry[1];

  const bySource: SourceComparison[] = entries
    .map(([source, precio]) => ({
      source,
      precio,
      gapPct: gapPct(base, precio),
      savingsVsReference: savingsPerUnit(base, precio),
    }))
    .sort((a, b) => a.precio - b.precio);

  return {
    reference: actualReference,
    referencePrice: base,
    bySource,
    cheapest: bySource[0]!,
    dearest: bySource[bySource.length - 1]!,
  };
}

export interface ComparableItem {
  pricesBySource: Partial<Record<Source, number>>;
}

export interface Kpis {
  count: number;
  /** Promedio del sobreprecio de la fuente más cara vs la referencia. */
  avgGapPct: number;
  /** Promedio del ahorro absoluto de la fuente más cara vs la referencia. */
  avgSavings: number;
}

export function aggregateKpis(
  items: readonly ComparableItem[],
  reference: Source = REFERENCE_SOURCE,
): Kpis {
  let gapSum = 0;
  let savingsSum = 0;
  let n = 0;
  for (const item of items) {
    const cmp = compareSources(item.pricesBySource, reference);
    if (!cmp) continue;
    n += 1;
    gapSum += cmp.dearest.gapPct;
    savingsSum += cmp.dearest.savingsVsReference;
  }
  return {
    count: n,
    avgGapPct: n ? gapSum / n : 0,
    avgSavings: n ? savingsSum / n : 0,
  };
}
