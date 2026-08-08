-- HUBADOR — tabla orders (compras confirmadas)
-- Auth → Users solo muestra login. Las cantidades viven acá.
-- Table Editor → orders (después de correr este SQL).
-- El front también guarda en localStorage (hubadorOrders / hubadorActiveGroups).

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

-- Si ya existe is_admin() (supabase-schema.sql), admins pueden leer todo
do $$
begin
  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_admin'
  ) then
    execute 'drop policy if exists "orders_select_admin" on public.orders';
    execute $p$
      create policy "orders_select_admin"
        on public.orders for select
        to authenticated
        using (public.is_admin())
    $p$;
  end if;
end $$;
