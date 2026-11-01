import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { AUTH_REPOSITORY } from './interfaces/auth.repository.interface';
import { AUTH_SERVICE } from './interfaces/auth.service.interface';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET') || configService.get<string>('JWT_SECRET') || 'daftarin-companion-jwt-access-secret-32-bytes-long!',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: AUTH_REPOSITORY,
      useClass: AuthRepository,
    },
    {
      provide: AUTH_SERVICE,
      useClass: AuthService,
    },
  ],
  exports: [JwtModule],
})
export class AuthModule {}
