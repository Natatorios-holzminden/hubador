-- HUBADOR — tabla productos (catálogo compartido)
-- Antes: el catálogo vivía solo en localStorage del navegador de cada admin, por eso
-- cada dispositivo veía una versión distinta ("lo viejo" en otros celus/PCs).
-- Con esto: Admin escribe acá, y CUALQUIER dispositivo (con o sin login) lee esto mismo,
-- con actualización en vivo vía Supabase Realtime.
--
-- Requisito previo: correr primero supabase-schema.sql (crea la función public.is_admin()).
-- Pegá esto en: Supabase Dashboard → SQL Editor → New query → Run.

create table if not exists public.productos (
  id text primary key,
  name text not null,
  cat text not null default 'verduras',
  price_n numeric not null default 0,
  old_n numeric not null default 0,
  distribuidor_n numeric not null default 0,
  members text,
  time text,
  deadline_hrs integer,
  img text,
  goal integer,
  unit text not null default '/kg',
  stock integer not null default 100,
  oculto boolean not null default false,
  precio_actualizado boolean not null default false,
  descripcion text,
  updated_at timestamptz not null default now()
);

create index if not exists productos_cat_idx on public.productos (cat);
create index if not exists productos_oculto_idx on public.productos (oculto);

alter table public.productos enable row level security;

-- Lectura pública: la tienda muestra precios sin necesidad de login.
drop policy if exists "productos_select_public" on public.productos;
create policy "productos_select_public"
  on public.productos for select
  to anon, authenticated
  using (true);

-- Escritura: solo admins (requiere haber corrido supabase-schema.sql y marcar el usuario
-- admin con: update public.profiles set role = 'admin' where email = 'tu@email.com';)
drop policy if exists "productos_write_admin" on public.productos;
create policy "productos_write_admin"
  on public.productos for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime: para que otros dispositivos vean los cambios de Admin al instante.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'productos'
  ) then
    alter publication supabase_realtime add table public.productos;
  end if;
exception when undefined_object then
  -- La publicación supabase_realtime no existe en este proyecto; activá Realtime
  -- manualmente desde Database → Replication → productos en el Dashboard.
  null;
end $$;

-- Semilla inicial: el catálogo base que hoy está hardcodeado en index.html (RAW_BASE_CATALOG).
-- Si la tabla ya tiene datos (porque Admin ya publicó algo), esto no pisa nada (on conflict do nothing).
insert into public.productos (id, name, cat, price_n, old_n, distribuidor_n, members, time, deadline_hrs, img, goal, unit, stock, oculto, precio_actualizado)
values
  ('morron',    'Morrón rojo',      'verduras', 4224, 6499, 2500, '3/8',  '2d', 40, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80', 100, '/kg', 60,  false, false),
  ('zapallo',   'Zapallo anco',     'verduras', 1169, 1799, 700,  '5/12', '3d', 45, 'img/zapallo-ok-20260730c.jpg', 100, '/kg', 130, false, false),
  ('cebolla',   'Cebolla',          'verduras', 1105, 1700, 650,  '6/10', '2d', 40, 'img/cebolla-ok-20260730c.jpg', 100, '/kg', 175, false, false),
  ('lechuga',   'Lechuga mantecosa','verduras', 2730, 4200, 1500, '6/10', '2d', 41, 'img/lechuga.jpg', 100, '/u',  70,  false, false),
  ('batata',    'Batata',           'verduras', 1104, 1699, 600,  '6/12', '2d', 43, 'img/batata.jpg', 100, '/kg', 145, false, false),
  ('banana',    'Banana',           'frutas',   1368, 1954, 882,  '7/10', '1d', 33, 'img/banana.jpg', 100, '/kg', 160, false, false),
  ('limon',     'Limón',            'frutas',   584,  899,  350,  '5/9',  '3d', 37, 'img/limon.jpg', 100, '/kg', 90,  false, false),
  ('manzana',   'Manzana verde',    'frutas',   2499, 4999, 526,  '6/10', '2d', 44, 'img/manzana.jpg', 100, '/kg', 95,  false, false),
  ('naranja',   'Naranja Jugo',     'frutas',   719,  899,  353,  '7/10', '2d', 32, 'img/naranja.jpg', 100, '/kg', 185, false, true),
  ('mandarina', 'Mandarina Nova',   'frutas',   699,  999,  353,  '5/10', '2d', 36, 'img/naranja.jpg', 100, '/kg', 140, false, false),
  ('pera',      'Pera',             'frutas',   1487, 2124, 500,  '4/10', '2d', 38, 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=400&q=80', 100, '/kg', 110, false, false)
on conflict (id) do nothing;

-- Cómo marcar tu usuario como admin real (necesario para que Admin pueda publicar cambios):
-- 1) Registrate/logueate una vez en el sitio con el email que vas a usar como admin.
-- 2) Corré: update public.profiles set role = 'admin' where email = 'tu@email.com';
-- 3) En el sitio, entrá a Admin con ESE email + su contraseña real de Supabase
--    (no hace falta que sea literalmente admin@hubador.app; podés usar cualquier email marcado admin).
