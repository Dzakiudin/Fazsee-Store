import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async findAll(query: QueryProductDto, includeInactive = false) {
    const { page = 1, limit = 12, category, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!includeInactive) {
      where.isActive = true;
    }

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          category: {
            select: { id: true, name: true, slug: true, iconUrl: true },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPopular(limit: number = 6) {
    const topProducts = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: 'COMPLETED' } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    if (topProducts.length === 0) {
      return this.prisma.product.findMany({
        where: { isActive: true },
        take: limit,
        orderBy: { sortOrder: 'asc' },
        include: {
          category: { select: { id: true, name: true, iconUrl: true } }
        }
      });
    }

    const products = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await this.prisma.product.findUnique({
          where: { id: tp.productId },
          include: { category: { select: { id: true, name: true, iconUrl: true } } }
        });
        return {
          ...product,
          totalQty: tp._sum.quantity || 0,
        };
      })
    );

    return products.filter(p => p.isActive);
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            iconUrl: true,
            accountFields: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async findByCategoryId(categoryId: string, includeInactive = false) {
    const where: any = { categoryId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
      include: {
        category: {
          select: { id: true, name: true, slug: true, iconUrl: true },
        },
      },
    });
  }

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
    let imageUrl = '';

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploaded.url;
    }

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price,
        description: dto.description,
        categoryId: dto.categoryId,
        imageUrl,
        sortOrder: dto.sortOrder || 0,
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    this.logger.log(`Product created: ${product.id} - ${product.name}`);
    return product;
  }

  async update(id: string, dto: UpdateProductDto, file?: Express.Multer.File) {
    await this.findOne(id);

    const data: any = { ...dto };

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      data.imageUrl = uploaded.url;
    }

    const product = await this.prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    this.logger.log(`Product updated: ${product.id}`);
    return product;
  }

  async remove(id: string) {
    await this.findOne(id);

    const product = await this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Product soft-deleted: ${product.id}`);
    return product;
  }

  async getCategories() {
    // Now returns actual Category records instead of distinct strings
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, slug: true, iconUrl: true },
    });
  }
}
