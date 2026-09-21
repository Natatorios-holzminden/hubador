-- HUBADOR — zona/nodo de entrega en cada pedido
-- Pegá esto en: Supabase → SQL Editor → New query → Run.
-- Con esto cada pedido guarda a qué nodo de entrega pertenece, y en Admin → Pedidos
-- podés filtrar y sumar por zona (ej. armar el reparto de tu zona por separado).

alter table public.orders add column if not exists nodo text;
create index if not exists orders_nodo_idx on public.orders (nodo);
