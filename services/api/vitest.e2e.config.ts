import { resolve } from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from 'vitest/config';
import { testDatabaseUrl } from './test/db-url';

// cwd = services/api cuando se corre `npm run test:e2e -w @hubador/api`
dotenv.config({ path: resolve(process.cwd(), '../../.env') });

// Tests e2e: levantan la app Nest real contra un Postgres de test.
// Requiere Docker corriendo y DATABASE_URL_TEST en .env (ver .env.example).
export default defineConfig({
  test: {
    include: ['test/**/*.e2e.spec.ts'],
    globalSetup: ['test/global-setup.ts'],
    env: {
      DATABASE_URL: testDatabaseUrl(),
      JWT_SECRET: 'e2e-secret-0123456789-0123456789-abcdef',
      JWT_ACCESS_TTL: '15m',
      JWT_REFRESH_TTL_DAYS: '30',
      NODE_ENV: 'test',
    },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    fileParallelism: false,
  },
});
