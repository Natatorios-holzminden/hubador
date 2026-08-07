# HUBADOR — Auth con Supabase (registro / login)

Build: `HUBADOR_BUILD 20260807f-auth` · UI sigue con marcador `· u-v4`

## Qué hace
- Registro y login con **email + contraseña** (Supabase Auth).
- Perfil en tabla `profiles` (nombre, barrio, email…).
- Si **no** hay URL + publishable/anon válidas → **modo demo** (localStorage) + toast *“Modo demo — configurá Supabase”*.
- Con URL + publishable presentes → **modo demo OFF** (auth real).
- Admin: lista mínima de usuarios desde `profiles` (hace falta `role = 'admin'`).
- Presencia en vivo (“quién está online”) **no** está incluido: viene en un siguiente paso.

## Estado de este pack
Las keys **ya están cableadas** (Project URL + publishable `sb_publishable_...`).  
**No subas ni pegues** la clave `sb_secret_...` / service_role en el frontend.

## Siguiente paso (vos)
1. En Supabase → **SQL Editor** → pegá y corré `supabase-schema.sql` (si aún no lo hiciste).
2. Authentication → Providers → Email → **desactivá “Confirm email”** para probar signup sin mail.
3. Site URL / Redirect URLs: agregá `https://hubador.com` (y `http://localhost:8765` si probás local).
4. Abrí el sitio → **Sign up** → login → recargá (sesión) → cerrar sesión.
5. Subí de nuevo el zip a hubador.com (`index.html` + `config.js` + `img/`).

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

`config.js` se carga **antes** del script de la app. CDN: `@supabase/supabase-js@2.112.1` (acepta publishable).

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
| `supabase-schema.sql` | Tabla + RLS + trigger — **corré esto ya** |
| `config.js` | URL + publishable (ya configurado) |
| `config.example.js` | Plantilla |
| `LEEME.txt` | Cómo publicar el pack |
