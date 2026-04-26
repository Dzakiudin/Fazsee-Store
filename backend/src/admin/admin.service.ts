import { Injectable, Logger } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CategoriesService } from '../categories/categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';
import { QueryProductDto } from '../products/dto/query-product.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  // --- Orders ---

  async getAllOrders(page = 1, limit = 20, status?: OrderStatus) {
    return this.ordersService.findAll(page, limit, status);
  }

  async updateOrderStatus(id: string, status: OrderStatus) {
    this.logger.log(`Admin updating order ${id} to ${status}`);
    return this.ordersService.updateStatus(id, status);
  }

  // --- Categories ---

  async getAllCategories() {
    return this.categoriesService.findAll(true); // Include inactive
  }

  async createCategory(dto: any, file?: Express.Multer.File) {
    return this.categoriesService.create(dto, file);
  }

  async updateCategory(id: string, dto: any, file?: Express.Multer.File) {
    return this.categoriesService.update(id, dto, file);
  }

  async deleteCategory(id: string) {
    return this.categoriesService.remove(id);
  }

  // --- Products ---

  async getAllProducts(query: QueryProductDto) {
    return this.productsService.findAll(query, true); // Include inactive products
  }

  async createProduct(dto: any, file?: Express.Multer.File) {
    return this.productsService.create(dto, file);
  }

  async updateProduct(id: string, dto: any, file?: Express.Multer.File) {
    return this.productsService.update(id, dto, file);
  }

  async deleteProduct(id: string) {
    return this.productsService.remove(id);
  }

  // --- Analytics ---

  async getAnalytics() {
    // 1. Order counts by status
    const ordersByStatus = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    let totalOrders = 0;
    ordersByStatus.forEach((g) => {
      statusCounts[g.status] = g._count.id;
      totalOrders += g._count.id;
    });

    // 2. Revenue (completed orders)
    const revenueResult = await this.prisma.order.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalPrice: true },
      _count: { id: true },
    });
    const totalRevenue = revenueResult._sum.totalPrice || 0;
    const completedOrders = revenueResult._count.id || 0;

    // 3. Total users
    const totalUsers = await this.prisma.user.count();

    // 4. Total products & categories
    const totalProducts = await this.prisma.product.count({ where: { isActive: true } });
    const totalCategories = await this.prisma.category.count({ where: { isActive: true } });

    // 5. Top selling products (by quantity sold in completed orders)
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: 'COMPLETED' } },
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    // Fetch product details for top products
    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await this.prisma.product.findUnique({
          where: { id: tp.productId },
          select: { name: true, imageUrl: true, price: true },
        });
        return {
          id: tp.productId,
          name: product?.name || 'Unknown',
          imageUrl: product?.imageUrl,
          totalQty: tp._sum.quantity || 0,
          totalRevenue: tp._sum.price || 0,
        };
      }),
    );

    // 6. Daily revenue for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: sevenDaysAgo },
      },
      select: { totalPrice: true, createdAt: true },
    });

    // Aggregate by day
    const dailyRevenue: { date: string; revenue: number; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayOrders = recentOrders.filter(
        (o) => o.createdAt.toISOString().slice(0, 10) === dateStr,
      );
      dailyRevenue.push({
        date: dateStr,
        revenue: dayOrders.reduce((s, o) => s + o.totalPrice, 0),
        count: dayOrders.length,
      });
    }

    // 7. Recent orders (last 5)
    const recentOrdersList = await this.prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { product: true } } },
    });

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      totalUsers,
      totalProducts,
      totalCategories,
      statusCounts,
      topProducts: topProductDetails,
      dailyRevenue,
      recentOrders: recentOrdersList,
    };
  }
}
