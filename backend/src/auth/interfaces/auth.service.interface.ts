export const AUTH_SERVICE = Symbol('AUTH_SERVICE');

export type AuthUserView = {
  id: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  roles: string[];
  status: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenMaxAgeMs: number;
  refreshTokenMaxAgeMs: number;
};

export type AuthSessionResult = {
  user: AuthUserView;
  tokens: AuthTokens;
};

export type RegisterResult = {
  user: AuthUserView;
  verificationRequired: boolean;
};

export type RegisterInput = {
  displayName: string;
  email: string;
  password: string;
  identity?: {
    phone: string;
    nik: string;
    familyCardNumber: string;
    privacyNoticeVersion: string;
    photo: Buffer;
  };
};

export type LoginInput = {
  email: string;
  password: string;
};

export interface IAuthService {
  register(input: RegisterInput): Promise<RegisterResult>;
  login(input: LoginInput): Promise<AuthSessionResult>;
  refresh(refreshToken?: string): Promise<AuthSessionResult>;
  logout(refreshToken?: string): Promise<void>;
  me(userId: string): Promise<AuthUserView>;
  forgotPassword(
    email: string,
  ): Promise<{ message: string; debug_token?: string }>;
  resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ message: string }>;
  verifyEmail(token: string): Promise<{ message: string }>;
}
