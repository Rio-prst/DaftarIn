import { Module } from '@nestjs/common';
import { STORAGE_SERVICE } from './interfaces/storage.service.interface';
import { StorageService } from './storage.service';

@Module({
  providers: [
    {
      provide: STORAGE_SERVICE,
      useClass: StorageService,
    },
  ],
  exports: [STORAGE_SERVICE],
})
export class StorageModule {}
