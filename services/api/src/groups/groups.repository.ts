import { Injectable } from '@nestjs/common';
import type { Group, GroupStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type GroupWithProduct = Prisma.GroupGetPayload<{ include: { product: true } }>;

@Injectable()
export class GroupsRepository {
  constructor(private readonly prisma: PrismaService) {}

  list(filter: { barrio?: string; estado?: GroupStatus }): Promise<GroupWithProduct[]> {
    return this.prisma.group.findMany({
      where: { barrio: filter.barrio, estado: filter.estado },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string): Promise<Group | null> {
    return this.prisma.group.findUnique({ where: { id } });
  }

  create(data: {
    productId: string;
    barrio: string;
    precioUnitario: number;
    kgObjetivo: number;
    deadline: Date;
    creadoPor: string;
  }): Promise<GroupWithProduct> {
    return this.prisma.group.create({
      data: {
        productId: data.productId,
        barrio: data.barrio,
        precioUnitario: data.precioUnitario,
        kgObjetivo: data.kgObjetivo,
        deadline: data.deadline,
        creadoPor: data.creadoPor,
      },
      include: { product: true },
    });
  }
}
