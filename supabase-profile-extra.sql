-- HUBADOR — campos extra de entrega (tel + dirección)
-- Pegá en: Supabase Dashboard → SQL Editor → Run
-- Opcional para la demo de pago: si no corrés esto, la app guarda en localStorage.

alter table public.profiles
  add column if not exists tel text;

alter table public.profiles
  add column if not exists direccion text;
