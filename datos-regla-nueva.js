/* Regla de precio — descuento en niveles CERRADOS (35% / 40% / 50%), la ganancia sale como resultado
 * Lógica (charlada 30/07/2026, versión niveles cerrados):
 *  - Cada producto tiene un descuento_tier fijo: 35, 40 o 50 (%). Se elige el más cercano al que
 *    daría 10% de ganancia neta pareja — así el número que se muestra en la web es siempre redondo,
 *    nunca cosas como "52%" o "36,8%".
 *  - Precio final = coto_kg × (1 − descuento_tier / 100)
 *  - Costo aterrizado = compra × flete_merma_mult (compra + flete + merma)
 *  - Ganancia neta = final − costo aterrizado − comisión líder − cobro. Ya NO es fija:
 *    varía por producto según cuánto margen deja el nivel de descuento asignado — se muestra tal cual.
 */
window.REGLA_NUEVA = {
  generado: "2026-07-30",
  titulo: "Cómo se arma tu precio — niveles cerrados de descuento (35/40/50%)",
  descripcion:
    "Mismo origen de datos que el comparador (compra Quilmes 29/07 vs Coto oferta 29/07). Cada producto va a un nivel cerrado de descuento vs Coto (35%, 40% o 50%) según cuánto margen de sobra tiene; la ganancia neta es el resultado, no un número fijo.",
  reglas: {
    flete_merma_mult: 1.232, // costo real de aterrizar el kg: +8% flete +12% merma (estimado, ver nota)
    comision_lider: 0.10,    // % del precio final que se lleva el líder de nodo
    costo_cobro: 0.05,       // % que se lleva Mercado Pago / cobro online
    descuento_min_referencia: 0.35, // piso de referencia: avisa si algún producto queda por debajo
    nota: "Esto es un ejercicio de precios, no cambia lo que ya está publicado en Conlat/HUBADOR. La merma (12%) es un promedio: cítricos y manzana suelen durar más (merma real menor), tomate y morrón se pudren más rápido (merma real puede ser mayor) — validar con la operación real antes de fijar precios definitivos.",
  },
  fuente_quilmes: "Lista compra Quilmes — 29/07/2026 (cajones)",
  fuente_coto: "Coto Digital frescos — precios oferta cargados 29/07/2026",
  filas: [
    {
      id: "mandarina",
      producto: "Mandarina Nova",
      descuento_tier: 40, // ratio Coto/Compra 2,8x — no da para 50%, pero de sobra para 40%
      quilmes: { cajon_kg: 17, cajon_precio: 6000, compra_kg: 6000 / 17, presentacion: "$6.000 / 17 kg" },
      coto: { producto: "Mandarina Nova x Kg", precio_kg: 999, regular: 1999 },
    },
    {
      id: "naranja",
      producto: "Naranja",
      descuento_tier: 40, // mismo cajón que mandarina, mismo ratio
      quilmes: { cajon_kg: 17, cajon_precio: 6000, compra_kg: 6000 / 17, presentacion: "$6.000 / 17 kg" },
      coto: { producto: "Naranja Jugo x Kg", precio_kg: 999, regular: 2499 },
    },
    {
      id: "tomate",
      producto: "Tomate",
      descuento_tier: 50, // ratio 3,5x — el más alto junto con manzana, va al techo
      quilmes: { cajon_kg: 15, cajon_precio: 15000, compra_kg: 15000 / 15, presentacion: "$15.000 / 15 kg" },
      coto: { producto: "Tomate Red x Kg", precio_kg: 3499, regular: 4299 },
    },
    {
      id: "manzana",
      producto: "Manzana",
      descuento_tier: 50, // ratio 3,8x — el que más margen de sobra tiene
      quilmes: { cajon_kg: 19, cajon_precio: 20000, compra_kg: 20000 / 19, presentacion: "$20.000 / 19 kg" },
      coto: { producto: "Manzana Red x Kg", precio_kg: 3999, regular: 5499 },
    },
    {
      id: "morron-rojo",
      producto: "Morrón rojo",
      descuento_tier: 35, // ratio 2,6x — el más ajustado, va al piso
      quilmes: { cajon_kg: 8, cajon_precio: 20000, compra_kg: 20000 / 8, presentacion: "$20.000 / 8 kg" },
      coto: { producto: "Pimiento Rojo x Kg", precio_kg: 6499, regular: 8499 },
    },
  ],
};

(function enrich(data) {
  const { flete_merma_mult, comision_lider, costo_cobro, descuento_min_referencia } = data.reglas;

  for (const f of data.filas) {
    const compra = f.quilmes.compra_kg;
    const coto = f.coto.precio_kg;
    const tier = f.descuento_tier; // 35, 40 o 50 — número cerrado, fijo por producto

    const final = coto * (1 - tier / 100);
    const costoAterrizado = compra * flete_merma_mult; // compra + flete + merma
    const comisionPesos = final * comision_lider;
    const cobroPesos = final * costo_cobro;
    const gananciaNeta = final - costoAterrizado - comisionPesos - cobroPesos; // resultado, no fijo

    const markupPct = compra ? ((final - compra) / compra) * 100 : null;
    const descuentoPct = coto ? ((coto - final) / coto) * 100 : null; // = tier, queda prolijo
    const gananciaNetaPct = final ? (gananciaNeta / final) * 100 : null;

    f.calculo = {
      final: Math.round(final * 100) / 100,
      descuento_tier: tier,
      markup_pct: Math.round(markupPct * 10) / 10,
      descuento_pct: Math.round(descuentoPct * 10) / 10,
      ok_banda_40_50: tier >= descuento_min_referencia * 100 - 0.5,
      costo_aterrizado: Math.round(costoAterrizado * 100) / 100,
      comision_lider_pesos: Math.round(comisionPesos * 100) / 100,
      cobro_pesos: Math.round(cobroPesos * 100) / 100,
      ganancia_neta: Math.round(gananciaNeta * 100) / 100,
      ganancia_neta_pct: Math.round(gananciaNetaPct * 10) / 10,
    };
  }
})(window.REGLA_NUEVA);
