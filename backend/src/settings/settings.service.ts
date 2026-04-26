import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async getSettings() {
    // Upsert to ensure a default row always exists
    return this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default' },
      update: {},
    });
  }

  async updateSettings(
    data: {
      storeName?: string;
      waNumber?: string;
      waNotifyOnOrder?: boolean;
      bankAccounts?: string; // JSON string
    },
    qrisFile?: Express.Multer.File,
  ) {
    let qrisImageUrl: string | undefined;

    if (qrisFile) {
      try {
        const uploaded = await this.cloudinaryService.uploadImage(qrisFile);
        qrisImageUrl = uploaded.url;
        this.logger.log(`QRIS image uploaded: ${qrisImageUrl}`);
      } catch (error) {
        this.logger.error(`Failed to upload QRIS image: ${error.message}`);
        throw error;
      }
    }

    const updateData: any = {};
    if (data.storeName !== undefined) updateData.storeName = data.storeName;
    if (data.waNumber !== undefined) updateData.waNumber = data.waNumber;
    if (data.waNotifyOnOrder !== undefined)
      updateData.waNotifyOnOrder = data.waNotifyOnOrder === true || data.waNotifyOnOrder === ('true' as any);
    if (data.bankAccounts !== undefined)
      updateData.bankAccounts = data.bankAccounts;
    if (qrisImageUrl) updateData.qrisImageUrl = qrisImageUrl;

    const settings = await this.prisma.storeSettings.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...updateData },
      update: updateData,
    });

    this.logger.log('Store settings updated');
    return settings;
  }
}
