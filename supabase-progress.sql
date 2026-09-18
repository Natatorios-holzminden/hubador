-- HUBADOR — progreso real de grupos (kg juntados por producto)
-- Antes: la barra "Faltan Xkg · Y/100kg" era una simulación guardada en localStorage
-- de cada navegador (arrancaba con números inventados). Con esto pasa a sumar los
-- pedidos reales guardados en la tabla orders, igual para todo el mundo, sin relleno.
--
-- Requisito previo: supabase-orders.sql ya corrido (crea la tabla orders).
-- Pegá esto en: Supabase Dashboard → SQL Editor → New query → Run.

-- Vista agregada: solo el total de kg por producto, sin exponer datos de quién compró.
-- Al ser una vista creada por el owner (no hereda RLS de "orders" fila por fila),
-- puede sumar los pedidos de TODOS los usuarios — es la que hace que sea un dato
-- realmente compartido y no algo por navegador.
create or replace view public.product_progress as
select
  product_name,
  coalesce(sum(qty), 0)::numeric as filled_kg
from public.orders
where status is distinct from 'cancelado'
group by product_name;

grant select on public.product_progress to anon, authenticated;

-- Realtime: para que la barra suba en vivo en cualquier pantalla abierta cuando
-- alguien confirma un pedido en otro lado.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
exception when undefined_object then
  null; -- activar manualmente en Database → Replication si esto no aplica
end $$;

-- IMPORTANTE: hoy un pedido solo se guarda en "orders" (y por lo tanto solo suma a
-- la barra real) si quien compra tiene sesión real de Supabase (se registró/logueó
-- de verdad). Compras con el acceso demo o sin cuenta NO quedan registradas acá,
-- así que al principio la barra puede verse baja hasta que haya más gente registrada.
