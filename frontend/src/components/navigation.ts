export type AppRole = "warga" | "petugas" | "admin";

export const roleNavigation = {
  warga: [
    { label: "Dashboard", path: "/dashboard", icon: "dashboard" },
    { label: "Cari layanan", path: "/katalog", icon: "search" },
    { label: "Persiapan saya", path: "/persiapan", icon: "folder_open" },
    { label: "Pengajuan saya", path: "/pelacakan", icon: "timeline" },
  ],
  petugas: [
    { label: "Ringkasan pekerjaan", path: "/petugas/ringkasan", icon: "dashboard" },
    { label: "Antrean tinjauan", path: "/petugas", icon: "rule" },
    { label: "Riwayat tinjauan", path: "/petugas/riwayat", icon: "history" },
  ],
  admin: [
    { label: "Ringkasan operasional", path: "/admin", icon: "dashboard" },
    { label: "Layanan & persyaratan", path: "/admin/layanan", icon: "description" },
    { label: "Petugas & penugasan", path: "/admin/petugas", icon: "group" },
    { label: "Sumber & versi panduan", path: "/admin/sumber", icon: "source" },
    { label: 'Permintaan bantuan', path: '/admin/bantuan', icon: 'support_agent' },
    { label: "Riwayat aktivitas", path: "/admin/aktivitas", icon: "history" },
  ],
};

export function workspaceNavigation(role: AppRole, mode: string) {
  return role === 'admin' && mode === 'api' ? [
    {label: 'Akun & petugas', path: '/admin/petugas', icon: 'group'},
    {label: 'Riwayat aktivitas', path: '/admin/aktivitas', icon: 'history'},
  ] : roleNavigation[role];
}

export function isNavItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === '/admin') return pathname === '/admin';
  if (itemPath === '/petugas') return pathname === '/petugas' || /^\/petugas\/(?!ringkasan(?:\/|$)|riwayat(?:\/|$))[^/]+$/.test(pathname);
  if (itemPath === "/katalog") {
    return (
      pathname === "/katalog" ||
      pathname === "/kebutuhan" ||
      pathname === "/panduan" ||
      pathname.startsWith("/layanan/")
    );
  }
  if (itemPath === "/persiapan") {
    return pathname === "/persiapan" || pathname.startsWith("/persiapan/");
  }
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}
