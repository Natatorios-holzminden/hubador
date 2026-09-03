import { z } from 'zod';

/** Validación de variables de entorno. Si falta algo, el proceso no arranca. */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),

  /** Secreto para firmar los access tokens (HS256). Mínimo 32 caracteres. */
  JWT_SECRET: z.string().min(32),
  /** Vida del access token (formato de `jsonwebtoken`, p. ej. "15m", "1h"). */
  JWT_ACCESS_TTL: z.string().default('15m'),
  /** Vida del refresh token en días. */
  JWT_REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),

  /** Orígenes permitidos para CORS, separados por coma. */
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Variables de entorno inválidas:\n${issues}`);
  }
  return parsed.data;
}
