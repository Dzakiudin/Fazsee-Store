import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminService } from './admin.service';
import { CreateProductDto } from '../products/dto/create-product.dto';
import { UpdateProductDto } from '../products/dto/update-product.dto';
import { QueryProductDto } from '../products/dto/query-product.dto';
import { CreateCategoryDto } from '../categories/dto/create-category.dto';
import { UpdateCategoryDto } from '../categories/dto/update-category.dto';
import { UpdateOrderStatusDto } from '../orders/dto/update-order-status.dto';
import { ApiResponse } from '../common/dto/api-response.dto';
import { OrderStatus } from '@prisma/client';
import { memoryStorage } from 'multer';

import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // --- Orders ---

  @Get('orders')
  async getAllOrders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: OrderStatus,
  ) {
    const result = await this.adminService.getAllOrders(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
    return ApiResponse.ok(result, 'Orders retrieved successfully');
  }

  @Get('analytics')
  async getAnalytics() {
    const data = await this.adminService.getAnalytics();
    return ApiResponse.ok(data, 'Analytics retrieved successfully');
  }

  @Patch('orders/:id/status')
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    const order = await this.adminService.updateOrderStatus(id, dto.status);
    return ApiResponse.ok(order, 'Order status updated successfully');
  }

  // --- Categories ---

  @Get('categories')
  async getAllCategories() {
    const categories = await this.adminService.getAllCategories();
    return ApiResponse.ok(categories, 'Categories retrieved successfully');
  }

  @Post('categories')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createCategory(
    @Body() dto: CreateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const category = await this.adminService.createCategory(dto, file);
    return ApiResponse.ok(category, 'Category created successfully');
  }

  @Patch('categories/:id')
  @UseInterceptors(
    FileInterceptor('icon', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const category = await this.adminService.updateCategory(id, dto, file);
    return ApiResponse.ok(category, 'Category updated successfully');
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    const category = await this.adminService.deleteCategory(id);
    return ApiResponse.ok(category, 'Category deleted successfully');
  }

  // --- Products ---

  @Get('products')
  async getAllProducts(@Query() query: QueryProductDto) {
    const result = await this.adminService.getAllProducts(query);
    return ApiResponse.ok(result, 'Products retrieved successfully');
  }

  @Post('products')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async createProduct(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const product = await this.adminService.createProduct(dto, file);
    return ApiResponse.ok(product, 'Product created successfully');
  }

  @Patch('products/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const product = await this.adminService.updateProduct(id, dto, file);
    return ApiResponse.ok(product, 'Product updated successfully');
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.adminService.deleteProduct(id);
    return ApiResponse.ok(product, 'Product deleted successfully');
  }
}
