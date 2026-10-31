export type AppRole = "warga" | "petugas" | "admin";

export const roleNavigation = {
  warga: [
    { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { label: "Cari layanan", path: "/katalog", icon: "search" },
    { label: "Persiapan saya", path: "/persiapan", icon: "folder_open" },
    { label: "Pengajuan saya", path: "/pelacakan", icon: "timeline" },
  ],
  petugas: [{ label: "Antrean verifikasi", path: "/petugas", icon: "rule" }],
  admin: [{ label: "Panduan dan aturan", path: "/admin", icon: "tune" }],
};

export function isNavItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === "/katalog") {
    return (
      pathname === "/katalog" ||
      pathname === "/panduan" ||
      pathname.startsWith("/layanan/")
    );
  }
  if (itemPath === "/persiapan") {
    return pathname === "/persiapan" || pathname.startsWith("/persiapan/");
  }
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}
