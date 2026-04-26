import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { QueryProductDto } from './dto/query-product.dto';
import { Public } from '../common/decorators/public.decorator';
import { ApiResponse } from '../common/dto/api-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get()
  async findAll(@Query() query: QueryProductDto) {
    const result = await this.productsService.findAll(query);
    return ApiResponse.ok(result, 'Products retrieved successfully');
  }

  @Public()
  @Get('popular')
  async getPopular() {
    const products = await this.productsService.getPopular(6);
    return ApiResponse.ok(products, 'Popular products retrieved successfully');
  }

  @Public()
  @Get('categories')
  async getCategories() {
    const categories = await this.productsService.getCategories();
    return ApiResponse.ok(categories, 'Categories retrieved successfully');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productsService.findOne(id);
    return ApiResponse.ok(product, 'Product retrieved successfully');
  }
}
