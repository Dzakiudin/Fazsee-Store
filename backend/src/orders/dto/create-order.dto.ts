import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Min(1, { message: 'Quantity must be at least 1' })
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  // JSON string of account data from Step 1
  @IsOptional()
  @IsString()
  accountData?: string;

  // WhatsApp number from Step 5
  @IsOptional()
  @IsString()
  whatsapp?: string;

  // Payment method from Step 4
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
