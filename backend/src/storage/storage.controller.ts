import {
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  Inject,
  Query,
  Res,
} from '@nestjs/common';
import type { Response as ExpressResponse } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import {
  STORAGE_SERVICE,
  type IStorageService,
} from './interfaces/storage.service.interface';
import { StorageService } from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  @Get('raw')
  async getRawFile(
    @Query('key') key: string,
    @CurrentUser() user: AuthenticatedUser,
    @Res() res: ExpressResponse,
  ) {
    if (!key) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send('Parameter key wajib diisi.');
    }
    if (!key.startsWith(`users/${user.id}/`)) {
      throw new ForbiddenException('Anda tidak memiliki akses ke berkas ini.');
    }
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (this.storageService instanceof StorageService) {
      const { buffer, filePath } = this.storageService.getLocalFile(key);
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      return res.status(HttpStatus.OK).send(buffer);
    }

    return res
      .status(HttpStatus.NOT_FOUND)
      .send('Penyimpanan lokal tidak aktif.');
  }
}
