-- Chequeo: ¿tu cuenta quedó marcada admin de verdad?
-- Reemplazá el email por el que usás para entrar a Admin en el sitio.
select id, email, role
from public.profiles
where email = 'PONE_TU_EMAIL_ACA';

-- Debería devolver 1 fila con role = 'admin'.
-- Si no aparece ninguna fila: ese email no tiene profile (raro, revisemos el registro).
-- Si aparece pero role NO dice 'admin': corré esto (con el mismo email) y volvé a intentar:
-- update public.profiles set role = 'admin' where email = 'PONE_TU_EMAIL_ACA';

-- Chequeo 2: que la política de escritura exista de verdad.
select policyname, cmd, roles
from pg_policies
where tablename = 'productos';
-- Debería listar "productos_select_public" (SELECT) y "productos_write_admin" (ALL).
