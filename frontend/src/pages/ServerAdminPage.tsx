import { useNavigate } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from "react";
import {
  adminApi,
  type AgencyOption,
  type AuditEntry,
  type ManagedAccount,
} from "../api/admin";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { WorkspaceTabs } from "../components/WorkspaceTabs";
import { PasswordField } from "../components/PasswordField";

const roleNames: Record<string, string> = {
  citizen: "Warga",
  officer: "Petugas",
  admin: "Admin",
};
const actionNames: Record<string, string> = {
  "account.access_changed": "Akses akun diubah",
  ACCOUNT_PROFILE_UPDATED: "Profil diperbarui",
  ACCOUNT_PASSWORD_CHANGED: "Kata sandi diubah",
  ACCOUNT_SESSION_REVOKED: "Sesi dicabut",
};
const dateLabel = (value: string) =>
  new Date(value).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
export function ServerAdminPage({ initialTab = 'akun' }: {initialTab?: 'akun' | 'riwayat'}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [tab, setTab] = useState<string>(initialTab);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [cursors, setCursors] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [agencies, setAgencies] = useState<AgencyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [editing, setEditing] = useState<ManagedAccount | null>(null);
  const cursor = cursors.at(-1);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setEditing(null);
    const load = async () => {
      try {
        if (tab === "akun") {
          const [page, options] = await Promise.all([
            adminApi.users(query, cursor),
            adminApi.agencies(),
          ]);
          if (active) {
            setAccounts(page.items);
            setAgencies(options);
            setNextCursor(page.next_cursor);
          }
        } else {
          const page = await adminApi.audit(query, cursor);
          if (active) {
            setAudit(page.items);
            setNextCursor(page.next_cursor);
          }
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Data belum dapat dimuat.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [tab, query, cursor, attempt]);
  const changeTab = (value: string) => {
    navigate(value === 'akun' ? '/admin/petugas' : '/admin/aktivitas');
    setTab(value);
    setQuery("");
    setSearch("");
    setCursors([]);
  };
  return (
    <WorkspaceLayout title="Pengelolaan akun">
      <WorkspaceTabs
        prefix="server-admin"
        label="Pengelolaan"
        value={tab}
        onChange={changeTab}
        items={[
          { value: "akun", label: "Akun" },
          { value: "riwayat", label: "Riwayat perubahan" },
        ]}
      />
      <section
        id="server-admin-panel"
        role="tabpanel"
        aria-labelledby={"server-admin-tab-" + tab}
        className="plain-panel"
      >
        <form
          className="flex flex-wrap items-end gap-3 mb-5"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(search.trim());
            setCursors([]);
            setAttempt((value) => value + 1);
          }}
        >
          <div className="form-field flex-1 min-w-0">
            <label htmlFor="admin-search">
              {tab === "akun" ? "Cari nama atau email" : "Cari jenis perubahan"}
            </label>
            <input
              id="admin-search"
              type="search"
              maxLength={160}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="button-secondary" disabled={loading}>
            Cari
          </button>
        </form>
        {loading ? (
          <p role="status">Memuat {tab === "akun" ? "akun" : "riwayat"}…</p>
        ) : error ? (
          <div role="alert">
            <p className="form-error">{error}</p>
            <button
              type="button"
              className="button-secondary mt-3"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            {tab === "akun" ? (
              <>
                {editing && (
                  <AccessForm
                    key={editing.id}
                    account={editing}
                    agencies={agencies}
                    onCancel={() => setEditing(null)}
                    onSaved={() => {
                      setEditing(null);
                      setAttempt((value) => value + 1);
                      showToast(
                        "Akses diperbarui. Akun tersebut perlu masuk kembali.",
                      );
                    }}
                  />
                )}
                {accounts.length ? (
                  <>
                    <ul
                      className="grid gap-5 sm:hidden"
                      aria-label="Akun terdaftar di server"
                    >
                      {accounts.map((account) => (
                        <li
                          key={account.id}
                          className="border-b border-slate-200 pb-5 last:border-0 min-w-0"
                        >
                          <h2 className="font-semibold break-words">
                            {account.display_name}
                          </h2>
                          <p className="text-sm text-slate-600 break-all mt-1">
                            {account.email}
                          </p>
                          <p className="text-sm mt-3">
                            {account.roles
                              .map((role) => roleNames[role.code] || role.code)
                              .join(", ")}{" "}
                            ·{" "}
                            {account.status === "ACTIVE"
                              ? "Aktif"
                              : account.status === "SUSPENDED"
                                ? "Dinonaktifkan"
                                : "Tidak tersedia"}
                          </p>
                          {account.roles
                            .filter((role) => role.agency)
                            .map((role) => (
                              <p
                                key={role.agency!.id}
                                className="text-sm text-slate-600 break-words"
                              >
                                {role.agency!.name}
                              </p>
                            ))}
                          {account.id === user?.id ? (
                            <p className="field-hint mt-2">Akun Anda</p>
                          ) : account.roles.some(
                              (role) => role.code === "admin",
                            ) ? (
                            <p className="field-hint mt-2">Pengelola sistem</p>
                          ) : (
                            ["ACTIVE", "SUSPENDED"].includes(
                              account.status,
                            ) && (
                              <button
                                type="button"
                                className="text-link min-h-[44px] mt-2"
                                aria-label={
                                  "Ubah akses " + account.display_name
                                }
                                onClick={() => setEditing(account)}
                              >
                                Ubah akses
                              </button>
                            )
                          )}
                        </li>
                      ))}
                    </ul>
                    <div className="table-scroll hidden sm:block">
                      <table className="management-table">
                        <caption className="sr-only">
                          Akun terdaftar di server
                        </caption>
                        <thead>
                          <tr>
                            <th scope="col">Akun</th>
                            <th scope="col">Peran</th>
                            <th scope="col">Status</th>
                            <th scope="col">Tindakan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {accounts.map((account) => (
                            <tr key={account.id}>
                              <td>
                                <strong>{account.display_name}</strong>
                                <br />
                                {account.email}
                              </td>
                              <td>
                                {account.roles.map((role) => (
                                  <div
                                    key={role.code + (role.agency?.id || "")}
                                  >
                                    {roleNames[role.code] || role.code}
                                    {role.agency && (
                                      <small className="block">
                                        {role.agency.name}
                                      </small>
                                    )}
                                  </div>
                                ))}
                              </td>
                              <td>
                                {account.status === "ACTIVE"
                                  ? "Aktif"
                                  : account.status === "SUSPENDED"
                                    ? "Dinonaktifkan"
                                    : "Tidak tersedia"}
                              </td>
                              <td>
                                {account.id === user?.id ? (
                                  "Akun Anda"
                                ) : account.roles.some(
                                    (role) => role.code === "admin",
                                  ) ? (
                                  "Pengelola sistem"
                                ) : ["ACTIVE", "SUSPENDED"].includes(
                                    account.status,
                                  ) ? (
                                  <button
                                    type="button"
                                    className="text-link min-h-[44px]"
                                    aria-label={
                                      "Ubah akses " + account.display_name
                                    }
                                    onClick={() => setEditing(account)}
                                  >
                                    Ubah akses
                                  </button>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <p>Akun tidak ditemukan.</p>
                )}
              </>
            ) : audit.length ? (
              <ol className="case-history">
                {audit.map((entry) => (
                  <li key={entry.id}>
                    <p>{actionNames[entry.action] || entry.action}</p>
                    <small>
                      {entry.actor?.displayName || "Sistem"} ·{" "}
                      {dateLabel(entry.createdAt)}
                    </small>
                    <details className="mt-2">
                      <summary className="text-link cursor-pointer">
                        Rincian perubahan
                      </summary>
                      <p className="field-hint break-all">
                        Objek: {entry.objectType} · {entry.objectId}
                        <br />
                        Hasil: {entry.outcome}
                      </p>
                    </details>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Belum ada perubahan yang tercatat.</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
              <button
                type="button"
                className="button-secondary"
                disabled={!cursors.length}
                onClick={() => setCursors((items) => items.slice(0, -1))}
              >
                Sebelumnya
              </button>
              <span className="text-sm">Halaman {cursors.length + 1}</span>
              <button
                type="button"
                className="button-secondary"
                disabled={!nextCursor}
                onClick={() =>
                  nextCursor && setCursors((items) => [...items, nextCursor])
                }
              >
                Berikutnya
              </button>
            </div>
          </>
        )}
      </section>
    </WorkspaceLayout>
  );
}

function AccessForm({
  account,
  agencies,
  onCancel,
  onSaved,
}: {
  account: ManagedAccount;
  agencies: AgencyOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<"citizen" | "officer">(
    account.roles.some((value) => value.code === "officer")
      ? "officer"
      : "citizen",
  );
  const [status, setStatus] = useState<"ACTIVE" | "SUSPENDED">(
    account.status === "ACTIVE" ? "ACTIVE" : "SUSPENDED",
  );
  const [agency, setAgency] = useState(
    account.roles.find((value) => value.code === "officer")?.agency?.id || "",
  );
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    if (!password) {
      setError("Masukkan kata sandi admin untuk mengonfirmasi.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminApi.changeAccess(account.id, {
        role,
        status,
        ...(role === "officer" ? { agency_id: agency } : {}),
        expected_updated_at: account.updated_at,
        current_password: password,
      });
      setPassword("");
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Akses belum diperbarui.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <form
      onSubmit={submit}
      className="auth-form border border-slate-300 rounded-lg p-5 mb-6 max-w-2xl"
      aria-label={"Ubah akses " + account.display_name}
    >
      <h2 className="panel-title">Akses {account.display_name}</h2>
      <p className="field-hint">
        Perubahan mengakhiri semua sesi akun ini. Petugas hanya boleh menangani
        layanan pada instansi yang ditugaskan.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <fieldset disabled={busy} className="grid gap-4">
        <legend className="sr-only">Akses akun</legend>
        <div className="form-field">
          <label htmlFor="access-role">Peran</label>
          <select
            id="access-role"
            value={role}
            onChange={(event) => setRole(event.target.value as typeof role)}
          >
            <option value="citizen">Warga</option>
            <option value="officer">Petugas</option>
          </select>
        </div>
        {role === "officer" && (
          <div className="form-field">
            <label htmlFor="access-agency">Instansi penugasan</label>
            <select
              id="access-agency"
              required
              value={agency}
              onChange={(event) => setAgency(event.target.value)}
            >
              <option value="">Pilih instansi</option>
              {agencies.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.region.name}
                </option>
              ))}
            </select>
            {!agencies.length && (
              <p className="field-hint">
                Belum ada instansi aktif. Pengelola sistem perlu menyiapkan
                instansi sebelum memberikan akses petugas.
              </p>
            )}
          </div>
        )}
        <div className="form-field">
          <label htmlFor="access-status">Status akun</label>
          <select
            id="access-status"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Dinonaktifkan</option>
          </select>
        </div>
        <PasswordField
          id="access-password"
          label="Kata sandi admin"
          value={password}
          onChange={setPassword}
        />
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="button-primary" disabled={busy}>
          {busy ? "Menyimpan…" : "Simpan akses"}
        </button>
        <button
          type="button"
          className="button-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Batal
        </button>
      </div>
    </form>
  );
}
