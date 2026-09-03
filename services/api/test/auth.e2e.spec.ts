import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createTestApp, resetDb } from './app';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const creds = { email: 'user@test.com', password: 'password123', nombre: 'User' };

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

  it('register devuelve una sesión y crea el profile', async () => {
    const res = await http().post('/auth/register').send(creds).expect(201);
    expect(typeof res.body.accessToken).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.user).toMatchObject({ email: creds.email, role: 'user' });
  });

  it('register con email repetido devuelve 409', async () => {
    await http().post('/auth/register').send(creds).expect(201);
    await http().post('/auth/register').send(creds).expect(409);
  });

  it('login con contraseña incorrecta devuelve 401', async () => {
    await http().post('/auth/register').send(creds).expect(201);
    await http().post('/auth/login').send({ email: creds.email, password: 'mal' }).expect(401);
  });

  it('GET /me: sin token 401, con token devuelve el perfil', async () => {
    const { body } = await http().post('/auth/register').send(creds).expect(201);
    await http().get('/me').expect(401);
    const me = await http().get('/me').set('authorization', `Bearer ${body.accessToken}`).expect(200);
    expect(me.body.email).toBe(creds.email);
  });

  it('refresh rota el token: el viejo deja de servir', async () => {
    const { body } = await http().post('/auth/register').send(creds).expect(201);
    const rotated = await http()
      .post('/auth/refresh')
      .send({ refreshToken: body.refreshToken })
      .expect(201);
    expect(rotated.body.refreshToken).not.toBe(body.refreshToken);
    await http().post('/auth/refresh').send({ refreshToken: body.refreshToken }).expect(401);
  });
});
