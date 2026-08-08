# HUBADOR — Auth con Supabase (registro / login)

Build: `HUBADOR_BUILD 20260807h-activos` · UI sigue con marcador `· u-v5`

## Qué hace
- Registro y login con **email + contraseña** (Supabase Auth).
- Perfil en tabla `profiles` (nombre, barrio, email…).
- Si **no** hay URL + publishable/anon válidas → **modo demo** (localStorage) + toast *“Modo demo — configurá Supabase”*.
- Con URL + publishable presentes → **modo demo OFF** (auth real).
- Errores de login/signup se muestran en **español** (toast), p. ej. email no confirmado o credenciales inválidas.
- Admin: lista mínima de usuarios desde `profiles` (hace falta `role = 'admin'`).
- Presencia en vivo (“quién está online”) **no** está incluido: viene en un siguiente paso.

## Pedidos (flujo Carrito → Confirmar → Activos)
- **Carrito** (Mis grupos → pestaña Carrito) = solo ítems sin confirmar (`conlatCart`).
- **Confirmar mi pedido** = guarda líneas en `localStorage` (`hubadorOrders` + `hubadorActiveGroups`), vacía el carrito y abre **Activos**.
- **Perfil → Tus pedidos** muestra solo pedidos reales (chip *En formación*); sin demos falsos.
- **Authentication → Users** = quién se registró. **No** muestra kilos ni compras.
- Para ver qty/precio en el dashboard: corré `supabase-orders.sql` y mirá **Table Editor → `orders`**.
  Si hay sesión Supabase al confirmar, el front hace `insert` (fire-and-forget); si falla, igual queda en localStorage.

## Estado de este pack
Las keys **ya están cableadas** (Project URL + publishable `sb_publishable_...`).  
**No subas ni pegues** la clave `sb_secret_...` / service_role en el frontend.

## Siguiente paso (vos)
1. En Supabase → **SQL Editor** → pegá y corré `supabase-schema.sql` (si aún no lo hiciste).
2. Misma pantalla → corré `supabase-orders.sql` (tabla de compras).
3. Authentication → Providers → Email → **desactivá “Confirm email”** para probar signup sin mail.
4. Authentication → **URL Configuration**:
   - **Site URL:** `https://hubador.com`
   - **Redirect URLs** (agregá todas):
     - `http://hubador.com`
     - `https://hubador.com`
     - `http://hubador.com/**`
     - `https://hubador.com/**`
     - `http://localhost:8765` (si probás local)
5. Abrí el sitio → **Registrate** (no solo Ingresar) → login → confirmá un pedido → Table Editor → `orders`.
6. Subí de nuevo el zip a hubador.com (`index.html` + `config.js` + `img/`).

### HTTP vs HTTPS
La publishable/anon funciona en **http://hubador.com** y **https://hubador.com**.  
Igual conviene Site URL en `https://` y listar **ambos** orígenes en Redirect URLs.

### Si el login falla
| Síntoma / toast | Qué hacer |
|-----------------|-----------|
| Email o contraseña incorrectos… | Revisá Auth → Users; si no está, usá **Registrate** |
| Confirmá el mail… | Confirmá el correo o desactivá Confirm email |
| Demasiados intentos… | Esperá y reintentá |
| No se pudo conectar… | Internet / Site URL / CORS (poco común con host de Supabase) |
| Dos botones “Ingresar” | Normal: header abre la misma pantalla de login |

### Verificar usuario (panel Supabase)
1. Dashboard → **Authentication** → **Users** → login / sesión
2. Dashboard → **Table Editor** → **`orders`** → `product_name`, `qty`, `unit_price`, `status`
3. Opcional SQL usuarios: `select id, email, email_confirmed_at, created_at from auth.users order by created_at desc limit 20;`
4. Opcional SQL pedidos: `select * from public.orders order by created_at desc limit 20;`

## Setup (referencia)

### Keys
- **Publishable** (`sb_publishable_...`) = OK en el front (es la nueva anon).
- **Anon JWT** legacy (`eyJ...`) también sirve.
- **Secret** (`sb_secret_...`) = **NUNCA** en el sitio ni en GitHub Pages.

Valores van en `index.html` (fallback) y/o `config.js`:

```js
window.HUBADOR_SUPABASE_URL = 'https://xxxx.supabase.co';
window.HUBADOR_SUPABASE_ANON = 'sb_publishable_...';
```

`config.js` se carga **antes** del script de la app con ruta **relativa** `config.js` (no `/config.js`). CDN: `@supabase/supabase-js@2.112.1` (acepta publishable).

Opción local `?dev`: botón **Conectar Supabase** (guarda en `localStorage`).

### Ver usuarios (admin)
```sql
update public.profiles set role = 'admin' where email = 'tu@email.com';
```

## Seguridad
- Publishable/anon es pública por diseño; la seguridad la dan las políticas **RLS**.
- **Nunca** subas la secret / service_role al front.

## Archivos
| Archivo | Uso |
|---------|-----|
| `supabase-schema.sql` | Tabla profiles + RLS + trigger — **corré esto ya** |
| `supabase-orders.sql` | Tabla `orders` (compras) + RLS — **para ver qty en el dashboard** |
| `supabase-schema-orders.sql` | Misma SQL (alias) |
| `config.js` | URL + publishable (ya configurado) |
| `config.example.js` | Plantilla |
| `LEEME.txt` | Cómo publicar el pack |
