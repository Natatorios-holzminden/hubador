import { Injectable } from '@nestjs/common';
import type { Category, Product } from '@prisma/client';
import type { Source } from '@hubador/shared';
import { toNum } from '../common/decimal';
import { PrismaService } from '../prisma/prisma.service';

export interface LatestPricesRow {
  product: Product;
  pricesBySource: Partial<Record<Source, number>>;
  updatedAt: string;
}

@Injectable()
export class PricingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // TODO(perf): reemplazar por un DISTINCT ON (product_id, source) cuando el
  // historial de price_points crezca; hoy trae todos los puntos y filtra en JS.
  async latestPrices(filter: { categoria?: Category; search?: string }): Promise<LatestPricesRow[]> {
    const products = await this.prisma.product.findMany({
      where: {
        categoria: filter.categoria,
        ...(filter.search
          ? { nombre: { contains: filter.search, mode: 'insensitive' } }
          : {}),
      },
      include: { pricePoints: { orderBy: { scrapedAt: 'desc' } } },
      orderBy: [{ topRank: { sort: 'asc', nulls: 'last' } }, { nombre: 'asc' }],
    });

    return products.map((p) => {
      const pricesBySource: Partial<Record<Source, number>> = {};
      let updatedAt = new Date(0);
      for (const pp of p.pricePoints) {
        const source = pp.source as Source;
        if (pricesBySource[source] === undefined) {
          pricesBySource[source] = toNum(pp.precio);
          if (pp.scrapedAt > updatedAt) updatedAt = pp.scrapedAt;
        }
      }
      const { pricePoints: _drop, ...product } = p;
      return { product, pricesBySource, updatedAt: updatedAt.toISOString() };
    });
  }
}
