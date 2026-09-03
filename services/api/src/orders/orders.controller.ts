import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { CurrentUser, type RequestUser } from '../auth/current-user';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get('me/orders')
  mine(@CurrentUser() user: RequestUser) {
    return this.orders.myOrders(user.id);
  }

  @Get('orders/:id')
  one(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: RequestUser) {
    return this.orders.getOne(id, user);
  }
}
