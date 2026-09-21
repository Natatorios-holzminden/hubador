-- HUBADOR — cada zona corre su PROPIA orden (los kg de Belgrano y Garín no se mezclan)
-- Pegá esto entero en: Supabase → SQL Editor → New query → Run.
-- (Incluye la columna "nodo" de supabase-nodos.sql; si ya la corriste no pasa nada.)

-- 1) Cada pedido guarda su zona (id: 'belgrano' / 'garin') y el texto del punto de entrega.
alter table public.orders add column if not exists nodo text;
alter table public.orders add column if not exists zona text;
create index if not exists orders_zona_idx on public.orders (zona);

-- 2) La vista de progreso ahora cuenta por producto Y por zona.
--    (zona va al final para poder reemplazar la vista sin borrarla)
create or replace view public.product_progress as
select
  product_name,
  coalesce(sum(qty), 0)::numeric as filled_kg,
  count(distinct user_id)::int as members,
  coalesce(zona, '') as zona
from public.orders
where status is distinct from 'cancelado'
group by product_name, coalesce(zona, '');

grant select on public.product_progress to anon, authenticated;
