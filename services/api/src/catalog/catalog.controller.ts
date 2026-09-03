import { Controller, Get, Query } from '@nestjs/common';
import { priceComparisonQuerySchema } from '@hubador/shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { CatalogService } from './catalog.service';

@Controller('products')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(priceComparisonQuerySchema.pick({ categoria: true, search: true })))
    query: { categoria?: 'fruta' | 'verdura'; search?: string },
  ) {
    return this.catalog.list(query);
  }
}
