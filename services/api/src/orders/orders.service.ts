import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { toNum } from '../common/decimal';
import type { RequestUser } from '../auth/current-user';
import { OrdersRepository, type OrderWithDetail } from './orders.repository';

@Injectable()
export class OrdersService {
  constructor(private readonly repo: OrdersRepository) {}

  async myOrders(userId: string) {
    const rows = await this.repo.listByUser(userId);
    return rows.map((o) => toDto(o));
  }

  async getOne(id: string, user: RequestUser) {
    const order = await this.repo.findById(id);
    if (!order) throw new NotFoundException('Pedido no encontrado');
    if (order.userId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('Este pedido no es tuyo');
    }
    return toDto(order);
  }
}

function toDto(o: OrderWithDetail) {
  return {
    id: o.id,
    userId: o.userId,
    groupId: o.groupId,
    productId: o.productId,
    producto: o.product.nombre,
    qtyKg: toNum(o.qtyKg),
    precioUnitario: toNum(o.precioUnitario),
    total: toNum(o.total),
    estado: o.estado,
    createdAt: o.createdAt.toISOString(),
    events: o.events.map((e) => ({ estado: e.estado, at: e.at.toISOString() })),
  };
}
