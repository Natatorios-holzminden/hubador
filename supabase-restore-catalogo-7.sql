-- HUBADOR — restaurar catálogo a los 7 productos que estaban a la venta
-- (los de la foto: zapallito redondo, Berenjena, Banana, Mandarina Nova, Manzana verde, Pera, Naranja Jugo)
-- Correr una sola vez en: Supabase Dashboard → SQL Editor → Run

-- 1) Precios que ya tenían cargados
update public.productos set price_n = 1749, old_n = 2499, oculto = false, precio_actualizado = true where id = 'banana';
update public.productos set price_n = 699,  old_n = 999,  oculto = false, precio_actualizado = true where id = 'mandarina';
update public.productos set price_n = 2022, old_n = 2889, oculto = false, precio_actualizado = true where id = 'manzana';
update public.productos set price_n = 1609, old_n = 2299, oculto = false, precio_actualizado = true where id = 'pera';
update public.productos set price_n = 719,  old_n = 899,  oculto = false, precio_actualizado = true where id = 'naranja';

-- 2) Ocultar el resto del catálogo base (no los querés mostrar por ahora)
update public.productos set oculto = true where id in ('morron', 'zapallo', 'cebolla', 'lechuga', 'batata', 'limon');

-- 3) Recrear los 2 productos nuevos que habías armado (foto de relleno — resubir la real desde Admin cuando quieras)
insert into public.productos (id, name, cat, price_n, old_n, distribuidor_n, members, time, deadline_hrs, img, goal, unit, stock, oculto, precio_actualizado)
values
  ('zapallito', 'zapallito redondo', 'verduras', 1500, 2999, 900, '5/10', '2d', 40, 'img/papa.jpg', 100, '/kg', 90, false, true),
  ('berenjena', 'Berenjena', 'verduras', 1500, 2499, 850, '5/10', '2d', 40, 'img/papa.jpg', 100, '/kg', 80, false, true)
on conflict (id) do update set
  price_n = excluded.price_n,
  old_n = excluded.old_n,
  oculto = excluded.oculto,
  precio_actualizado = excluded.precio_actualizado;
