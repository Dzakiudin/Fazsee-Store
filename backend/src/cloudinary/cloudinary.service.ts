import { Injectable, Logger, BadRequestException } from '@nestjs/common';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      );
    }

    // Max 32MB for ImgBB, but keep at 5MB limit for app performance
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    try {
      // Because ImgBB imposes strict rate limits and IP blocking ("Forbidden"),
      // we convert the image to a base64 Data URL so it is stored directly in the database.
      // Prisma String/TEXT fields can handle MBs of data easily.
      const base64Data = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      const uniqueId = `local_${Date.now()}`;

      this.logger.log(`Image processed as Base64 Data URL: ${uniqueId}`);

      return {
        url: base64Data,
        publicId: uniqueId,
      };
    } catch (error) {
      this.logger.error(`Image processing failed: ${error.message}`);
      throw new BadRequestException('Failed to process image');
    }
  }

  async deleteImage(publicId: string): Promise<void> {
    // ImgBB API does not support image deletion via API unless using private tokens which are complex.
    // For free public hosting, we just leave it or ignore it.
    this.logger.log(
      `Image deletion not supported for ImgBB (skipped): ${publicId}`,
    );
  }
}
