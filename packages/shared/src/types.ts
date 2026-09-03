/**
 * Tipos de dominio compartidos entre frontend, API e ingesta.
 * Fuente única de verdad — reemplaza los objetos ad-hoc dispersos hoy en
 * central/app.js, comparador/app.js, jorge/jorge.js y los scrapers.
 */

export type Source = 'mercado_central' | 'coto' | 'jorge';
export const SOURCES: readonly Source[] = ['mercado_central', 'coto', 'jorge'] as const;

export type Category = 'fruta' | 'verdura';
export type Unit = 'kg' | 'atado' | 'unidad';
export type Role = 'user' | 'admin';

export type GroupStatus = 'formacion' | 'cerrado' | 'entregado' | 'cancelado';
export type OrderStatus =
  | 'pendiente'
  | 'confirmado'
  | 'en_preparacion'
  | 'en_camino'
  | 'entregado'
  | 'cancelado';

export interface Product {
  id: string;
  nombre: string;
  categoria: Category;
  unidad: Unit;
  variedad?: string;
  origen?: string;
  imagen?: string;
  /** Ranking de consumo en Argentina (1 = más consumido). */
  topRank?: number | null;
}

export interface PricePoint {
  id: string;
  productId: string;
  source: Source;
  precio: number;
  moneda: 'ARS';
  /** ISO 8601. */
  scrapedAt: string;
}

/** Precios vigentes de un producto en cada fuente, listo para comparar. */
export interface ProductPrices {
  product: Product;
  pricesBySource: Partial<Record<Source, number>>;
  updatedAt: string;
}

export interface Profile {
  /** = id del usuario en el proveedor de identidad. */
  id: string;
  email: string;
  nombre?: string;
  barrio?: string;
  telefono?: string;
  direccion?: string;
  lat?: number;
  lng?: number;
  role: Role;
}

export interface Group {
  id: string;
  productId: string;
  barrio: string;
  precioUnitario: number;
  kgObjetivo: number;
  kgCompletados: number;
  estado: GroupStatus;
  /** ISO 8601. */
  deadline: string;
  creadoPor: string;
}

export interface Order {
  id: string;
  userId: string;
  groupId: string | null;
  productId: string;
  qtyKg: number;
  precioUnitario: number;
  total: number;
  estado: OrderStatus;
  /** ISO 8601. */
  createdAt: string;
}

export interface OrderEvent {
  id: string;
  orderId: string;
  estado: OrderStatus;
  /** ISO 8601. */
  at: string;
}
