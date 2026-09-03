# Hubador — Refactor y hoja de ruta

## Idea de negocio (ordenada)

- **Producto:** Hubador, la app de **compra grupal por barrio**. Ahí están los usuarios y los pedidos.
- **Feature / moat:** la comparación de precios (mayorista vs góndola). Justifica el producto y el cliente
  la necesita como frontend(s) propio(s) → vive en `apps/comparador/`.
- **Infraestructura:** el pipeline de scrapers + alertas Telegram → `services/ingestion/`, escribe a la DB.

Una sola base de datos, un solo backend, una sola ingesta. Varios frontends está OK.

## Estructura objetivo del monorepo

```
hubador/
├─ apps/
│  ├─ hubador/        # app de compra grupal (ex index.html) — Vite + React + TS
│  └─ comparador/     # frontend(s) de precios (ex comparador/ + central/ + jorge/)
├─ services/
│  ├─ api/            # NestJS + Prisma (PostgreSQL) — auth, perfiles, grupos, pedidos, precios
│  └─ ingestion/      # scrapers como worker con cron -> tabla price_points
├─ packages/
│  └─ shared/         # @hubador/shared: tipos + zod + modelo de precios + iconos  ✅ creado
├─ prisma/            # schema.prisma + migraciones (fuente de verdad de la DB)
└─ package.json       # npm workspaces
```

## Modelo de datos (Fase 1)

```
profiles      id(=auth user) · email · nombre · barrio · telefono · direccion · lat · lng · role
products      id · nombre · categoria · unidad · variedad · origen · imagen · top_rank
price_points  id · product_id → · source(mercado_central|coto|jorge) · precio · moneda · scraped_at
groups        id · product_id → · barrio · precio_unitario · kg_objetivo · kg_completados
              · estado(formacion|cerrado|entregado|cancelado) · deadline · creado_por →
orders        id · user_id → · group_id → · product_id → · qty_kg · precio_unitario · total · estado
order_events  id · order_id → · estado · at
telegram_subs id · chat_id · user_id? · filtros
```

`price-comparison` = query que cruza el último `price_point` por fuente y producto (no es tabla).

## Auth — propia, sin Supabase

El API emite y verifica sus propios tokens:
- **Access token** JWT HS256 (`JWT_SECRET`), corta vida (15m).
- **Refresh token** opaco, guardado hasheado en `refresh_tokens`, con rotación.
- **Contraseñas** con `scrypt` de `node:crypto` (sin módulos nativos).
- `POST /auth/register` · `/auth/login` · `/auth/refresh` · `/auth/logout`.

Interfaz `AuthProvider` como seam: cambiar a un IdP externo (OAuth) más adelante = otra
implementación, sin tocar `JwtAuthGuard` ni los frontends. Password reset y verificación de
email quedan pendientes (necesitan proveedor de mail).

## Base de datos

- **Local**: Postgres en Docker (`docker compose up -d db`).
- **Producción**: Postgres gestionado (Neon / Railway / RDS). La migración de datos desde el
  sistema viejo se hace recién cuando la app esté por salir a producción.

## Hoja de ruta

### Fase 0 — Preparación  ✅ HECHA
- [x] Monorepo con npm workspaces (`package.json`, `tsconfig.base.json`, `.gitignore`, `.nvmrc`)
- [x] `packages/shared`: tipos de dominio, schemas zod, modelo de precios unificado, iconos de producto, tests
- [x] `.env.example` con todas las variables
- [x] `npm install` + `npm run typecheck` + `npm test` en verde
- [x] Base de datos local: `docker-compose.yml` con Postgres 16
- [ ] Elegir hosting de producción: API (Railway/Render/Fly) · Postgres (Neon/Railway) · fronts (Vercel)

### Fase 1 — Backend + DB de usuarios (2–3 sem)  ← foco
- [x] Esqueleto NestJS: config (zod), módulo Prisma, healthcheck, pino, filtro de errores, validación, CORS, helmet, throttler
- [x] `prisma/schema.prisma` con el modelo de datos completo (+ `refresh_tokens`)
- [x] **Auth propia** (sin Supabase): `AuthProvider` seam + `LocalAuthProvider` (JWT HS256),
      `AuthService` register/login/refresh/logout, refresh con rotación, `scrypt` para contraseñas,
      `JwtAuthGuard` global + `RolesGuard`
- [x] Endpoints implementados: `/auth/*`, `GET /me`, `PATCH /me/profile`, `GET /products`,
      `GET /price-comparison`, `GET /groups`, `POST /groups/:id/join`, `GET /me/orders`,
      `GET /orders/:id`, `GET /admin/users`, `GET /admin/groups`
- [x] Seed desde `central/data.json` + admin opcional (`ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- [x] `POST /groups` (admin) para crear grupos de compra
- [x] Tests e2e (`npm run test:e2e -w @hubador/api`): register → login → `/me` → refuerzo,
      y admin crea grupo → vecino se une → aparece en `/me/orders`
- [ ] Primera migración real (`npm run db:migrate` contra el Postgres de Docker) ← siguiente paso manual
- [ ] Password reset + verificación de email (proveedor de mail)
- [ ] Cierre/entrega de grupos (más estados que `formacion`)
- [ ] Puente: el `index.html` actual escribe pedidos/perfil contra el API nuevo

### Fase 2 — Ingesta de precios (1–2 sem)
- [ ] `PriceSource` + adapters `MercadoCentralSource`, `PreciosClarosCotoSource`, `JorgeSource`
- [ ] Escritura a `price_points` con Prisma; detección de cambio de HTML → falla ruidosa + alerta
- [ ] Cron (worker o cron de plataforma)
- [ ] `alertas.js` y bot leen el API

### Fase 3 — Refactor de frontends (3–4 sem)
- [ ] `apps/hubador`: Vite + React + TS, pantalla por pantalla, componentes responsive (se van los gemelos Mobile*/Web*)
- [ ] Cliente de API tipado + React Query; partir `SelectionContext` en Auth/Cart/UI; localStorage solo para borradores
- [ ] `apps/comparador`: las 3 dashboards a un frontend con variantes por ruta/config
- [ ] Borrar duplicados: `inicio.html`, `Conlat Mobile Preview.html`, `_dom.html`, `_cdp1.js`, `_render-check.js`, `comparador-*.html`

### Fase 4 — Endurecer para lanzamiento (1–2 sem)
- [ ] Todo acceso a datos pasa por el API; el Postgres de producción no es accesible desde afuera
- [ ] `JWT_SECRET` fuerte por entorno; rotación de secretos documentada
- [ ] Observabilidad: Sentry, uptime, backups automáticos, métricas básicas
- [ ] Términos + privacidad (direcciones y teléfonos), flujos de email
- [ ] Staging + prueba de carga del camino de pedido

### Fase 5 — Post-lanzamiento
Pagos MercadoPago · cierre/entrega de grupos · notificaciones · panel admin · CI/CD + E2E Playwright

## Seguridad — acciones

1. La app vieja (`index.html` + `config.js`) sigue usando Supabase hasta que el puente al API
   nuevo esté hecho. Mientras tanto, la anon key pública sólo es segura si Supabase tiene RLS.
   Como vamos a dejar Supabase, la prioridad es **hacer el puente**, no configurar RLS.
2. **Nunca** commitear `.env`, `JWT_SECRET`, `sb_secret_...` ni `telegram-config.json` (ya en `.gitignore`).
3. Al migrar a Vite, `config.js` desaparece: la config del front pasa a `.env` / build (`VITE_*`).
4. `central/config.js` / `telegram-config.json`: mover a variables de entorno en `services/`.

## Cómo correr lo que ya existe

```bash
nvm use                              # Node 22
cp .env.example .env                 # completar DATABASE_URL y JWT_SECRET
docker compose up -d db              # Postgres local
npm install                         # instala workspaces
npm run typecheck                   # tsc en todos los paquetes
npm test                            # vitest (shared + api)
npm run db:migrate -w @hubador/api  # crea las tablas en el Postgres de Docker
npm run db:seed    -w @hubador/api  # carga central/data.json
npm run dev        -w @hubador/api  # API en http://localhost:3000
```
