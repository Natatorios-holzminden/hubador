import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { GroupCreate, GroupJoin } from '@hubador/shared';
import { toNum } from '../common/decimal';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsRepository, type GroupWithProduct } from './groups.repository';

@Injectable()
export class GroupsService {
  constructor(
    private readonly repo: GroupsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async list(filter: { barrio?: string; estado?: GroupWithProduct['estado'] }) {
    const rows = await this.repo.list(filter);
    return rows.map((g) => toDto(g));
  }

  /** Crea un grupo de compra (sólo admin). Valida que el producto exista. */
  async create(dto: GroupCreate, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Producto no encontrado');
    const group = await this.repo.create({
      productId: dto.productId,
      barrio: dto.barrio,
      precioUnitario: dto.precioUnitario,
      kgObjetivo: dto.kgObjetivo,
      deadline: new Date(dto.deadline),
      creadoPor: userId,
    });
    return toDto(group);
  }

  /** Unirse a un grupo = crear un pedido confirmado y sumar kg al grupo. Atómico. */
  async join(groupId: string, userId: string, dto: GroupJoin) {
    return this.prisma.$transaction(async (tx) => {
      const group = await tx.group.findUnique({ where: { id: groupId } });
      if (!group) throw new NotFoundException('Grupo no encontrado');
      if (group.estado !== 'formacion') {
        throw new ConflictException('El grupo ya no acepta pedidos');
      }

      const total = group.precioUnitario.mul(dto.qtyKg);
      const order = await tx.order.create({
        data: {
          userId,
          groupId,
          productId: group.productId,
          qtyKg: dto.qtyKg,
          precioUnitario: group.precioUnitario,
          total,
          estado: 'confirmado',
          events: { create: { estado: 'confirmado' } },
        },
        include: { events: true },
      });

      const kgCompletados = group.kgCompletados.add(dto.qtyKg);
      const alcanzado = kgCompletados.gte(group.kgObjetivo);
      await tx.group.update({
        where: { id: groupId },
        data: { kgCompletados, estado: alcanzado ? 'cerrado' : 'formacion' },
      });

      return {
        id: order.id,
        groupId,
        productId: order.productId,
        qtyKg: toNum(order.qtyKg),
        precioUnitario: toNum(order.precioUnitario),
        total: toNum(order.total),
        estado: order.estado,
        createdAt: order.createdAt.toISOString(),
      };
    });
  }
}

function toDto(g: GroupWithProduct) {
  return {
    id: g.id,
    productId: g.productId,
    producto: g.product.nombre,
    barrio: g.barrio,
    precioUnitario: toNum(g.precioUnitario),
    kgObjetivo: toNum(g.kgObjetivo),
    kgCompletados: toNum(g.kgCompletados),
    estado: g.estado,
    deadline: g.deadline.toISOString(),
    creadoPor: g.creadoPor,
  };
}
