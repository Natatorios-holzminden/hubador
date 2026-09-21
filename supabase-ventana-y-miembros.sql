-- HUBADOR — miembros reales + ventana de tiempo real (compartida por todos)
-- Pegá esto entero en: Supabase → SQL Editor → New query → Run.
-- Antes: "vecinos sumados" era un número inventado, y la cuenta regresiva arrancaba de cero
-- en el navegador de cada visitante (cada uno veía un reloj distinto).

-- 1) Fecha/hora de cierre real, guardada en la base: todos ven el mismo reloj.
alter table public.productos add column if not exists deadline_at timestamptz;

-- Arranca la ventana AHORA para los productos que todavía no tienen una
-- (usa las horas configuradas; si no hay, 72 hs = 3 días).
update public.productos
set deadline_at = now() + make_interval(hours => coalesce(deadline_hrs, 72))
where deadline_at is null;

-- 2) Miembros reales: cantidad de personas distintas que pidieron cada producto.
create or replace view public.product_progress as
select
  product_name,
  coalesce(sum(qty), 0)::numeric as filled_kg,
  count(distinct user_id)::int as members
from public.orders
where status is distinct from 'cancelado'
group by product_name;

grant select on public.product_progress to anon, authenticated;
