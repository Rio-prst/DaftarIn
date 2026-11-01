import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NEEDS_SERVICE } from './interfaces/needs.service.interface';
import { NeedsController } from './needs.controller';
import { NeedsService } from './needs.service';

@Module({
  imports: [PrismaModule],
  controllers: [NeedsController],
  providers: [
    {
      provide: NEEDS_SERVICE,
      useClass: NeedsService,
    },
  ],
  exports: [NEEDS_SERVICE],
})
export class NeedsModule {}
