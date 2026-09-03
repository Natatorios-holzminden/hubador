import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, prisma, resetDb } from './app';

describe('Groups (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });
  afterAll(async () => {
    await app.close();
  });
  beforeEach(async () => {
    await resetDb();
  });

  const http = () => request(app.getHttpServer());
  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function register(email: string): Promise<string> {
    const { body } = await http()
      .post('/auth/register')
      .send({ email, password: 'password123' })
      .expect(201);
    return body.accessToken as string;
  }

  const inAWeek = () => new Date(Date.now() + 7 * 86_400_000).toISOString();

  it('admin crea grupo, el vecino se une y el pedido aparece en /me/orders', async () => {
    const product = await prisma.product.create({
      data: { slug: 'tomate', nombre: 'Tomate', categoria: 'verdura', unidad: 'kg' },
    });

    const adminToken = await register('admin@test.com');
    // el guard lee el rol de la DB en cada request, así que el mismo token sirve
    await prisma.profile.update({ where: { email: 'admin@test.com' }, data: { role: 'admin' } });

    const created = await http()
      .post('/groups')
      .set(bearer(adminToken))
      .send({
        productId: product.id,
        barrio: 'Saavedra',
        precioUnitario: 1500,
        kgObjetivo: 10,
        deadline: inAWeek(),
      })
      .expect(201);
    expect(created.body.estado).toBe('formacion');

    const userToken = await register('vecino@test.com');
    const join = await http()
      .post(`/groups/${created.body.id}/join`)
      .set(bearer(userToken))
      .send({ qtyKg: 3 })
      .expect(201);
    expect(join.body.total).toBe(4500);

    const orders = await http().get('/me/orders').set(bearer(userToken)).expect(200);
    expect(orders.body).toHaveLength(1);
    expect(orders.body[0]).toMatchObject({
      producto: 'Tomate',
      qtyKg: 3,
      total: 4500,
      estado: 'confirmado',
    });

    const groups = await http().get('/groups').set(bearer(userToken)).expect(200);
    expect(groups.body[0].kgCompletados).toBe(3);
  });

  it('un usuario común no puede crear grupos (403)', async () => {
    const product = await prisma.product.create({
      data: { slug: 'papa', nombre: 'Papa', categoria: 'verdura', unidad: 'kg' },
    });
    const userToken = await register('nadie@test.com');
    await http()
      .post('/groups')
      .set(bearer(userToken))
      .send({
        productId: product.id,
        barrio: 'X',
        precioUnitario: 100,
        kgObjetivo: 5,
        deadline: inAWeek(),
      })
      .expect(403);
  });

  it('unirse a un grupo ya cerrado devuelve 409', async () => {
    const product = await prisma.product.create({
      data: { slug: 'cebolla', nombre: 'Cebolla', categoria: 'verdura', unidad: 'kg' },
    });
    const adminToken = await register('admin2@test.com');
    await prisma.profile.update({ where: { email: 'admin2@test.com' }, data: { role: 'admin' } });

    const created = await http()
      .post('/groups')
      .set(bearer(adminToken))
      .send({
        productId: product.id,
        barrio: 'Nuñez',
        precioUnitario: 900,
        kgObjetivo: 2,
        deadline: inAWeek(),
      })
      .expect(201);

    const userToken = await register('vecino2@test.com');
    // completa el objetivo -> el grupo pasa a "cerrado"
    await http()
      .post(`/groups/${created.body.id}/join`)
      .set(bearer(userToken))
      .send({ qtyKg: 2 })
      .expect(201);

    await http()
      .post(`/groups/${created.body.id}/join`)
      .set(bearer(userToken))
      .send({ qtyKg: 1 })
      .expect(409);
  });
});
