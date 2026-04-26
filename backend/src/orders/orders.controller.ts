import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiResponse } from '../common/dto/api-response.dto';

import { Req } from '@nestjs/common';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: any) {
    let userId: string | undefined;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const payloadStr = Buffer.from(
          token.split('.')[1],
          'base64',
        ).toString();
        const payload = JSON.parse(payloadStr);
        userId = payload.sub || payload.id;
      } catch (e) {
        // ignore
      }
    }
    const order = await this.ordersService.create(createOrderDto, userId);
    return ApiResponse.ok(order, 'Order created successfully');
  }

  @Get('history/me')
  async getMyHistory(@Req() req: any) {
    const userId = req.user.id;
    const orders = await this.ordersService.findUserOrders(userId);
    return ApiResponse.ok(orders, 'History retrieved successfully');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.ordersService.findOne(id);
    return ApiResponse.ok(order, 'Order retrieved successfully');
  }

  @Public()
  @Get(':id/chat')
  async getChat(@Param('id') id: string) {
    const messages = await this.ordersService.getMessages(id);
    return ApiResponse.ok(messages, 'Messages retrieved successfully');
  }

  @Public()
  @Post(':id/chat')
  async addChat(
    @Param('id') id: string,
    @Body('content') content: string,
    @Body('sender') sender: string,
  ) {
    // If not admin, force sender to 'user'
    const actualSender = sender === 'admin' ? 'admin' : 'user';
    const message = await this.ordersService.addMessage(id, actualSender, content);
    return ApiResponse.ok(message, 'Message sent successfully');
  }
}
