import { defineConfig } from 'vitest/config';

// Tests unitarios: rápidos, sin base de datos.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
});
