import { describe, expect, it } from 'vitest';
import {
  aggregateKpis,
  compareSources,
  gapPct,
  savingsPct,
  savingsPerUnit,
} from './pricing.js';

describe('gapPct', () => {
  it('calcula el sobreprecio en %', () => {
    expect(gapPct(1000, 3000)).toBe(200);
  });
  it('devuelve 0 si la base no es válida', () => {
    expect(gapPct(0, 3000)).toBe(0);
    expect(gapPct(-5, 3000)).toBe(0);
  });
});

describe('savings', () => {
  it('ahorro absoluto por unidad', () => {
    expect(savingsPerUnit(1000, 2500)).toBe(1500);
  });
  it('ahorro como % del retail', () => {
    expect(savingsPct(750, 1000)).toBe(25);
  });
});

describe('compareSources', () => {
  it('compara contra mercado_central por defecto y ordena por precio', () => {
    const res = compareSources({ mercado_central: 1000, jorge: 1500, coto: 3000 });
    expect(res).not.toBeNull();
    expect(res!.reference).toBe('mercado_central');
    expect(res!.referencePrice).toBe(1000);
    expect(res!.bySource.map((s) => s.source)).toEqual(['mercado_central', 'jorge', 'coto']);
    expect(res!.cheapest.source).toBe('mercado_central');
    expect(res!.dearest.source).toBe('coto');
    expect(res!.dearest.gapPct).toBe(200);
    expect(res!.dearest.savingsVsReference).toBe(2000);
  });

  it('cae a la fuente más barata si falta la referencia', () => {
    const res = compareSources({ jorge: 1500, coto: 3000 });
    expect(res!.reference).toBe('jorge');
    expect(res!.referencePrice).toBe(1500);
  });

  it('ignora precios no positivos y devuelve null si no queda ninguno', () => {
    expect(compareSources({ coto: 0, jorge: -1 })).toBeNull();
    expect(compareSources({})).toBeNull();
  });
});

describe('aggregateKpis', () => {
  it('promedia sobreprecio y ahorro de la fuente más cara vs referencia', () => {
    const kpis = aggregateKpis([
      { pricesBySource: { mercado_central: 1000, coto: 3000 } }, // gap 200, save 2000
      { pricesBySource: { mercado_central: 500, coto: 1500 } }, // gap 200, save 1000
    ]);
    expect(kpis.count).toBe(2);
    expect(kpis.avgGapPct).toBe(200);
    expect(kpis.avgSavings).toBe(1500);
  });

  it('saltea items sin precios válidos', () => {
    const kpis = aggregateKpis([{ pricesBySource: {} }]);
    expect(kpis.count).toBe(0);
    expect(kpis.avgGapPct).toBe(0);
  });
});
