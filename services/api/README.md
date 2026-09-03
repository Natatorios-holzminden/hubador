# @hubador/api

API HTTP de Hubador — **NestJS + Prisma + PostgreSQL (Docker en local)**.

## Puesta en marcha

```bash
cp ../../.env.example ../../.env          # completar DATABASE_URL y JWT_SECRET
docker compose up -d db                   # Postgres local (crea hubador y hubador_test)
npm install                              # desde la raíz del monorepo
npm run db:migrate  -w @hubador/api      # crea las tablas
npm run db:seed     -w @hubador/api      # carga central/data.json (+ admin si ADMIN_* está seteado)
npm run dev         -w @hubador/api      # http://localhost:3000
```

Tests:

```bash
npm test     -w @hubador/api    # unitarios, sin DB
npm run test:e2e -w @hubador/api    # e2e contra hubador_test (necesita Docker)
```

## Arquitectura

```
src/
├─ config/      env.ts        — validación de entorno con zod (no arranca si falta algo)
├─ prisma/      PrismaService — conexión, global
├─ auth/        AuthProvider (seam) + LocalAuthProvider (JWT propio HS256)
│               AuthService (register/login/refresh/logout) · TokenService (access + refresh con rotación)
│               password.ts (scrypt, sin deps nativas) · JwtAuthGuard (global) · RolesGuard
├─ common/      ZodValidationPipe · AllExceptionsFilter · toNum (Decimal→number)
└─ <feature>/   controller → service → repository   (Prisma sólo se toca en repository)
```

Reglas de negocio de precios (markup/ahorro/comparación) viven en `@hubador/shared`, no acá.

## Endpoints

| Método | Ruta | Auth | Qué hace |
|--------|------|------|----------|
| GET  | `/health` | pública | estado del proceso y de la DB |
| POST | `/auth/register` | pública | crea usuario (email + password) → `{ accessToken, refreshToken, user }` |
| POST | `/auth/login` | pública | login → `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | pública | rota el refresh token y devuelve un access nuevo |
| POST | `/auth/logout` | pública | revoca el refresh token |
| GET  | `/me` | Bearer | perfil del usuario actual |
| PATCH| `/me/profile` | Bearer | actualiza nombre/barrio/teléfono/dirección/lat/lng |
| GET  | `/products` | Bearer | catálogo (`?categoria=`, `?search=`) |
| GET  | `/price-comparison` | Bearer | comparación por fuente + KPIs (`?categoria=`, `?search=`) |
| GET  | `/groups` | Bearer | grupos de compra (`?barrio=`, `?estado=`) |
| POST | `/groups` | Bearer + admin | crea un grupo de compra |
| POST | `/groups/:id/join` | Bearer | crear pedido confirmado y sumar kg al grupo (transacción) |
| GET  | `/me/orders` | Bearer | pedidos del usuario |
| GET  | `/orders/:id` | Bearer | pedido + timeline de estados (dueño o admin) |
| GET  | `/admin/users` | Bearer + admin | usuarios registrados |
| GET  | `/admin/groups` | Bearer + admin | grupos con conteo de pedidos |

## Auth (propia — sin Supabase)

- **Access token**: JWT HS256 firmado con `JWT_SECRET`, corta vida (`JWT_ACCESS_TTL`, def. 15m).
- **Refresh token**: string opaco, se guarda **hasheado** (SHA-256) en `refresh_tokens`, con
  rotación en cada `/auth/refresh` (el viejo se revoca).
- **Contraseñas**: hash `scrypt` de `node:crypto` — sin módulos nativos.
- Cambiar de mecanismo = otra implementación de `AuthProvider`; `JwtAuthGuard` no se toca.

## Pendiente

- Password reset + verificación de email (necesita proveedor de mail — Resend/SES).
- Cierre/entrega de grupos (estados más allá de `formacion` → `cerrado`).
- Producción: Postgres gestionado + migración de datos desde el sistema viejo.
- Puente: que el `index.html` actual escriba contra este API.
