import { useState, type FormEvent } from "react";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { PasswordField } from "../components/PasswordField";
import {
  useApp,
  readStored,
  type ServiceDetail,
  type AdminRule,
} from "../context/AppContext";
import { mockAuth, roleLabels } from "../auth/mockAuth";
import type { Account } from "../auth/types";
type Draft = { service: ServiceDetail; savedAt: string };
type Audit = { id: string; message: string; by: string; time: string };
type ServiceVersion = { service: ServiceDetail; preservedAt: string };
export function AdminPage() {
  const { services, user, adminRules, toggleRuleActive, addAdminRule } =
    useApp();
  const [tab, setTab] = useState("layanan");
  const [selectedId, setSelectedId] = useState(services[0].id);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<number, Draft>>(() =>
    readStored("daftarin:guide-drafts:v1", {}),
  );
  const [versions, setVersions] = useState<ServiceVersion[]>(() =>
    readStored("daftarin:guide-versions:v1", []),
  );
  const [audit, setAudit] = useState<Audit[]>(() =>
    readStored("daftarin:audit:v1", []),
  );
  const [accounts, setAccounts] = useState<Account[]>(() =>
    mockAuth.listAccounts(),
  );
  const [showCreate, setShowCreate] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [error, setError] = useState("");
  const log = (message: string) => {
    const next = [
      {
        id: crypto.randomUUID(),
        message,
        by: user.name,
        time: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      },
      ...audit,
    ];
    setAudit(next);
    try {
      localStorage.setItem("daftarin:audit:v1", JSON.stringify(next));
    } catch {
      setError(
        "Riwayat perubahan belum tersimpan. Periksa ruang penyimpanan browser.",
      );
    }
  };
  const saveDraft = (service: ServiceDetail) => {
    const next = {
      ...drafts,
      [service.id]: {
        service,
        savedAt: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
      },
    };
    try {
      localStorage.setItem("daftarin:guide-drafts:v1", JSON.stringify(next));
      setDrafts(next);
      log("Draf panduan disimpan: " + service.name);
      return true;
    } catch {
      setError("Draf belum tersimpan. Periksa ruang penyimpanan browser.");
      return false;
    }
  };
  const clearDraft = (id: number) => {
    const next = { ...drafts };
    delete next[id];
    setDrafts(next);
    try {
      localStorage.setItem("daftarin:guide-drafts:v1", JSON.stringify(next));
    } catch {
      setError("Keterangan draf belum diperbarui.");
    }
  };
  const selected =
    services.find((service) => service.id === selectedId) || services[0];
  const filtered = services.filter((service) =>
    (service.name + " " + service.category)
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  return (
    <WorkspaceLayout title="Kelola layanan">
      <div className="workspace-tabs" role="tablist" aria-label="Pengelolaan">
        {[
          ["layanan", "Panduan layanan"],
          ["aturan", "Aturan pemeriksaan"],
          ["akun", "Akun"],
          ["riwayat", "Riwayat perubahan"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            id={"admin-tab-" + key}
            role="tab"
            aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1}
            onKeyDown={(event) => {
              const keys = ["layanan", "aturan", "akun", "riwayat"];
              const index = keys.indexOf(key);
              const next =
                event.key === "ArrowRight"
                  ? keys[(index + 1) % keys.length]
                  : event.key === "ArrowLeft"
                    ? keys[(index + keys.length - 1) % keys.length]
                    : event.key === "Home"
                      ? keys[0]
                      : event.key === "End"
                        ? keys[keys.length - 1]
                        : null;
              if (next) {
                event.preventDefault();
                setTab(next);
                setError("");
                document.getElementById("admin-tab-" + next)?.focus();
              }
            }}
            aria-controls="admin-panel"
            onClick={() => {
              setTab(key);
              setError("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error mb-5" role="alert">
          {error}
        </p>
      )}
      <div
        id="admin-panel"
        role="tabpanel"
        aria-labelledby={"admin-tab-" + tab}
      >
        {tab === "layanan" && (
          <div className="admin-editor-grid">
            <section className="plain-panel service-index">
              <div className="form-field">
                <label htmlFor="admin-service-search">Cari layanan</label>
                <input
                  id="admin-service-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="service-index-list">
                {filtered.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedId(service.id)}
                    aria-pressed={service.id === selected.id}
                  >
                    <strong>{service.name}</strong>
                    <small>
                      {drafts[service.id]
                        ? "Draf tersimpan"
                        : "Versi " + (service.version || 1)}
                    </small>
                  </button>
                ))}
                {!filtered.length && (
                  <p className="field-hint">Layanan tidak ditemukan.</p>
                )}
              </div>
            </section>
            <GuideEditor
              key={selected.id}
              service={selected}
              draft={drafts[selected.id]}
              versions={versions.filter(
                (item) => item.service.id === selected.id,
              )}
              onSave={saveDraft}
              onPublished={(service) => {
                const next = [
                  { service: selected, preservedAt: new Date().toISOString() },
                  ...versions,
                ];
                setVersions(next);
                try {
                  localStorage.setItem(
                    "daftarin:guide-versions:v1",
                    JSON.stringify(next),
                  );
                } catch {
                  setError("Versi sebelumnya belum tersimpan.");
                }
                clearDraft(service.id);
                log(
                  "Panduan diterbitkan: " +
                    service.name +
                    " · versi " +
                    service.version,
                );
              }}
            />
          </div>
        )}
        {tab === "aturan" && (
          <section className="plain-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Aturan pemeriksaan</h2>
                <p className="field-hint">
                  Aturan disimpan sebagai acuan. Mesin pemeriksaan AI belum
                  terhubung.
                </p>
              </div>
              <button
                className="button-secondary"
                onClick={() => setShowRule(!showRule)}
              >
                {showRule ? "Tutup formulir" : "Tambah aturan"}
              </button>
            </div>
            {showRule && (
              <RuleForm
                services={services}
                onSubmit={(rule) => {
                  addAdminRule(rule);
                  log("Aturan ditambahkan: " + rule.rule);
                  setShowRule(false);
                }}
              />
            )}
            <div
              className="table-scroll"
              role="region"
              aria-label="Tabel pengelolaan"
              tabIndex={0}
            >
              <table className="management-table">
                <thead>
                  <tr>
                    <th scope="col">Aturan</th>
                    <th scope="col">Layanan</th>
                    <th scope="col">Tindak lanjut</th>
                    <th scope="col">Digunakan</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <strong>{rule.rule}</strong>
                        <small>{rule.category}</small>
                      </td>
                      <td>{rule.service}</td>
                      <td>
                        {rule.severity === "Kritis"
                          ? "Perlu diperbaiki"
                          : rule.severity === "Peringatan"
                            ? "Perlu ditinjau"
                            : "Saran"}
                      </td>
                      <td>
                        <label className="rule-toggle">
                          <input
                            type="checkbox"
                            checked={rule.active}
                            onChange={() => {
                              toggleRuleActive(rule.id);
                              log(
                                (rule.active
                                  ? "Aturan dinonaktifkan: "
                                  : "Aturan diaktifkan: ") + rule.rule,
                              );
                            }}
                          />
                          <span>{rule.active ? "Ya" : "Tidak"}</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {tab === "akun" && (
          <section className="plain-panel">
            <div className="panel-heading">
              <h2 className="panel-title">Akun pengguna</h2>
              <button
                className="button-secondary"
                onClick={() => setShowCreate(!showCreate)}
              >
                {showCreate ? "Tutup formulir" : "Tambah petugas"}
              </button>
            </div>
            {showCreate && (
              <OfficerAccountForm
                onCreated={(account) => {
                  setAccounts((previous) => [...previous, account]);
                  setShowCreate(false);
                  log("Akun petugas dibuat: " + account.email);
                }}
              />
            )}
            <div
              className="table-scroll"
              role="region"
              aria-label="Tabel pengelolaan"
              tabIndex={0}
            >
              <table className="management-table">
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Email</th>
                    <th scope="col">Peran</th>
                    <th scope="col">Akses petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{roleLabels[account.role]}</td>
                      <td>
                        {account.role === "petugas" ? (
                          <button
                            type="button"
                            className="text-link"
                            aria-label={
                              (account.active === false
                                ? "Aktifkan "
                                : "Nonaktifkan ") + account.name
                            }
                            onClick={() => {
                              try {
                                mockAuth.setOfficerActive(
                                  account.id,
                                  account.active === false,
                                );
                                setAccounts(mockAuth.listAccounts());
                                log(
                                  (account.active === false
                                    ? "Akun petugas diaktifkan: "
                                    : "Akun petugas dinonaktifkan: ") +
                                    account.email,
                                );
                              } catch (cause) {
                                setError(
                                  cause instanceof Error
                                    ? cause.message
                                    : "Akses belum berhasil diperbarui.",
                                );
                              }
                            }}
                          >
                            {account.active === false
                              ? "Aktifkan"
                              : "Nonaktifkan"}
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
          </section>
        )}
        {tab === "riwayat" && (
          <section className="plain-panel">
            <h2 className="panel-title">Riwayat perubahan</h2>
            {audit.length ? (
              <ol className="case-history">
                {audit.map((entry) => (
                  <li key={entry.id}>
                    <p>{entry.message}</p>
                    <small>
                      {entry.by} · {entry.time}
                    </small>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="empty-state">
                <p>
                  Perubahan panduan, aturan, dan akun petugas akan dicatat di
                  sini.
                </p>
              </div>
            )}
          </section>
        )}
      </div>
    </WorkspaceLayout>
  );
}
function GuideEditor({
  service,
  draft,
  versions,
  onSave,
  onPublished,
}: {
  service: ServiceDetail;
  draft?: Draft;
  versions: ServiceVersion[];
  onSave: (service: ServiceDetail) => boolean;
  onPublished: (service: ServiceDetail) => void;
}) {
  const { saveService, showToast } = useApp();
  const [form, setForm] = useState(draft?.service || service);
  const [requirements, setRequirements] = useState(
    (draft?.service || service).requirements.join("\n"),
  );
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(draft?.savedAt || "");
  const update = (key: keyof ServiceDetail, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setSavedAt("");
  };
  const readForm = (): ServiceDetail => ({
    ...form,
    name: form.name.trim(),
    description: form.description.trim(),
    agency: form.agency.trim(),
    source_url: form.source_url?.trim(),
    requirements: requirements
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  });
  const validate = (next: ServiceDetail, publish: boolean) => {
    if (
      !next.name ||
      !next.description ||
      !next.agency ||
      !next.requirements.length
    )
      return "Lengkapi nama layanan, deskripsi, instansi, dan setidaknya satu persyaratan.";
    if (publish) {
      try {
        const url = new URL(next.source_url || "");
        if (url.protocol !== "https:")
          return "Gunakan tautan sumber dengan https.";
      } catch {
        return "Tambahkan tautan sumber yang benar sebelum menerbitkan.";
      }
    }
    return "";
  };
  const save = () => {
    const next = readForm();
    const message = validate(next, false);
    setError(message);
    if (message) return;
    if (onSave(next)) {
      setSavedAt(
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      );
      showToast("Draf panduan disimpan.");
    }
  };
  const publish = (event: FormEvent) => {
    event.preventDefault();
    const next = readForm();
    const message = validate(next, true);
    setError(message);
    if (message) return;
    const published = {
      ...next,
      version: (service.version || 1) + 1,
      published_at: new Date().toISOString(),
    };
    saveService(published);
    onPublished(published);
    setSavedAt("");
  };
  return (
    <section className="plain-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Edit panduan</h2>
          <p className="field-hint">
            Versi terbit {service.version || 1}
            {savedAt ? " · Draf disimpan " + savedAt : ""}
          </p>
        </div>
      </div>
      <form className="auth-form" onSubmit={publish} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-field">
          <label htmlFor="guide-name">Nama layanan</label>
          <input
            id="guide-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-agency">Instansi</label>
          <input
            id="guide-agency"
            value={form.agency}
            onChange={(event) => update("agency", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-description">Deskripsi</label>
          <textarea
            id="guide-description"
            rows={3}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-requirements">Persyaratan</label>
          <textarea
            id="guide-requirements"
            rows={6}
            value={requirements}
            onChange={(event) => {
              setRequirements(event.target.value);
              setSavedAt("");
            }}
          />
          <p className="field-hint">
            Tulis satu persyaratan pada setiap baris.
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="guide-channel">Kanal layanan</label>
          <input
            id="guide-channel"
            value={form.official_channel}
            onChange={(event) => update("official_channel", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-source">Tautan sumber panduan</label>
          <input
            id="guide-source"
            type="url"
            placeholder="https://"
            value={form.source_url || ""}
            onChange={(event) => update("source_url", event.target.value)}
          />
          <p className="field-hint">
            Pastikan isi panduan sesuai sumber sebelum menerbitkan. Tautan tidak
            diperiksa otomatis.
          </p>
        </div>
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={save}>
            Simpan draf
          </button>
          <button type="submit" className="button-primary">
            Terbitkan panduan
          </button>
        </div>
      </form>
      {versions.length > 0 && (
        <details className="guide-version-history">
          <summary>Versi sebelumnya ({versions.length})</summary>
          {versions.map((item, index) => (
            <article key={item.preservedAt + "-" + index}>
              <h3>
                Versi {item.service.version || 1} · {item.service.name}
              </h3>
              <p>{item.service.description}</p>
              <ul>
                {item.service.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
              {item.service.source_url && (
                <a
                  className="text-link"
                  href={item.service.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sumber versi ini ↗
                </a>
              )}
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
function RuleForm({
  services,
  onSubmit,
}: {
  services: ServiceDetail[];
  onSubmit: (rule: Omit<AdminRule, "id">) => void;
}) {
  const [text, setText] = useState("");
  const [service, setService] = useState("Semua layanan");
  const [severity, setSeverity] = useState<AdminRule["severity"]>("Peringatan");
  const [error, setError] = useState("");
  return (
    <form
      className="inline-editor auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) {
          setError("Tuliskan aturan pemeriksaan.");
          return;
        }
        onSubmit({
          service,
          category: "Kelengkapan",
          rule: text.trim(),
          version: "v1",
          active: true,
          severity,
        });
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="new-rule">Aturan pemeriksaan</label>
        <textarea
          id="new-rule"
          value={text}
          rows={3}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="new-rule-service">Layanan</label>
          <select
            id="new-rule-service"
            value={service}
            onChange={(event) => setService(event.target.value)}
          >
            <option>Semua layanan</option>
            {services.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="new-rule-severity">Tindak lanjut</label>
          <select
            id="new-rule-severity"
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as AdminRule["severity"])
            }
          >
            <option value="Kritis">Perlu diperbaiki</option>
            <option value="Peringatan">Perlu ditinjau</option>
            <option value="Rekomendasi">Saran</option>
          </select>
        </div>
      </div>
      <div>
        <button className="button-primary">Simpan aturan</button>
      </div>
    </form>
  );
}
function OfficerAccountForm({
  onCreated,
}: {
  onCreated: (account: Account) => void;
}) {
  const { showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="inline-editor auth-form"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setBusy(true);
        try {
          const account = await mockAuth.createOfficer({
            name,
            email,
            password,
          });
          onCreated(account);
          showToast("Akun petugas dibuat.");
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Akun belum berhasil dibuat.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="officer-name">Nama petugas</label>
          <input
            id="officer-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="officer-email">Email petugas</label>
          <input
            id="officer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>
      <PasswordField
        id="officer-password"
        label="Kata sandi awal"
        autoComplete="new-password"
        hint="Minimal 8 karakter. Akun dibuat di browser ini dan belum menerima email undangan."
        value={password}
        onChange={setPassword}
      />
      <div>
        <button className="button-primary" disabled={busy}>
          {busy ? "Membuat akun…" : "Buat akun petugas"}
        </button>
      </div>
    </form>
  );
}
