import { Injectable } from '@nestjs/common';
import type { Category, Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CatalogFilter {
  categoria?: Category;
  search?: string;
}

@Injectable()
export class CatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: CatalogFilter): Promise<Product[]> {
    return this.prisma.product.findMany({
      where: {
        categoria: filter.categoria,
        ...(filter.search
          ? { nombre: { contains: filter.search, mode: 'insensitive' } }
          : {}),
      },
      orderBy: [{ topRank: { sort: 'asc', nulls: 'last' } }, { nombre: 'asc' }],
    });
  }
}
