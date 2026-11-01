import { ApiError, request } from "../api/transport";
import type { Account, RegisterInput, Role } from "./types";
export interface ServerUser {
  id: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  roles: string[];
  status: string;
  phone?: string;
  created_at?: string;
}
export function mapServerAccount(input: ServerUser): Account {
  if (
    !input ||
    typeof input.id !== "string" ||
    typeof input.display_name !== "string" ||
    typeof input.email !== "string" ||
    !Array.isArray(input.roles)
  )
    throw new Error("Data akun server belum sesuai.");
  const roles: Record<string, Role> = {
    citizen: "warga",
    officer: "petugas",
    admin: "admin",
  };
  const role = ["admin", "officer", "citizen"].find((value) =>
    input.roles.includes(value),
  );
  if (!role)
    throw new Error("Akun belum memiliki peran yang dapat mengakses aplikasi.");
  return {
    id: input.id,
    name: input.display_name,
    email: input.email,
    role: roles[role],
    nik: "",
    phone: typeof input.phone === "string" ? input.phone : "",
    active: !["suspended", "deletion_requested", "deleted"].includes(
      input.status.toLowerCase(),
    ),
    identityStatus: "pending",
    emailVerified: input.email_verified,
    createdAt: input.created_at || "",
  };
}
export const serverAuth = {
  async currentUser(): Promise<Account | null> {
    try {
      return mapServerAccount(await request<ServerUser>("/auth/me"));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }
  },
  async login(email: string, password: string) {
    const result = await request<{ user: ServerUser }>(
      "/auth/login",
      { method: "POST", body: { email: email.trim(), password } },
      false,
    );
    return mapServerAccount(result.user);
  },
  async register(input: RegisterInput) {
    const result = await request<{
      user: ServerUser;
      verification_required: boolean;
    }>(
      "/auth/register",
      {
        method: "POST",
        body: {
          display_name: input.name.trim(),
          email: input.email.trim(),
          password: input.password,
          privacy_accepted: true,
          privacy_notice_version: "2026-11-01",
        },
      },
      false,
    );
    return mapServerAccount(result.user);
  },
  async logout() {
    try {
      await request<void>("/auth/logout", { method: "POST" });
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
    }
  },
};
