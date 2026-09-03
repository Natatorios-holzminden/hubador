import { Controller, Get, Query } from '@nestjs/common';
import { priceComparisonQuerySchema, type PriceComparisonQuery } from '@hubador/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { PricingService } from './pricing.service';

@Controller('price-comparison')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(priceComparisonQuerySchema)) query: PriceComparisonQuery,
  ) {
    return this.pricing.comparison({ categoria: query.categoria, search: query.search });
  }
}
