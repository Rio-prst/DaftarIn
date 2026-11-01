import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { AccountStatus, Prisma } from '../generated/prisma/client';
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
  constructor(
    @Inject(AUTH_REPOSITORY)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<RegisterResult> {
    const email = input.email.trim().toLowerCase();
    const existingUser = await this.authRepository.findUserByEmail(email);

    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST);

    try {
      const user = await this.authRepository.createCitizenUser({
        displayName: input.displayName,
        email,
        passwordHash,
      });

      return {
        user: this.toUserView(user),
        verificationRequired: false,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email sudah terdaftar');
      }

      throw error;
    }
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
      await this.authRepository.revokeAllUserSessions(currentSession.userId);
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
