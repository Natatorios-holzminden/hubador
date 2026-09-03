# services/

Backend y trabajos de fondo.

| Servicio | Qué es | Estado |
|----------|--------|--------|
| `api/` | API HTTP en NestJS + Prisma (PostgreSQL). Dueña de auth, perfiles, catálogo, grupos, pedidos y la vista de comparación de precios. | pendiente (Fase 1) |
| `ingestion/` | Worker con cron. Un adapter por fuente (`MercadoCentralSource`, `PreciosClarosCotoSource`, `JorgeSource`) que implementa `PriceSource { fetch(): Promise<PricePoint[]> }` y escribe en la tabla `price_points`. Reemplaza `../../central/scraper*.js` y los CSV. | pendiente (Fase 2) |

El bot de Telegram (`../../central/bot-telegram.js`, `alertas.js`) pasa a consumir el API en vez de leer CSVs.
