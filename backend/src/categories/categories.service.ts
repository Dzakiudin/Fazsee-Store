import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  async findAll(includeInactive = false) {
    const where: any = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.category.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } },
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { price: 'asc' }],
        },
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category "${slug}" not found`);
    }

    return category;
  }

  async create(dto: CreateCategoryDto, file?: Express.Multer.File) {
    const slug = this.slugify(dto.name);

    // Check for duplicate slug
    const existing = await this.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    let iconUrl: string | null = null;
    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      iconUrl = uploaded.url;
    }

    const category = await this.prisma.category.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || null,
        iconUrl,
        accountFields: dto.accountFields || null,
        sortOrder: dto.sortOrder || 0,
      },
    });

    this.logger.log(`Category created: ${category.id} - ${category.name}`);
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, file?: Express.Multer.File) {
    await this.findOne(id);

    const data: any = { ...dto };

    if (dto.name) {
      data.slug = this.slugify(dto.name);
      // Check slug uniqueness excluding current
      const existing = await this.prisma.category.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }

    if (file) {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      data.iconUrl = uploaded.url;
    }

    const category = await this.prisma.category.update({
      where: { id },
      data,
    });

    this.logger.log(`Category updated: ${category.id}`);
    return category;
  }

  async remove(id: string) {
    await this.findOne(id);

    const category = await this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Category soft-deleted: ${category.id}`);
    return category;
  }
}
