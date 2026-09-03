/** Schemas zod para validar en el borde del API y en los forms del front.
 *  Los tipos de dominio "puros" viven en types.ts; acá van los payloads. */

import { z } from 'zod';

export const categorySchema = z.enum(['fruta', 'verdura']);
export const unitSchema = z.enum(['kg', 'atado', 'unidad']);
export const sourceSchema = z.enum(['mercado_central', 'coto', 'jorge']);
export const roleSchema = z.enum(['user', 'admin']);

export const profileUpdateSchema = z.object({
  nombre: z.string().min(1).max(120).optional(),
  barrio: z.string().min(1).max(120).optional(),
  telefono: z.string().min(6).max(40).optional(),
  direccion: z.string().min(1).max(240).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export const orderCreateSchema = z.object({
  groupId: z.string().uuid().nullable().optional(),
  productId: z.string().uuid(),
  qtyKg: z.number().positive().max(1000),
});
export type OrderCreate = z.infer<typeof orderCreateSchema>;

export const priceComparisonQuerySchema = z.object({
  categoria: categorySchema.optional(),
  search: z.string().max(80).optional(),
  source: sourceSchema.optional(),
});
export type PriceComparisonQuery = z.infer<typeof priceComparisonQuerySchema>;

export const groupStatusSchema = z.enum(['formacion', 'cerrado', 'entregado', 'cancelado']);

export const groupsQuerySchema = z.object({
  barrio: z.string().max(120).optional(),
  estado: groupStatusSchema.optional(),
});
export type GroupsQuery = z.infer<typeof groupsQuerySchema>;

export const groupJoinSchema = z.object({
  qtyKg: z.number().positive().max(1000),
});
export type GroupJoin = z.infer<typeof groupJoinSchema>;

export const groupCreateSchema = z.object({
  productId: z.string().uuid(),
  barrio: z.string().min(1).max(120),
  precioUnitario: z.number().positive().max(10_000_000),
  kgObjetivo: z.number().positive().max(100_000),
  deadline: z.string().datetime(),
});
export type GroupCreate = z.infer<typeof groupCreateSchema>;

// ── Auth propia (sin Supabase) ───────────────────────────────────
export const registerSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  nombre: z.string().min(1).max(120).optional(),
});
export type Register = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});
export type Login = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(10).max(500),
});
export type Refresh = z.infer<typeof refreshSchema>;

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; nombre?: string; role: 'user' | 'admin' };
}

export const pricePointInsertSchema = z.object({
  productId: z.string().uuid(),
  source: sourceSchema,
  precio: z.number().positive(),
  scrapedAt: z.string().datetime(),
});
export type PricePointInsert = z.infer<typeof pricePointInsertSchema>;
