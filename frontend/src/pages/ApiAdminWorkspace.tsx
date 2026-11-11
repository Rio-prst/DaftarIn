import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import {
  serverRequest as request,
  serverList,
  useServerResource,
  useServerAction,
} from "../api/workspace";
import { ServerAdminPage } from "./ServerAdminPage";
import { HelpPage } from "./HelpPage";

type Service = {
  id: string;
  name: string;
  summary?: string;
  publication_status: string;
  availability?: string;
  latest_guide_version?: number;
  region: { id: string; name: string };
  agency: { id: string; name: string };
};
type Version = {
  id: string;
  version_number: number;
  status: string;
  reviewed_at?: string;
  procedure_steps: { step: number; title: string; description: string }[];
};
type Review = {
  id: string;
  internal_reference: string;
  review_status: string;
  version: number;
  service: { name: string };
  citizen: { name: string };
  officer_user_id?: string;
  escalations?: { id: string; reason: string }[];
};
type Officer = { id: string; name: string; status: string };
const readForm = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return new FormData(event.currentTarget);
};
const value = (form: FormData, key: string) =>
  String(form.get(key) || "").trim();
function TextField({
  name,
  title,
  required = true,
  area = false,
}: {
  name: string;
  title: string;
  required?: boolean;
  area?: boolean;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{title}</label>
      {area ? (
        <textarea
          id={name}
          name={name}
          rows={4}
          required={required}
          maxLength={2000}
        />
      ) : (
        <input id={name} name={name} required={required} maxLength={500} />
      )}
    </div>
  );
}

export function ApiAdminWorkspace() {
  const { pathname } = useLocation();
  if (pathname === "/admin/bantuan") return <HelpPage />;
  if (pathname === "/admin/akun") return <ServerAdminPage initialTab="akun" />;
  if (pathname === "/admin/aktivitas")
    return <ServerAdminPage initialTab="riwayat" />;
  if (pathname === "/admin/petugas") return <ApiAssignments />;
  return <ApiGuides overview={pathname === "/admin"} />;
}

function ApiAssignments() {
  const reviews = useServerResource("admin-reviews", () =>
    serverList<Review>("/admin/reviews"),
  );
  const officers = useServerResource("admin-officers", () =>
    serverList<Officer>("/admin/officers"),
  );
  const action = useServerAction(reviews.refresh);
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const visibleReviews = reviews.data?.filter((item) =>
    [item.internal_reference, item.citizen.name, item.service.name]
      .join(" ")
      .toLowerCase()
      .includes(search),
  );
  return (
    <WorkspaceLayout title="Petugas & penugasan">
      <Link className="button-secondary my-4" to="/admin/akun">
        Kelola akun dan akses petugas
      </Link>
      {(reviews.error || officers.error || action.error) && (
        <p className="form-error" role="alert">
          {reviews.error || officers.error || action.error}
        </p>
      )}
      {action.notice && <p role="status">{action.notice}</p>}
      <div className="form-field">
        <label htmlFor="assignment-query">Cari warga atau referensi</label>
        <input
          id="assignment-query"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {reviews.loading && !reviews.data && <p role="status">Memuat penugasan…</p>}
      {visibleReviews?.map((item) => (
          <form
            key={item.id + ":" + item.version}
            className="plain-panel auth-form my-4"
            onSubmit={(event) => {
              const form = readForm(event);
              void action.run(async () => {
                await request("/admin/assignments", {
                  method: "POST",
                  body: {
                    application_id: item.id,
                    officer_user_id: value(form, "officer-" + item.id),
                    reason: value(form, "reason-" + item.id),
                    expected_version: item.version,
                  },
                });
              });
            }}
          >
            <h2>{item.service.name}</h2>
            <p>
              {item.citizen.name} · {item.internal_reference}
            </p>
            <p>{item.review_status.replace(/_/g, " ")}</p>
            {item.escalations?.map((escalation) => (
              <div key={escalation.id} className="plain-panel">
                <p>Klarifikasi: {escalation.reason}</p>
                <label htmlFor={"resolve-" + escalation.id}>
                  Jawaban admin
                </label>
                <textarea
                  id={"resolve-" + escalation.id}
                  name={"resolve-" + escalation.id}
                  minLength={5}
                />
                <button
                  type="button"
                  className="button-secondary"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      const input = document.getElementById(
                        "resolve-" + escalation.id,
                      ) as HTMLTextAreaElement;
                      if (input.value.trim().length < 5)
                        throw new Error("Jawaban minimal 5 karakter.");
                      await request(
                        `/admin/escalations/${escalation.id}/resolve`,
                        {
                          method: "POST",
                          body: { resolution_note: input.value.trim() },
                        },
                      );
                    })
                  }
                >
                  Kirim jawaban klarifikasi
                </button>
              </div>
            ))}
            <div className="form-field">
              <label htmlFor={"officer-" + item.id}>
                Petugas yang ditugaskan
              </label>
              <select
                id={"officer-" + item.id}
                name={"officer-" + item.id}
                required
                defaultValue={item.officer_user_id || ""}
              >
                <option value="">Pilih petugas</option>
                {officers.data
                  ?.filter((person) => person.status === "active")
                  .map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
              </select>
            </div>
            <TextField
              name={"reason-" + item.id}
              title="Alasan penugasan / pemindahan"
              area
            />
            <button
              className="button-primary"
              disabled={
                action.busy ||
                ["withdrawn", "review_completed"].includes(item.review_status)
              }
            >
              Simpan penugasan
            </button>
          </form>
        ))}
      {search && Boolean(reviews.data?.length) && visibleReviews?.length === 0 && (
        <div className="plain-panel mt-5">
          <p role="status">Tidak ada penugasan yang cocok dengan pencarian.</p>
          <button type="button" className="text-link mt-2" onClick={() => setQuery("")}>
            Hapus pencarian
          </button>
        </div>
      )}
      {!reviews.loading && !reviews.error && !reviews.data?.length && (
        <p className="plain-panel mt-5">
          Belum ada permintaan tinjauan. Warga perlu mengirim terlebih dahulu.
        </p>
      )}
    </WorkspaceLayout>
  );
}

function ApiGuides({ overview }: { overview: boolean }) {
  const services = useServerResource("admin-services", () =>
    serverList<Service>("/admin/services"),
  );
  const [selected, setSelected] = useState("");
  const versions = useServerResource("guide-versions:" + selected, () =>
    selected
      ? request<Version[]>(`/admin/services/${selected}/versions`)
      : Promise.resolve([]),
  );
  const sources = useServerResource("guide-sources:" + selected, () =>
    selected
      ? request<{ sources: { id: string; title: string; url: string }[] }>(
          `/services/${selected}/sources`,
        )
      : Promise.resolve({ sources: [] }),
  );
  const action = useServerAction(() => {
    services.refresh();
    versions.refresh();
    sources.refresh();
  });
  const [restoredSteps, setRestoredSteps] = useState<string | undefined>();
  return (
    <WorkspaceLayout
      title={
        overview ? "Ringkasan operasional" : "Layanan, sumber & versi panduan"
      }
    >
      {overview && (
        <div className="flex flex-wrap gap-3 my-5">
          <Link className="button-primary" to="/admin/petugas">
            Buka penugasan
          </Link>
          <Link className="button-secondary" to="/admin/bantuan">
            Permintaan bantuan
          </Link>
          <Link className="button-secondary" to="/admin/aktivitas">
            Riwayat aktivitas
          </Link>
        </div>
      )}
      {(services.error || versions.error || sources.error || action.error) && (
        <p role="alert" className="form-error my-4">
          {services.error || versions.error || sources.error || action.error}
        </p>
      )}
      {action.notice && (
        <p role="status" className="plain-panel my-4">
          {action.notice}
        </p>
      )}
      {services.loading && <p role="status">Memuat layanan…</p>}
      <div className="form-field my-5">
        <label htmlFor="admin-service">Layanan yang dikelola</label>
        <select
          id="admin-service"
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setRestoredSteps(undefined);
          }}
        >
          <option value="">Pilih layanan</option>
          {services.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} · {item.region.name}
            </option>
          ))}
        </select>
      </div>
      {selected && (
        <>
          <section className="plain-panel my-5">
            <h2>Sumber panduan</h2>
            {sources.loading && <p>Memuat sumber…</p>}
            {sources.data?.sources.map((item, index) => (
              <p className="py-2" key={item.id || index}>
                {/^https?:\/\//.test(item.url) ? (
                  <a
                    className="text-link"
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </p>
            ))}
            {!sources.loading && !sources.data?.sources.length && (
              <p>
                Belum ada sumber yang dapat ditampilkan. Jangan menerbitkan
                panduan sebelum rujukan diperiksa.
              </p>
            )}
          </section>
          <form
            className="plain-panel auth-form my-5"
            key={selected + ":" + restoredSteps}
            onSubmit={(event) => {
              const form = readForm(event);
              void action.run(async () => {
                const steps = value(form, "guide-steps")
                  .split("\n")
                  .filter(Boolean)
                  .map((description, index) => ({
                    step: index + 1,
                    title: "Langkah " + (index + 1),
                    description,
                  }));
                await request(`/admin/services/${selected}/guide-versions`, {
                  method: "POST",
                  body: {
                    summary: value(form, "guide-summary"),
                    procedure_steps: steps,
                  },
                });
                setRestoredSteps(undefined);
              });
            }}
          >
            <h2>Buat draf versi panduan</h2>
            <TextField name="guide-summary" title="Ringkasan perubahan" area />
            <div className="form-field">
              <label htmlFor="guide-steps">
                Langkah prosedur (satu langkah per baris)
              </label>
              <textarea
                id="guide-steps"
                name="guide-steps"
                rows={6}
                required
                defaultValue={restoredSteps}
                maxLength={10000}
              />
            </div>
            <button className="button-primary" disabled={action.busy}>
              Simpan draf versi baru
            </button>
          </form>
          <section className="plain-panel my-5">
            <h2>Riwayat versi</h2>
            {versions.loading && <p>Memuat versi…</p>}
            {versions.data?.map((item) => (
              <article className="border-t py-4" key={item.id}>
                <h3 className="font-semibold">
                  Versi {item.version_number} · {item.status}
                </h3>
                <ol>
                  {Array.isArray(item.procedure_steps) &&
                    item.procedure_steps.map((step, index) => (
                      <li key={index}>
                        {step.step}. {step.title}: {step.description}
                      </li>
                    ))}
                </ol>
                <button
                  className="text-link min-h-[44px]"
                  onClick={() =>
                    setRestoredSteps(
                      item.procedure_steps
                        .map((step) => step.description)
                        .join("\n"),
                    )
                  }
                >
                  Gunakan isi ini sebagai draf baru
                </button>
                {item.status === "draft" && (
                  <form
                    className="auth-form mt-4"
                    onSubmit={(event) => {
                      const form = readForm(event);
                      void action.run(async () => {
                        await request(
                          `/admin/guide-versions/${item.id}/publish`,
                          {
                            method: "POST",
                            body: {
                              confirm_sources_reviewed: true,
                              change_summary: value(
                                form,
                                "publish-note-" + item.id,
                              ),
                              expected_version: item.version_number,
                            },
                          },
                        );
                      });
                    }}
                  >
                    <TextField
                      name={"publish-note-" + item.id}
                      title="Catatan penerbitan dan pemeriksaan sumber"
                      area
                    />
                    <label className="consent-field">
                      <input type="checkbox" required />
                      <span>
                        Saya telah memeriksa sumber dan menyetujui penerbitan
                        versi ini.
                      </span>
                    </label>
                    <button className="button-primary" disabled={action.busy}>
                      Terbitkan panduan
                    </button>
                  </form>
                )}
              </article>
            ))}
          </section>
          <form
            className="plain-panel auth-form my-5"
            onSubmit={(event) => {
              const form = readForm(event);
              const intent = String(
                (event.nativeEvent as SubmitEvent).submitter?.getAttribute(
                  "value",
                ) || "pause",
              );
              void action.run(async () => {
                await request(`/admin/services/${selected}/${intent}`, {
                  method: "POST",
                  body:
                    intent === "pause"
                      ? { reason: value(form, "pause-reason") }
                      : {},
                });
              });
            }}
          >
            <h2>Ketersediaan layanan</h2>
            <TextField
              name="pause-reason"
              title="Alasan jeda (wajib untuk menjeda)"
              area
              required={false}
            />
            <div className="flex flex-wrap gap-3">
              <button
                name="intent"
                value="pause"
                className="button-secondary"
                disabled={action.busy}
              >
                Jeda layanan
              </button>
              <button
                name="intent"
                value="resume"
                className="button-primary"
                disabled={action.busy}
              >
                Aktifkan kembali
              </button>
            </div>
          </form>
        </>
      )}
    </WorkspaceLayout>
  );
}
