import { Injectable } from '@nestjs/common';
import {
  aggregateKpis,
  compareSources,
  type ComparisonResult,
  type Kpis,
  type Product as SharedProduct,
  type Source,
} from '@hubador/shared';
import type { Category } from '@prisma/client';
import { toShared } from '../catalog/catalog.service';
import { PricingRepository } from './pricing.repository';

export interface PriceComparisonItem {
  product: SharedProduct;
  pricesBySource: Partial<Record<Source, number>>;
  comparison: ComparisonResult;
  updatedAt: string;
}

@Injectable()
export class PricingService {
  constructor(private readonly repo: PricingRepository) {}

  async comparison(filter: { categoria?: Category; search?: string }): Promise<{
    items: PriceComparisonItem[];
    kpis: Kpis;
  }> {
    const rows = await this.repo.latestPrices(filter);

    const items: PriceComparisonItem[] = [];
    for (const row of rows) {
      const comparison = compareSources(row.pricesBySource);
      if (!comparison) continue;
      items.push({
        product: toShared(row.product),
        pricesBySource: row.pricesBySource,
        comparison,
        updatedAt: row.updatedAt,
      });
    }

    return { items, kpis: aggregateKpis(rows) };
  }
}
