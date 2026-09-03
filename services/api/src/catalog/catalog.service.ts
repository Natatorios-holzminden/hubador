import { Injectable } from '@nestjs/common';
import type { Product as SharedProduct } from '@hubador/shared';
import type { Product } from '@prisma/client';
import { CatalogRepository, type CatalogFilter } from './catalog.repository';

@Injectable()
export class CatalogService {
  constructor(private readonly repo: CatalogRepository) {}

  async list(filter: CatalogFilter): Promise<SharedProduct[]> {
    const rows = await this.repo.list(filter);
    return rows.map(toShared);
  }
}

export function toShared(p: Product): SharedProduct {
  return {
    id: p.id,
    nombre: p.nombre,
    categoria: p.categoria,
    unidad: p.unidad,
    variedad: p.variedad ?? undefined,
    origen: p.origen ?? undefined,
    imagen: p.imagen ?? undefined,
    topRank: p.topRank ?? null,
  };
}
