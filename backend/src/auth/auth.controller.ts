import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import type {
  CookieOptions,
  Request,
  Response as ExpressResponse,
} from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Response } from '../common/response/response';
import type { AuthenticatedUser } from '../common/types/authenticated-user';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import {
  AUTH_SERVICE,
  type AuthTokens,
  type IAuthService,
} from './interfaces/auth.service.interface';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register({
      displayName: dto.display_name,
      email: dto.email,
      password: dto.password,
    });

    return new Response({
      data: {
        user: result.user,
        verification_required: result.verificationRequired,
      },
    });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const result = await this.authService.login({
      email: dto.email,
      password: dto.password,
    });

    this.setAuthCookies(response, result.tokens);

    return new Response({
      data: {
        user: result.user,
      },
    });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: ExpressResponse,
  ) {
    const refreshToken = request.cookies?.[REFRESH_COOKIE] as
      string | undefined;
    const result = await this.authService.refresh(refreshToken);

    this.setAuthCookies(response, result.tokens);

    return new Response({
      data: {
        user: result.user,
      },
    });
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: ExpressResponse,
  ): Promise<void> {
    const refreshToken = request.cookies?.[REFRESH_COOKIE] as
      string | undefined;

    try {
      await this.authService.logout(refreshToken);
    } finally {
      this.clearAuthCookies(response);
    }
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto.email);
    return new Response({ data: result });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(
      dto.token,
      dto.new_password,
    );
    return new Response({ data: result });
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    const result = await this.authService.verifyEmail(dto.token);
    return new Response({ data: result });
  }

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const authUser = await this.authService.me(user.id);

    return new Response({
      data: authUser,
    });
  }

  private setAuthCookies(response: ExpressResponse, tokens: AuthTokens): void {
    const options = this.cookieOptions();

    response.cookie(ACCESS_COOKIE, tokens.accessToken, {
      ...options,
      maxAge: tokens.accessTokenMaxAgeMs,
    });
    response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
      ...options,
      maxAge: tokens.refreshTokenMaxAgeMs,
    });
  }

  private clearAuthCookies(response: ExpressResponse): void {
    const options = this.cookieOptions();

    response.clearCookie(ACCESS_COOKIE, options);
    response.clearCookie(REFRESH_COOKIE, options);
  }

  private cookieOptions(): CookieOptions {
    const secure = this.configService.get<string>('COOKIE_SECURE') === 'true';
    const domain = this.configService.get<string>('COOKIE_DOMAIN');

    return {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      path: '/',
      ...(domain && domain !== 'localhost' ? { domain } : {}),
    };
  }
}
