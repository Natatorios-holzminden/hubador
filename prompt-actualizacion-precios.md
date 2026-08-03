# Prompt para actualizar precios reales en la página (Hubador/Conlat)

Actualizá los productos de `lib/mock-data.ts` (los que hoy son mock: tomates cherry, leche, asado, etc.) reemplazando 5 de ellos por datos reales de compra en Mercado Central de Quilmes vs Coto, con el precio grupal calculado a nivel de descuento cerrado (35%, 40% o 50% según el producto).

Mantené el resto del schema (`ProductoConGrupo`) igual — solo cambian `nombre`, `precio_unitario`, `precio_super`, `unidad` y `categoria_id`. Los dos precios que se muestran en la tarjeta de producto son:
- `precio_unitario` = precio grupal (el bajo, lo que cobra Hubador)
- `precio_super` = precio de referencia Coto (el alto, tachado en la card)

## Datos por producto

| Producto | Compra individual (Quilmes, $/kg) | Nivel de descuento | `precio_unitario` (grupal) | `precio_super` (Coto) | Ahorro mostrado |
|---|---|---|---|---|---|
| Mandarina Nova | $353 (cajón $6.000/17kg) | −40% | **$599** | **$999** | 40% |
| Naranja Jugo | $353 (cajón $6.000/17kg) | −40% | **$599** | **$999** | 40% |
| Tomate Red | $1.000 (cajón $15.000/15kg) | −50% | **$1.750** | **$3.499** | 50% |
| Manzana Red | $1.053 (cajón $20.000/19kg) | −50% | **$2.000** | **$3.999** | 50% |
| Morrón rojo (Pimiento Rojo) | $2.500 (cajón $20.000/8kg) | −35% | **$4.224** | **$6.499** | 35% |

`unidad` = `'kg'` en los cinco. `categoria_id`: usá `'frutas'` para mandarina, naranja y manzana; si no existe todavía `'verduras'` como categoría, creála para tomate y morrón (o usá `'frutas'` como fallback temporal).

## Código sugerido para `lib/mock-data.ts`

```ts
{ ...base, id: 'mandarina', nombre: 'Mandarina Nova', descripcion: 'Mandarina fresca de Mercado Central, compra grupal directa.', precio_unitario: 599, precio_super: 999, unidad: 'kg', imagen_url: null, destacado: true, minimo_grupal: 17, categoria_id: 'frutas' },
{ ...base, id: 'naranja', nombre: 'Naranja Jugo', descripcion: 'Naranja para jugo, Mercado Central, compra grupal directa.', precio_unitario: 599, precio_super: 999, unidad: 'kg', imagen_url: null, destacado: false, minimo_grupal: 17, categoria_id: 'frutas' },
{ ...base, id: 'tomate', nombre: 'Tomate Red', descripcion: 'Tomate fresco de Mercado Central, compra grupal directa.', precio_unitario: 1750, precio_super: 3499, unidad: 'kg', imagen_url: null, destacado: true, minimo_grupal: 15, categoria_id: 'verduras' },
{ ...base, id: 'manzana', nombre: 'Manzana Red', descripcion: 'Manzana Red de Mercado Central, compra grupal directa.', precio_unitario: 2000, precio_super: 3999, unidad: 'kg', imagen_url: null, destacado: false, minimo_grupal: 19, categoria_id: 'frutas' },
{ ...base, id: 'morron', nombre: 'Morrón rojo', descripcion: 'Pimiento rojo de Mercado Central, compra grupal directa.', precio_unitario: 4224, precio_super: 6499, unidad: 'kg', imagen_url: null, destacado: false, minimo_grupal: 8, categoria_id: 'verduras' },
```

`minimo_grupal` lo puse igual al tamaño del cajón de Quilmes (no se puede comprar menos que eso al mayorista) — ajustalo si tenés otro criterio.

## Fuente

Compra Quilmes 29/07/2026, Coto oferta 29/07/2026 (mismo origen que `datos-regla-nueva.js` en `conlat-SUBIR-WEB`). Niveles de descuento: 35/40/50% según margen de sobra de cada producto — ver `comparador-regla-nueva.html` para el detalle de costo real, comisión de líder y ganancia neta por producto.
