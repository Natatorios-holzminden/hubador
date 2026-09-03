# apps/

Frontends. Todos consumen el mismo backend (`services/api`) y la misma base de datos.

| App | Qué es | Estado |
|-----|--------|--------|
| `hubador/` | **Producto principal.** App de compra grupal por barrio. Migración de `../../index.html` a Vite + React + TS. | pendiente (Fase 3) |
| `comparador/` | Frontend(s) de comparación de precios que pide el cliente. Sirve las variantes actuales (`central`, `jorge`, y las que vengan) por **ruta** o por **config de build**, todas contra `GET /price-comparison`. Migración de `../../comparador/`, `../../central/`, `../../jorge/`. | pendiente (Fase 3) |

Regla: la lógica de negocio (precios, KPIs, tipos) sale de `@hubador/shared`, no se reimplementa por app.
