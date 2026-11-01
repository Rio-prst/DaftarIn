export type Role = "warga" | "petugas" | "admin";
export interface IdentityPhoto {
  name: string;
  type: string;
  size: number;
  sample: boolean;
}
export interface Account {
  id: string;
  name: string;
  email: string;
  nik: string;
  phone: string;
  role: Role;
  active?: boolean;
  identityStatus: "complete" | "pending";
  emailVerified?: boolean;
  identityPhoto?: IdentityPhoto;
  createdAt: string;
}
export interface RegisterInput {
  name: string;
  email: string;
  nik: string;
  phone: string;
  password: string;
  identityPhoto: IdentityPhoto;
}
export const roleHome: Record<Role, string> = {
  warga: "/dashboard",
  petugas: "/petugas/ringkasan",
  admin: "/admin",
};
export function permittedReturnPath(next: string | null, role: Role) {
  if (!next || !next.startsWith("/") || next.startsWith("//"))
    return roleHome[role];
  const pathname = next.split("?")[0];
  if (
    pathname === "/akun" || pathname === "/bantuan" ||
    pathname === roleHome[role] ||
    (role === "petugas" && pathname.startsWith("/petugas/")) ||
    (role === "petugas" && pathname === '/petugas') ||
    (role === "admin" && ['/admin/layanan', '/admin/petugas', '/admin/sumber', '/admin/aktivitas', '/admin/bantuan'].includes(pathname)) ||
    (role === "warga" &&
      (pathname === "/persiapan" ||
        pathname.startsWith("/persiapan/") ||
        pathname === "/pelacakan" ||
        pathname.startsWith("/pelacakan/") ||
        pathname === "/katalog" ||
        pathname === "/kebutuhan" ||
        pathname === "/keluarga" ||
        pathname === "/panduan" ||
        pathname.startsWith("/layanan/")))
  )
    return next;
  return roleHome[role];
}
