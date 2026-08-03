/* Actualización 29/07/2026 — costos Quilmes (compra) → Conlat → Coto
 * Reglas:
 *  - Conlat candidato = compra_kg × 1,30
 *  - Tope vs Coto = coto_kg × 0,65 (−35% vs góndola)
 *  - Piso envío/gastos = compra_kg × 1,20
 *  - Conlat final = min(candidato, tope); se marca alerta si queda bajo el piso
 *  - La góndola HUBADOR (home) NO se actualiza todavía
 */
window.COMPARACION_29_07 = {
  generado: "2026-07-29",
  titulo: "Actualización 29/07 — Quilmes → Conlat → Coto",
  descripcion:
    "Precios de compra (cajones Quilmes). Conlat = compra × 1,30, topeado a −35% vs Coto. Piso de referencia ×1,20 para envío/gastos.",
  reglas: {
    markup_conlat: 1.3,
    tope_vs_coto: 0.65,
    piso_envio: 1.2,
    nota_gondola: "Home / góndola HUBADOR todavía no usa estos precios.",
  },
  fuente_quilmes: "Lista compra Quilmes — 29/07/2026 (cajones)",
  fuente_coto: "Coto Digital frescos — precios oferta cargados 29/07/2026",
  filas: [
    {
      id: "mandarina",
      producto: "Mandarina Nova",
      nuevo: true,
      unidad: "kg",
      quilmes: {
        cajon_kg: 17,
        cajon_precio: 6000,
        compra_kg: 6000 / 17,
        presentacion: "$6.000 / 17 kg",
      },
      coto: {
        producto: "Mandarina Nova x Kg",
        precio_kg: 999,
        oferta: 999,
        regular: 1999,
      },
    },
    {
      id: "naranja",
      producto: "Naranja",
      nuevo: true,
      unidad: "kg",
      quilmes: {
        cajon_kg: 17,
        cajon_precio: 6000,
        compra_kg: 6000 / 17,
        presentacion: "$6.000 / 17 kg",
      },
      coto: {
        producto: "Naranja Jugo x Kg",
        precio_kg: 999,
        oferta: 999,
        regular: 2499,
      },
    },
    {
      id: "tomate",
      producto: "Tomate",
      nuevo: true,
      unidad: "kg",
      quilmes: {
        cajon_kg: 15,
        cajon_precio: 15000,
        compra_kg: 15000 / 15,
        presentacion: "$15.000 / 15 kg",
      },
      coto: {
        producto: "Tomate Red x Kg",
        precio_kg: 3499,
        oferta: 3499,
        regular: 4299,
      },
    },
    {
      id: "manzana",
      producto: "Manzana",
      nuevo: true,
      unidad: "kg",
      quilmes: {
        cajon_kg: 19,
        cajon_precio: 20000,
        compra_kg: 20000 / 19,
        presentacion: "$20.000 / 19 kg",
      },
      coto: {
        producto: "Manzana Red x Kg",
        precio_kg: 3999,
        oferta: 3999,
        regular: 5499,
      },
    },
    {
      id: "morron-rojo",
      producto: "Morrón rojo",
      nuevo: true,
      unidad: "kg",
      quilmes: {
        cajon_kg: 8,
        cajon_precio: 20000,
        compra_kg: 20000 / 8,
        presentacion: "$20.000 / 8 kg",
      },
      coto: {
        producto: "Pimiento Rojo x Kg",
        precio_kg: 6499,
        oferta: 6499,
        regular: 8499,
      },
    },
  ],
};

(function enrich(data) {
  const { markup_conlat, tope_vs_coto, piso_envio } = data.reglas;
  for (const f of data.filas) {
    const compra = f.quilmes.compra_kg;
    const coto = f.coto.precio_kg;
    const candidato = compra * markup_conlat;
    const tope = coto * tope_vs_coto;
    const piso = compra * piso_envio;
    const conlat = Math.min(candidato, tope);
    const vsCotoPesos = coto - conlat;
    const vsCotoPct = coto ? (vsCotoPesos / coto) * 100 : null;
    const margenCompraPct = compra ? ((conlat - compra) / compra) * 100 : null;
    const topeado = candidato > tope + 0.01;
    const bajoPiso = conlat + 0.01 < piso;

    f.conlat = {
      precio_kg: Math.round(conlat * 100) / 100,
      candidato_kg: Math.round(candidato * 100) / 100,
      tope_kg: Math.round(tope * 100) / 100,
      piso_kg: Math.round(piso * 100) / 100,
      topeado_por_coto: topeado,
      alerta_piso_envio: bajoPiso,
    };
    f.analisis = {
      ahorro_vs_coto_pesos: Math.round(vsCotoPesos * 100) / 100,
      ahorro_vs_coto_pct: Math.round(vsCotoPct * 10) / 10,
      margen_sobre_compra_pct: Math.round(margenCompraPct * 10) / 10,
      ok_menos_35_coto: vsCotoPct >= 34.5,
      ok_margen_envio_20: !bajoPiso,
    };
  }
})(window.COMPARACION_29_07);
