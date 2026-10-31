import type { Account, RegisterInput, Role } from "./types";

export const EXAMPLE_PASSWORD = "DaftarIn2026!";
export const EXAMPLE_ACCOUNTS: Account[] = [
  {
    id: "citizen-ayu",
    name: "Ayu Contoh",
    email: "warga@daftarin.test",
    nik: "0000000000000001",
    phone: "080000000001",
    role: "warga",
    identityStatus: "complete",
    identityPhoto: {
      name: "ktp-contoh.svg",
      type: "image/svg+xml",
      size: 0,
      sample: true,
    },
    createdAt: "2026-10-26T08:00:00+07:00",
  },
  {
    id: "officer-budi",
    name: "Budi Santoso",
    email: "petugas@daftarin.test",
    nik: "0000000000000002",
    phone: "080000000002",
    role: "petugas",
    identityStatus: "complete",
    createdAt: "2026-10-26T08:00:00+07:00",
  },
  {
    id: "admin-rina",
    name: "Rina Admin",
    email: "admin@daftarin.test",
    nik: "0000000000000003",
    phone: "080000000003",
    role: "admin",
    identityStatus: "complete",
    createdAt: "2026-10-26T08:00:00+07:00",
  },
];
interface StoredAccount extends Account {
  credential?: { salt: string; digest: string };
}
const ACCOUNTS_KEY = "daftarin:accounts:v1";
const SESSION_KEY = "daftarin:session:v1";
const RESET_KEY = "daftarin:reset:v1";
const publicAccount = ({
  credential: _credential,
  ...account
}: StoredAccount): Account => account;
function readAccounts(): StoredAccount[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(ACCOUNTS_KEY) || "null",
    );
    if (Array.isArray(parsed))
      return parsed.filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          typeof item.email === "string" &&
          typeof item.nik === "string" &&
          typeof item.name === "string" &&
          typeof item.phone === "string" &&
          ["warga", "petugas", "admin"].includes(item.role),
      );
  } catch {
    /* A damaged fixture must not prevent the sign-in screen from opening. */
  }
  return EXAMPLE_ACCOUNTS.map((account) => ({ ...account }));
}
function writeAccounts(accounts: StoredAccount[]) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    throw new Error(
      "Akun belum tersimpan. Ruang penyimpanan browser tidak tersedia.",
    );
  }
}
const hex = (bytes: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(bytes))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
async function derive(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  return hex(
    await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    ),
  );
}
async function credential(password: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
  return { salt, digest: await derive(password, salt) };
}
function startSession(account: Account) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      id: account.id,
      expiresAt: Date.now() + 8 * 60 * 60 * 1000,
    }),
  );
}
function requireAdmin() {
  if (mockAuth.currentUser()?.role !== "admin")
    throw new Error("Hanya admin yang dapat mengelola akun petugas.");
}
/** Browser-only adapter for dummy accounts; replace with server auth before deployment. Never stores KTP bytes or a plaintext user password. */
export const mockAuth = {
  currentUser(): Account | null {
    try {
      const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (
        !session ||
        typeof session.id !== "string" ||
        typeof session.expiresAt !== "number" ||
        session.expiresAt <= Date.now()
      )
        return null;
      const account = readAccounts().find((item) => item.id === session.id);
      return account && account.active !== false
        ? publicAccount(account)
        : null;
    } catch {
      return null;
    }
  },
  async login(identifier: string, password: string) {
    const normalized = identifier.trim().toLowerCase();
    const account = readAccounts().find(
      (item) =>
        item.email.toLowerCase() === normalized || item.nik === normalized,
    );
    const correct =
      account &&
      (account.credential
        ? (await derive(password, account.credential.salt)) ===
          account.credential.digest
        : EXAMPLE_ACCOUNTS.some((item) => item.id === account.id) &&
          password === EXAMPLE_PASSWORD);
    if (!account || !correct)
      throw new Error(
        "NIK/email atau kata sandi tidak sesuai. Periksa lalu coba lagi.",
      );
    if (account.active === false)
      throw new Error("Akun sedang dinonaktifkan. Hubungi admin.");
    const result = publicAccount(account);
    startSession(result);
    return result;
  },
  async register(input: RegisterInput) {
    if (
      !input.name.trim() ||
      !/^\d{16}$/.test(input.nik) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
      input.password.trim().length < 8 ||
      !input.identityPhoto?.name
    )
      throw new Error("Lengkapi data pendaftaran dengan benar.");
    const accounts = readAccounts();
    if (
      accounts.some(
        (item) =>
          item.nik === input.nik ||
          item.email.toLowerCase() === input.email.trim().toLowerCase(),
      )
    )
      throw new Error(
        "NIK atau email sudah terdaftar. Gunakan akunmu untuk masuk.",
      );
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      nik: input.nik,
      phone: input.phone,
      role: "warga",
      identityStatus: "pending",
      identityPhoto: input.identityPhoto,
      createdAt: new Date().toISOString(),
      credential: await credential(input.password),
    };
    writeAccounts([...accounts, account]);
    const result = publicAccount(account);
    startSession(result);
    return result;
  },
  logout() {
    sessionStorage.removeItem(SESSION_KEY);
  },
  listAccounts() {
    requireAdmin();
    return readAccounts().map(publicAccount);
  },
  async createOfficer(input: {
    name: string;
    email: string;
    password: string;
  }) {
    requireAdmin();
    if (
      !input.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email) ||
      input.password.trim().length < 8
    )
      throw new Error("Isi nama, email, dan kata sandi minimal 8 karakter.");
    const accounts = readAccounts();
    if (
      accounts.some(
        (item) => item.email.toLowerCase() === input.email.trim().toLowerCase(),
      )
    )
      throw new Error("Email sudah digunakan.");
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      nik: "",
      phone: "",
      role: "petugas",
      identityStatus: "complete",
      createdAt: new Date().toISOString(),
      credential: await credential(input.password),
    };
    writeAccounts([...accounts, account]);
    return publicAccount(account);
  },
  setOfficerActive(id: string, active: boolean) {
    requireAdmin();
    const accounts = readAccounts();
    const target = accounts.find((account) => account.id === id);
    if (!target || target.role !== "petugas")
      throw new Error("Pilih akun petugas yang akan diubah.");
    writeAccounts(
      accounts.map((account) =>
        account.id === id ? { ...account, active } : account,
      ),
    );
  },
  updateProfile(input: { name: string; phone: string }) {
    const current = this.currentUser();
    if (!current) throw new Error("Silakan masuk kembali.");
    if (input.name.trim().length < 3 || !/^\+?\d{10,15}$/.test(input.phone))
      throw new Error("Isi nama dan nomor telepon yang benar.");
    const accounts = readAccounts().map((account) =>
      account.id === current.id
        ? { ...account, name: input.name.trim(), phone: input.phone }
        : account,
    );
    writeAccounts(accounts);
    return publicAccount(
      accounts.find((account) => account.id === current.id)!,
    );
  },
  requestReset(email: string) {
    const account = readAccounts().find(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!account) return null;
    const token = crypto.randomUUID();
    sessionStorage.setItem(
      RESET_KEY,
      JSON.stringify({
        token,
        id: account.id,
        expiresAt: Date.now() + 15 * 60 * 1000,
      }),
    );
    return token;
  },
  async resetPassword(token: string, password: string) {
    let reset;
    try {
      reset = JSON.parse(sessionStorage.getItem(RESET_KEY) || "null");
    } catch {
      reset = null;
    }
    if (!reset || reset.token !== token || reset.expiresAt < Date.now())
      throw new Error(
        "Tautan pemulihan sudah tidak berlaku. Minta tautan baru.",
      );
    if (password.trim().length < 8)
      throw new Error("Gunakan kata sandi minimal 8 karakter.");
    const accounts = readAccounts();
    const index = accounts.findIndex((account) => account.id === reset.id);
    if (index < 0) throw new Error("Akun tidak ditemukan.");
    accounts[index] = {
      ...accounts[index],
      credential: await credential(password),
    };
    writeAccounts(accounts);
    sessionStorage.removeItem(RESET_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  },
};
export const roleLabels: Record<Role, string> = {
  warga: "Warga",
  petugas: "Petugas",
  admin: "Admin",
};
