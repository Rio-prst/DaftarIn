import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import FileType from 'file-type';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  AccountStatus,
  AccountTokenType,
  Prisma,
} from '../generated/prisma/client';
import { STORAGE_SERVICE, type IStorageService } from '../storage/interfaces/storage.service.interface';
import { SessionAlreadyRotatedError } from './errors/session-already-rotated.error';
import {
  AUTH_REPOSITORY,
  type AuthUser,
  type IAuthRepository,
  type RefreshSessionRecord,
} from './interfaces/auth.repository.interface';
import type {
  AuthSessionResult,
  AuthUserView,
  IAuthService,
  LoginInput,
  RegisterInput,
  RegisterResult,
} from './interfaces/auth.service.interface';

const BCRYPT_COST = 12;
const FALLBACK_ACCESS_TTL_SECONDS = 15 * 60;
const FALLBACK_REFRESH_TTL_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(STORAGE_SERVICE)
    private readonly storage?: IStorageService,
  ) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    let identity;
    if (input.identity) {
      const { photo, ...fields } = input.identity;
      const detected = await FileType.fromBuffer(photo).catch(() => undefined);
      if (detected?.mime !== 'image/jpeg' && detected?.mime !== 'image/png') {
        throw new BadRequestException('Isi foto KTP harus berupa JPG atau PNG.');
      }
      if (!this.storage) {
        throw new ServiceUnavailableException('Penyimpanan foto KTP belum tersedia.');
      }

      const photoStorageKey = `registration-identities/${randomUUID()}.${detected.ext}`;
      await this.storage.uploadFile(photoStorageKey, photo, detected.mime);
      identity = { ...fields, photoStorageKey };
    }

    let user: AuthUser;
    try {
      user = await this.authRepository.createCitizenUser({
        displayName: input.displayName,
        email,
        passwordHash,
        ...(identity && { identity }),
      });
    } catch (error) {
      if (identity && this.storage) {
        try {
          await this.storage.deleteFile(identity.photoStorageKey);
        } catch {
          this.logger.warn(`Gagal membersihkan foto pendaftaran: ${identity.photoStorageKey}`);
        }
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email sudah terdaftar');
      }

      throw error;
    }

    return {
      user: this.toUserView(user),
      verificationRequired: false,
    };
  }

  async login(input: LoginInput): Promise<AuthSessionResult> {
    const email = input.email.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(email);

    if (!user?.passwordHash) {
      throw this.invalidCredentials();
    }

    this.assertActive(user);

    const passwordMatches = await bcrypt.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw this.invalidCredentials();
    }

    await this.authRepository.touchLastLogin(user.id);

    return this.createSession(user);
  }

  async refresh(refreshToken?: string): Promise<AuthSessionResult> {
    if (!refreshToken) {
      throw this.invalidSession();
    }

    const currentSession =
      await this.authRepository.findRefreshSessionByTokenHash(
        this.hashToken(refreshToken),
      );

    if (!currentSession) {
      throw this.invalidSession();
    }

    if (currentSession.revokedAt) {
      if (currentSession.replacedBySessionId) {
        await this.authRepository.revokeAllUserSessions(currentSession.userId);
      }
      throw this.invalidSession();
    }

    if (currentSession.expiresAt.getTime() <= Date.now()) {
      await this.authRepository.revokeRefreshSession(currentSession.id);
      throw this.invalidSession();
    }

    this.assertActive(currentSession.user);

    const nextRefreshToken = this.generateRefreshToken();
    const nextSession = await this.rotateSession(
      currentSession,
      nextRefreshToken,
    );

    return this.buildSessionResult(
      currentSession.user,
      nextSession,
      nextRefreshToken,
    );
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.authRepository.revokeRefreshSessionByTokenHash(
      this.hashToken(refreshToken),
    );
  }

  async me(userId: string): Promise<AuthUserView> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw this.invalidSession();
    }

    this.assertActive(user);

    return this.toUserView(user);
  }

  private async createSession(user: AuthUser): Promise<AuthSessionResult> {
    const refreshToken = this.generateRefreshToken();
    const session = await this.authRepository.createRefreshSession({
      userId: user.id,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: this.refreshTokenExpiry(),
    });

    return this.buildSessionResult(user, session, refreshToken);
  }

  private async rotateSession(
    currentSession: { id: string; userId: string },
    refreshToken: string,
  ): Promise<RefreshSessionRecord> {
    try {
      return await this.authRepository.rotateRefreshSession({
        currentSessionId: currentSession.id,
        userId: currentSession.userId,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.refreshTokenExpiry(),
      });
    } catch (error) {
      if (error instanceof SessionAlreadyRotatedError) {
        await this.authRepository.revokeAllUserSessions(currentSession.userId);
      }

      throw this.invalidSession();
    }
  }

  private async buildSessionResult(
    user: AuthUser,
    session: RefreshSessionRecord,
    refreshToken: string,
  ): Promise<AuthSessionResult> {
    const accessTokenTtlSeconds = this.accessTokenTtlSeconds();
    const refreshTokenTtlDays = this.refreshTokenTtlDays();
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: this.primaryRole(user),
        session_id: session.id,
      },
      {
        expiresIn: accessTokenTtlSeconds,
      },
    );

    return {
      user: this.toUserView(user),
      tokens: {
        accessToken,
        refreshToken,
        accessTokenMaxAgeMs: accessTokenTtlSeconds * 1000,
        refreshTokenMaxAgeMs: refreshTokenTtlDays * DAY_IN_MS,
      },
    };
  }

  private toUserView(user: AuthUser): AuthUserView {
    return {
      id: user.id,
      display_name: user.displayName,
      email: user.email,
      email_verified: user.emailVerifiedAt !== null,
      roles: user.userRoles.map((userRole) => userRole.role.roleCode),
      status: user.accountStatus.toLowerCase(),
    };
  }

  private primaryRole(user: AuthUser): string {
    return user.userRoles[0]?.role.roleCode ?? 'citizen';
  }

  private assertActive(user: AuthUser): void {
    const blockedStatuses: AccountStatus[] = [
      AccountStatus.SUSPENDED,
      AccountStatus.DELETION_REQUESTED,
      AccountStatus.DELETED,
    ];

    if (user.deletedAt || blockedStatuses.includes(user.accountStatus)) {
      throw new ForbiddenException('Akun tidak aktif');
    }
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private refreshTokenExpiry(): Date {
    return new Date(Date.now() + this.refreshTokenTtlDays() * DAY_IN_MS);
  }

  private accessTokenTtlSeconds(): number {
    const configured = this.configService.get<string>('JWT_ACCESS_TTL');

    return parseDurationToSeconds(configured, FALLBACK_ACCESS_TTL_SECONDS);
  }

  private refreshTokenTtlDays(): number {
    const configured = Number(
      this.configService.get<string>('REFRESH_TOKEN_TTL_DAYS'),
    );

    return Number.isFinite(configured) && configured > 0
      ? configured
      : FALLBACK_REFRESH_TTL_DAYS;
  }

  private invalidCredentials(): UnauthorizedException {
    return new UnauthorizedException('Email atau password salah');
  }

  private invalidSession(): UnauthorizedException {
    return new UnauthorizedException('Sesi tidak valid atau sudah kedaluwarsa');
  }

  async forgotPassword(
    emailInput: string,
  ): Promise<{ message: string; debug_token?: string }> {
    const email = emailInput.trim().toLowerCase();
    const user = await this.authRepository.findUserByEmail(email);

    if (!user) {
      return {
        message:
          'Jika email terdaftar, instruksi pemulihan kata sandi telah dikirimkan.',
      };
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.authRepository.createAccountToken({
      userId: user.id,
      tokenHash,
      type: AccountTokenType.PASSWORD_RESET,
      expiresAt,
    });

    const isDevelopment =
      this.configService.get<string>('NODE_ENV') !== 'production';

    return {
      message:
        'Jika email terdaftar, instruksi pemulihan kata sandi telah dikirimkan.',
      ...(isDevelopment ? { debug_token: rawToken } : {}),
    };
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawToken.trim());
    const tokenRecord = await this.authRepository.findAccountToken(
      tokenHash,
      AccountTokenType.PASSWORD_RESET,
    );

    if (!tokenRecord) {
      throw new BadRequestException(
        'Token reset kata sandi tidak valid atau telah kedaluwarsa.',
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, BCRYPT_COST);
    await this.authRepository.updateUserPassword(
      tokenRecord.userId,
      passwordHash,
    );
    await this.authRepository.markAccountTokenUsed(tokenRecord.id);

    await this.authRepository.revokeAllUserSessions(tokenRecord.userId);

    return {
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali.',
    };
  }

  async verifyEmail(rawToken: string): Promise<{ message: string }> {
    const tokenHash = this.hashToken(rawToken.trim());
    const tokenRecord = await this.authRepository.findAccountToken(
      tokenHash,
      AccountTokenType.EMAIL_VERIFICATION,
    );

    if (!tokenRecord) {
      throw new BadRequestException(
        'Token verifikasi email tidak valid atau telah kedaluwarsa.',
      );
    }

    await this.authRepository.verifyUserEmail(tokenRecord.userId);
    await this.authRepository.markAccountTokenUsed(tokenRecord.id);

    return {
      message: 'Email berhasil diverifikasi. Akun Anda kini aktif.',
    };
  }
}

function parseDurationToSeconds(
  value: string | undefined,
  fallbackSeconds: number,
): number {
  if (!value) {
    return fallbackSeconds;
  }

  const normalized = value.trim();

  if (/^\d+$/.test(normalized)) {
    return Number(normalized);
  }

  const match = /^(\d+)([smhd])$/.exec(normalized);

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const unitSeconds: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: DAY_IN_MS / 1000,
  };

  return amount * (unitSeconds[unit] ?? 0) || fallbackSeconds;
}
