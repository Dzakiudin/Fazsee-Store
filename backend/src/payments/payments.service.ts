import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async uploadProof(orderId: string, file: Express.Multer.File) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      throw new NotFoundException(`Order "${orderId}" not found`);
    }

    if (order.status !== 'PENDING' && order.status !== 'PROCESSING') {
      throw new BadRequestException(
        'Order status is no longer valid for uploading proof',
      );
    }

    if (!file) {
      throw new BadRequestException('Payment proof image is required');
    }

    // Upload to Cloudinary
    let imageUrl: string;
    try {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      imageUrl = uploaded.url;
    } catch (error) {
      throw new BadRequestException('Failed to upload proof image');
    }

    // Upsert Payment record with manual proof
    await this.prisma.payment.upsert({
      where: { orderId: orderId },
      update: {
        qrUrl: imageUrl, // Storing proof image here
        status: 'PENDING',
        method: 'MANUAL',
      },
      create: {
        orderId: orderId,
        paymentUrl: null,
        qrUrl: imageUrl,
        status: 'PENDING',
        method: 'MANUAL',
      },
    });

    // Option: also update order status to PROCESSING so admin knows it's waiting verification
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PROCESSING' },
    });

    this.logger.log(`Manual payment proof uploaded for order ${orderId}`);

    return {
      orderId: order.id,
      proofUrl: imageUrl,
      status: 'PROCESSING',
    };
  }
}
