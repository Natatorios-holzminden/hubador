import type { Prisma } from '@prisma/client';

/** Prisma.Decimal -> number para las respuestas del API (los tipos de
 *  @hubador/shared usan number). La DB sigue guardando Decimal. */
export function toNum(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === 'number' ? value : value.toNumber();
}
