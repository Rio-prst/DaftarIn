import { AccountModule } from './account/account.module';
import { AdminModule as AccessAdminModule } from './admin/access/admin.module';
import { Module } from '@nestjs/common';
import * as path from 'node:path';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodValidationPipe } from 'nestjs-zod';
import { AdminModule } from './admin/admin.module';
import { FamilyModule } from './account/family/family.module';
import { HelpModule } from './help/help.module';
import { ChatModule } from './chat/chat.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { CommonModule } from './common/common.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { DashboardModule } from './dashboard/dashboard.module';
import { DocumentsModule } from './documents/documents.module';
import { NeedsModule } from './needs/needs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OfficerModule } from './officer/officer.module';
import { PreparationsModule } from './preparations/preparations.module';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [path.resolve(__dirname, '../.env'), path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), 'backend/.env')],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AccountModule,
    AccessAdminModule,
    CommonModule,
    StorageModule,
    AuthModule,
    CatalogModule,
    NeedsModule,
    PreparationsModule,
    DocumentsModule,
    ApplicationsModule,
    NotificationsModule,
    DashboardModule,
    OfficerModule,
    AdminModule,
    FamilyModule,
    HelpModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
