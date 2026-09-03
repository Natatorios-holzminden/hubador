import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type OrderWithDetail = Prisma.OrderGetPayload<{
  include: { events: true; product: true };
}>;

@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  listByUser(userId: string): Promise<OrderWithDetail[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: { events: { orderBy: { at: 'asc' } }, product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<OrderWithDetail | null> {
    return this.prisma.order.findUnique({
      where: { id },
      include: { events: { orderBy: { at: 'asc' } }, product: true },
    });
  }
}
