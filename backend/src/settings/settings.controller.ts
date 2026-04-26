import {
  Controller,
  Get,
  Patch,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SettingsService } from './settings.service';
import { ApiResponse } from '../common/dto/api-response.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  // Public: anyone can read store settings (for payment page)
  @Public()
  @Get()
  async getSettings() {
    const settings = await this.settingsService.getSettings();
    return ApiResponse.ok(settings, 'Store settings retrieved');
  }

  // Admin only: update settings
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Patch()
  @UseInterceptors(
    FileInterceptor('qrisImage', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateSettings(
    @Body()
    body: {
      storeName?: string;
      waNumber?: string;
      waNotifyOnOrder?: string;
      bankAccounts?: string;
    },
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const settings = await this.settingsService.updateSettings(
      {
        storeName: body.storeName,
        waNumber: body.waNumber,
        waNotifyOnOrder: body.waNotifyOnOrder === 'true',
        bankAccounts: body.bankAccounts,
      },
      file,
    );
    return ApiResponse.ok(settings, 'Store settings updated');
  }
}
