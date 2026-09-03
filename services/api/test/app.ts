import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '../src/app.module';

export const prisma = new PrismaClient();

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

/** Borra todas las filas respetando el orden de las FKs. */
export async function resetDb(): Promise<void> {
  await prisma.orderEvent.deleteMany();
  await prisma.order.deleteMany();
  await prisma.group.deleteMany();
  await prisma.pricePoint.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.profile.deleteMany();
}
