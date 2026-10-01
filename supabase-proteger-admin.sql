-- 1) Devolverle el admin a tu cuenta (el checkout por WhatsApp lo habia pasado a 'user').
update public.profiles set role = 'admin' where email = 'maxi.flores.mp@gmail.com';

-- 2) Nadie puede cambiarse el rol a si mismo desde la web (antes "profiles_update_own" lo permitia,
--    o sea cualquiera podia ponerse admin). Solo un admin, o vos desde este SQL Editor, puede cambiar roles.
create or replace function public.profiles_guard_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- auth.uid() es null cuando se corre desde el SQL Editor: ahi se permite todo.
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.role := 'user';
    elsif new.role is distinct from old.role then
      new.role := old.role;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_role on public.profiles;
create trigger profiles_guard_role
  before insert or update on public.profiles
  for each row execute function public.profiles_guard_role();

-- 3) Chequeo: tiene que devolver role = admin
select email, role from public.profiles where email = 'maxi.flores.mp@gmail.com';
