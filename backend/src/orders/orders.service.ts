import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(private readonly prisma: PrismaService) {}

  private generateOrderId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `GV-${code}`;
  }

  async create(dto: CreateOrderDto, userId?: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalPrice = 0;
    const orderItemsData: any[] = [];

    // Validate products & calculate total
    for (const item of dto.items) {
      const product = await this.prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID "${item.productId}" not found`,
        );
      }

      if (!product.isActive) {
        throw new BadRequestException(
          `Product "${product.name}" is currently unavailable`,
        );
      }

      const itemTotalPrice = product.price * item.quantity;
      totalPrice += itemTotalPrice;

      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Generate unique order ID
    let orderId: string;
    let isUnique = false;

    while (!isUnique) {
      orderId = this.generateOrderId();
      const existing = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    const order = await this.prisma.order.create({
      data: {
        id: orderId!,
        totalPrice,
        userId: userId || null,
        accountData: dto.accountData || null,
        whatsapp: dto.whatsapp || null,
        paymentMethod: dto.paymentMethod || null,
        items: {
          create: orderItemsData,
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        },
      },
    });

    this.logger.log(
      `Order created: ${order.id} with ${dto.items.length} items = Rp ${totalPrice}`,
    );

    return order;
  }

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
        payment: true,
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found`);
    }

    return order;
  }

  async findAll(page = 1, limit = 20, status?: OrderStatus) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
              },
            },
          },
        },
        payment: true,
      },
    });

    this.logger.log(`Order ${id} status updated to ${status}`);
    return order;
  }

  async getMessages(orderId: string) {
    await this.findOne(orderId); // Verify exists
    return this.prisma.chatMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addMessage(orderId: string, sender: string, content: string) {
    if (!content || !content.trim()) {
      throw new BadRequestException('Message content cannot be empty');
    }
    await this.findOne(orderId); // Verify exists
    return this.prisma.chatMessage.create({
      data: {
        orderId,
        sender,
        content: content.trim()
      }
    });
  }
}
