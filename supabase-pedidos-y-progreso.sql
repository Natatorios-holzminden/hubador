-- HUBADOR — pedidos + barra de progreso real (TODO EN UNO)
-- Pegá esto entero en: Supabase → SQL Editor → New query → Run.
-- Crea la tabla "orders" (los pedidos) y la vista "product_progress" (suma de kg por producto).

-- 1) Tabla de pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_name text not null,
  qty numeric not null,
  unit_price numeric,
  total numeric,
  status text not null default 'en_formacion',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);
create index if not exists orders_created_at_idx on public.orders (created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "orders_update_own" on public.orders;
create policy "orders_update_own"
  on public.orders for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Los admins pueden ver todos los pedidos
drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- 2) Vista pública: solo el total de kg por producto (sin datos de quién compró)
create or replace view public.product_progress as
select
  product_name,
  coalesce(sum(qty), 0)::numeric as filled_kg
from public.orders
where status is distinct from 'cancelado'
group by product_name;

grant select on public.product_progress to anon, authenticated;

-- 3) Realtime: la barra sube en vivo cuando alguien confirma un pedido
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;
exception when undefined_object then
  null;
end $$;
