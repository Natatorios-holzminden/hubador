-- HUBADOR — esquema mínimo de perfiles + RLS (Supabase)
-- Pegá esto en: Supabase Dashboard → SQL Editor → New query → Run

-- 1) Tabla profiles (1:1 con auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  nombre text,
  barrio text,
  tel text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_barrio_idx on public.profiles (barrio);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

-- 2) RLS
alter table public.profiles enable row level security;

-- Lectura / escritura del propio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin listado (evita recursión RLS con security definer)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- 3) Trigger: crear / enriquecer profile al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nombre, barrio, tel)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(coalesce(new.email, 'vecino'), '@', 1)),
    coalesce(new.raw_user_meta_data->>'barrio', ''),
    nullif(coalesce(new.raw_user_meta_data->>'tel', ''), '')
  )
  on conflict (id) do update set
    email = excluded.email,
    nombre = coalesce(nullif(excluded.nombre, ''), profiles.nombre),
    barrio = coalesce(nullif(excluded.barrio, ''), profiles.barrio),
    tel = coalesce(excluded.tel, profiles.tel),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Cómo marcar un admin (desde SQL, con el UUID del usuario en Authentication → Users):
-- update public.profiles set role = 'admin' where email = 'tu@email.com';

-- 5) Auth troubleshooting (solo lectura / ops en Dashboard):
-- Authentication → Users: ver si el email existe y si email_confirmed_at está lleno.
-- select id, email, email_confirmed_at, created_at from auth.users order by created_at desc limit 20;
-- Si Confirm email está ON y el user no confirmó → login falla con "Email not confirmed".
-- Dashboard → Authentication → Providers → Email → desactivar Confirm email para pruebas.

-- Nota: usuarios online / presencia realtime → siguiente iteración (Realtime Presence).
