import { Injectable } from '@nestjs/common';
import { toNum } from '../common/decimal';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async users() {
    const rows = await this.prisma.profile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        nombre: true,
        barrio: true,
        role: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
    });
    return rows.map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      barrio: u.barrio,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
      pedidos: u._count.orders,
    }));
  }

  async groups() {
    const rows = await this.prisma.group.findMany({
      include: { product: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((g) => ({
      id: g.id,
      producto: g.product.nombre,
      barrio: g.barrio,
      estado: g.estado,
      precioUnitario: toNum(g.precioUnitario),
      kgObjetivo: toNum(g.kgObjetivo),
      kgCompletados: toNum(g.kgCompletados),
      pedidos: g._count.orders,
      deadline: g.deadline.toISOString(),
    }));
  }
}
