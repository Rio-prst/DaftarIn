import { useFamilyMembers } from "../family/members";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import type { Finding, InspectionRun } from "../types/api";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import {
  serverRequest as request,
  serverList,
  uploadServerDocument,
  useServerResource,
  useServerAction,
} from "../api/workspace";
import { DEMO_HELPERS_ENABLED } from "../utils/demoHelpers";

type Named = { id: string; name: string };
type Service = Named & {
  slug: string;
  summary?: string;
  region: Named;
  agency: Named;
  category: Named;
  availability?: string;
};
type Answer = {
  question_id: string;
  question_key: string;
  label: string;
  value: string | number | boolean | string[];
};
type Question = {
  id: string;
  key: string;
  label: string;
  help_text?: string;
  type: string;
  required: boolean;
  options?: { value: string; label: string }[];
  visible_if?: Record<string, unknown>;
};
type FileRecord = {
  id: string;
  document_type: string;
  active_version: number;
  original_filename?: string;
  display_name?: string;
  version?: { mime_type: string; size_bytes: number; uploaded_at: string };
};
type Requirement = {
  requirement_id: string;
  code: string;
  name: string;
  description: string;
  required: boolean;
  fulfilled: boolean;
  document?: { id: string; version: number; filename: string };
};
type Prep = {
  id: string;
  internal_reference: string;
  owner_id: string;
  service_id: string;
  data_version: number;
  service: Named;
  region: Named;
  answers: Answer[];
  documents: FileRecord[];
  is_archived: boolean;
  status: string;
  readiness?: string;
  latest_inspection_id?: string | null;
  active_inspection_id?: string | null;
};
type Assessment = {
  item_type: "FORM_DATA" | "DOCUMENT";
  item_id: string;
  verdict: string;
  note: string;
};
type Snapshot = {
  id: string;
  application_id: string;
  preparation_id: string;
  version_number: number;
  submitted_at: string;
  service: Service;
  applicant: { display_name?: string; full_name?: string };
  answers: Answer[];
  documents: {
    document_version_id: string;
    document_type: string;
    original_filename: string;
    version_number: number;
  }[];
  required_slots?: Requirement[];
  reviews: {
    overall_notes?: string;
    review_status: string;
    assessments: {
      item_type: string;
      item_id: string;
      verdict: string;
      note: string;
    }[];
  }[];
};
type Application = {
  id: string;
  application_id?: string;
  internal_reference: string;
  official_application_number?: string;
  preparation_id?: string;
  current_status: string;
  review_status?: string;
  service: Named;
  agency: Named;
  submitted_at?: string;
  latest_event?: { note?: string };
  citizen?: { name: string };
  version?: number;
};
const statusName: Record<string, string> = {
  draft_preparation: "Catatan pengajuan instansi",
  submitted: "Menunggu tinjauan",
  in_review: "Sedang ditinjau",
  revision_requested: "Perlu perbaikan",
  review_completed: "Tinjauan selesai",
  withdrawn: "Tinjauan ditarik",
  citizen_recorded_unconfirmed: "Dicatat warga",
  needs_correction: "Perlu perbaikan",
  accepted: "Diterima",
  verification: "Sedang ditinjau",
  processing: "Sedang ditinjau",
  completed: "Selesai",
  result_received_by_citizen: "Hasil diterima warga",
};
const code = (value?: string) => value?.toLowerCase() || "";
const label = (value?: string) =>
  statusName[code(value)] || value || "Belum tersedia";
const formObject = (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  return new FormData(event.currentTarget);
};
const field = (form: FormData, name: string) =>
  String(form.get(name) || "").trim();
function Shell({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useAuth();
  return user ? (
    <WorkspaceLayout title={title}>{children}</WorkspaceLayout>
  ) : (
    <>
      <Navbar />
      <main
        id="main-content"
        tabIndex={-1}
        className="workspace-content max-w-6xl mx-auto"
      >
        <h1>{title}</h1>
        {children}
      </main>
      <Footer />
    </>
  );
}
function Feedback({ error, notice }: { error?: string; notice?: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="form-error my-4">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="plain-panel my-4">
          {notice}
        </p>
      )}
    </>
  );
}
function Loading({
  resource,
}: {
  resource: { loading: boolean; error: string; refresh: () => void };
}) {
  return (
    <>
      {resource.loading && (
        <p role="status" aria-live="polite">
          Memuat data…
        </p>
      )}
      {resource.error && (
        <div className="plain-panel">
          <p role="alert">{resource.error}</p>
          <button className="button-secondary mt-3" onClick={resource.refresh}>
            Coba lagi
          </button>
        </div>
      )}
    </>
  );
}
function Field({
  name,
  title,
  required = false,
  type = "text",
  defaultValue = "",
}: {
  name: string;
  title: string;
  required?: boolean;
  type?: string;
  defaultValue?: string;
}) {
  return (
    <div className="form-field">
      <label htmlFor={name}>{title}</label>
      {type === "textarea" ? (
        <textarea
          id={name}
          name={name}
          rows={3}
          required={required}
          defaultValue={defaultValue}
          maxLength={2000}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          maxLength={500}
        />
      )}
    </div>
  );
}

export function ApiCatalog() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("");
  const list = useServerResource("catalog", () =>
    serverList<Service>("/services"),
  );
  const selected = list.data?.find(
    (item) => item.id === params.id || item.slug === params.id,
  );
  const details = useServerResource(
    "guide:" + (selected?.id || "none"),
    async () =>
      selected
        ? request<{
            requirements: {
              id?: string;
              name?: string;
              title?: string;
              description?: string;
            }[];
            procedure_steps: { title: string; description: string }[];
            sources: { title: string; url: string }[];
            channels: { label: string; url?: string }[];
          }>(`/services/${selected.id}/guide`)
        : null,
  );
  const action = useServerAction();
  const start = () =>
    action.run(async () => {
      if (!selected) return;
      if (!user) {
        navigate(
          "/masuk?next=" + encodeURIComponent("/layanan/" + selected.id),
        );
        return;
      }
      if (user.role !== "warga")
        throw new Error("Gunakan akun warga untuk membuat persiapan.");
      const prep = await request<Prep>("/preparations", {
        method: "POST",
        body: {
          service_id: selected.id,
          region_id: selected.region.id,
          answers: [],
        },
      });
      navigate("/persiapan/kebutuhan?prep=" + prep.id);
    });
  if (params.id)
    return (
      <Shell title={selected?.name || "Panduan layanan"}>
        <Loading resource={list} />
        <Loading resource={details} />
        <Feedback {...action} />
        {!list.loading && !list.error && !selected && (
          <p>
            Layanan tidak ditemukan.{" "}
            <Link to="/katalog">Kembali ke katalog</Link>
          </p>
        )}
        {selected && (
          <>
            <p className="my-4">{selected.summary}</p>
            <p>
              {selected.agency.name} · {selected.region.name}
            </p>
            <section className="plain-panel mt-5">
              <h2>Persyaratan</h2>
              <ul>
                {details.data?.requirements.map((item, index) => (
                  <li className="py-3" key={item.id || index}>
                    <strong>{item.name || item.title}</strong>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section className="plain-panel mt-5">
              <h2>Langkah pengurusan</h2>
              <ol>
                {details.data?.procedure_steps.map((item, index) => (
                  <li className="py-3" key={index}>
                    <strong>
                      {index + 1}. {item.title}
                    </strong>
                    <p>{item.description}</p>
                  </li>
                ))}
              </ol>
            </section>
            <section className="plain-panel mt-5">
              <h2>Sumber panduan</h2>
              {details.data?.sources.map(
                (item, index) =>
                  /^https?:\/\//.test(item.url) && (
                    <p key={index}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        {item.title}
                      </a>
                    </p>
                  ),
              )}
            </section>
            <button
              disabled={action.busy || details.loading || !!details.error}
              className="button-primary mt-5"
              onClick={start}
            >
              Mulai persiapan
            </button>
          </>
        )}
      </Shell>
    );
  const rows = (list.data || []).filter(
    (item) =>
      (!region || item.region.id === region) &&
      [item.name, item.summary, item.category.name]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <Shell title="Cari layanan">
      <p className="my-4">
        Pilih wilayah dan layanan untuk membaca persyaratan sebelum menyiapkan
        berkas.
      </p>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="service-search">Cari layanan</label>
          <input
            id="service-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="service-region">Wilayah</label>
          <select
            id="service-region"
            value={region}
            onChange={(event) => setRegion(event.target.value)}
          >
            <option value="">Semua wilayah</option>
            {Array.from(
              new Map(
                (list.data || []).map((item) => [item.region.id, item.region]),
              ).values(),
            ).map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Loading resource={list} />
      <div className="grid gap-4 md:grid-cols-2 mt-5">
        {rows.map((item) => (
          <Link
            className="plain-panel block"
            to={"/layanan/" + item.id}
            key={item.id}
          >
            <p>
              {item.category.name} · {item.region.name}
            </p>
            <h2 className="panel-title mt-2">{item.name}</h2>
            <p className="mt-3">{item.summary}</p>
            <span className="text-link inline-block mt-4">Lihat panduan →</span>
          </Link>
        ))}
      </div>
      {!list.loading && !list.error && !rows.length && (
        <p className="plain-panel mt-5">
          Belum ada layanan yang sesuai. Ubah pencarian atau minta admin
          menyiapkan katalog.
        </p>
      )}
    </Shell>
  );
}

export function ApiCitizenHome() {
  const { pathname } = useLocation();
  const preps = useServerResource("my-preps", () =>
    serverList<Prep>("/preparations"),
  );
  const apps = useServerResource("my-apps", () =>
    serverList<Application>("/applications"),
  );
  const [filter, setFilter] = useState("active");
  const [query, setQuery] = useState("");
  const action = useServerAction(preps.refresh);
  const isTracking = pathname === "/pelacakan";
  const dashboard = pathname === "/dashboard";
  const prepRows = (preps.data || []).filter(
    (item) =>
      (filter === "archived"
        ? item.is_archived || code(item.status) === "archived"
        : !item.is_archived && code(item.status) !== "archived") &&
      [item.internal_reference, item.service.name]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const appRows = (apps.data || []).filter((item) => {
    const done =
      ["review_completed", "withdrawn"].includes(code(item.review_status)) ||
      ["completed", "result_received_by_citizen"].includes(
        code(item.current_status),
      );
    return (
      (filter === "all" || (filter === "done" ? done : !done)) &&
      [item.internal_reference, item.service.name]
        .join(" ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  return (
    <Shell
      title={
        dashboard
          ? "Persiapan dan pengajuanmu"
          : isTracking
            ? "Pengajuan saya"
            : "Persiapan saya"
      }
    >
      <Link className="button-primary my-4" to="/katalog">
        Pilih layanan
      </Link>
      <Feedback {...action} />
      {!dashboard && (
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="record-search">Cari layanan atau nomor</label>
            <input
              id="record-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="form-field">
            <label htmlFor="record-filter">Tampilkan</label>
            <select
              id="record-filter"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="active">Aktif</option>
              {isTracking ? (
                <>
                  <option value="done">Selesai / ditarik</option>
                  <option value="all">Semua</option>
                </>
              ) : (
                <option value="archived">Arsip</option>
              )}
            </select>
          </div>
        </div>
      )}
      {!isTracking && (
        <section className="mt-5">
          <h2>Persiapan berkas</h2>
          <Loading resource={preps} />
          {prepRows.map((item) => (
            <article className="plain-panel my-3" key={item.id}>
              <h3 className="font-semibold">{item.service.name}</h3>
              <p>{item.internal_reference}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Link
                  className="button-secondary"
                  to={"/persiapan/data?prep=" + item.id}
                >
                  Lanjutkan
                </Link>
                <button
                  disabled={action.busy}
                  className="button-secondary"
                  onClick={() =>
                    action.run(async () => {
                      await request(
                        `/preparations/${item.id}/${item.is_archived ? "restore" : "archive"}`,
                        { method: "POST", body: {} },
                      );
                    })
                  }
                >
                  {item.is_archived ? "Pulihkan" : "Arsipkan"}
                </button>
                <button
                  disabled={action.busy}
                  className="text-link"
                  onClick={() => {
                    if (
                      window.confirm(
                        "Hapus draf ini? Draf yang sudah dikirim mengikuti pembatasan server.",
                      )
                    )
                      void action.run(async () => {
                        await request(`/preparations/${item.id}`, {
                          method: "DELETE",
                        });
                      });
                  }}
                >
                  Hapus draf
                </button>
              </div>
            </article>
          ))}
          {!preps.loading && !preps.error && !prepRows.length && (
            <p className="plain-panel mt-3">
              Belum ada persiapan. Pilih layanan untuk mulai.
            </p>
          )}
        </section>
      )}
      {(dashboard || isTracking) && (
        <section className="mt-5">
          <h2>Perkembangan pengajuan</h2>
          <Loading resource={apps} />
          {appRows.map((item) => (
            <Link
              className="plain-panel block my-3"
              key={item.id}
              to={"/pelacakan/" + item.id}
            >
              <h3 className="font-semibold">{item.service.name}</h3>
              <p>{item.internal_reference}</p>
              <p>{label(item.review_status || item.current_status)}</p>
              <span className="text-link">Lihat detail →</span>
            </Link>
          ))}
          {!apps.loading && !apps.error && !appRows.length && (
            <p className="plain-panel mt-3">
              Belum ada pengajuan pada daftar ini.
            </p>
          )}
          <Link className="text-link" to="/pelacakan/catat">
            Sudah mengajukan di instansi? Catat pengajuan →
          </Link>
        </section>
      )}
    </Shell>
  );
}

function QuestionFields({
  questions,
  answers,
  setAnswers,
}: {
  questions: Question[];
  answers: Record<string, Answer["value"]>;
  setAnswers: (value: Record<string, Answer["value"]>) => void;
}) {
  return (
    <>
      {questions.map((question) => (
        <div className="form-field" key={question.id}>
          <label htmlFor={question.id}>
            {question.label}
            {question.required ? " *" : ""}
          </label>
          {question.options?.length ? (
            <select
              id={question.id}
              value={String(answers[question.id] ?? "")}
              required={question.required}
              onChange={(event) =>
                setAnswers({ ...answers, [question.id]: event.target.value })
              }
            >
              <option value="">Pilih jawaban</option>
              {question.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : question.type === "boolean" ? (
            <select
              id={question.id}
              value={String(answers[question.id] ?? "")}
              required={question.required}
              onChange={(event) =>
                setAnswers({
                  ...answers,
                  [question.id]: event.target.value === "true",
                })
              }
            >
              <option value="">Pilih jawaban</option>
              <option value="true">Ya</option>
              <option value="false">Tidak</option>
            </select>
          ) : (
            <input
              id={question.id}
              required={question.required}
              type={question.type === "number" ? "number" : "text"}
              maxLength={2000}
              value={String(answers[question.id] ?? "")}
              onChange={(event) =>
                setAnswers({
                  ...answers,
                  [question.id]:
                    question.type === "number"
                      ? Number(event.target.value)
                      : event.target.value,
                })
              }
            />
          )}
          {question.help_text && (
            <p className="field-hint">{question.help_text}</p>
          )}
        </div>
      ))}
    </>
  );
}

export function ApiPreparation() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const id = params.get("prep");
  const applicationId = params.get("application");
  const family = useFamilyMembers();
  const stage = pathname.endsWith("kebutuhan")
    ? 0
    : pathname.endsWith("data")
      ? 1
      : pathname.endsWith("dokumen")
        ? 2
        : pathname.endsWith("validasi")
          ? 3
          : 4;
  const resource = useServerResource("prep:" + id, async () => {
    if (!id) return null;
    const prep = await request<Prep>(`/preparations/${id}`);
    const [questions, requirements, docs] = await Promise.all([
      request<{ questions: Question[] }>(
        `/services/${prep.service_id}/questions`,
      ),
      request<{ requirements: Requirement[] }>(
        `/preparations/${id}/requirements`,
      ),
      request<FileRecord[]>(`/preparations/${id}/documents`),
    ]);
    let latestRun: InspectionRun | null = null;
    let findings: Finding[] = [];
    if (prep.latest_inspection_id) {
      try {
        latestRun = await request<InspectionRun>(
          `/preparations/${id}/inspections/${prep.latest_inspection_id}`,
        );
        const findingsRes = await request<{ data?: Finding[] } | Finding[]>(
          `/preparations/${id}/inspections/${prep.latest_inspection_id}/findings`,
        );
        findings = Array.isArray(findingsRes)
          ? findingsRes
          : findingsRes.data ?? [];
      } catch {
        // ignore if not found
      }
    }
    return {
      prep,
      questions: questions.questions,
      requirements: requirements.requirements,
      docs,
      latestRun,
      findings,
    };
  });
  const action = useServerAction(resource.refresh);
  const [answers, setAnswers] = useState<Record<string, Answer["value"]>>({});
  const [consent, setConsent] = useState(false);
  const [correctionValues, setCorrectionValues] = useState<
    Record<string, string>
  >({});
  useEffect(() => {
    if (resource.data) {
      setAnswers(
        Object.fromEntries(
          resource.data.prep.answers.map((answer) => [
            answer.question_id,
            answer.value,
          ]),
        ),
      );
      setConsent(false);
    }
  }, [resource.data]);
  const names = ["Kebutuhan", "Data", "Dokumen", "Validasi", "Tinjau & kirim"];
  const paths = ["kebutuhan", "data", "dokumen", "validasi", "ringkasan"];
  const link = (index: number) =>
    `/persiapan/${paths[index]}?prep=${id}${applicationId ? "&application=" + applicationId : ""}`;
  const save = async () => {
    if (!id || !resource.data) return;
    await request(`/preparations/${id}`, {
      method: "PATCH",
      body: {
        expected_data_version: resource.data.prep.data_version,
        answers: resource.data.questions
          .filter((q) => answers[q.id] !== undefined)
          .map((q) => ({ question_id: q.id, value: answers[q.id] })),
      },
    });
  };
  const preview = (doc: FileRecord) =>
    action.run(async () => {
      const result = await request<{ url: string }>(
        `/preparations/${id}/documents/${doc.id}/content?redirect=false`,
      );
      const url = new URL(result.url, window.location.origin);
      if (!["https:", "http:"].includes(url.protocol))
        throw new Error("Alamat berkas tidak valid.");
      window.open(url.href, "_blank", "noopener,noreferrer");
    }, "Pratinjau dibuka pada tab baru.");
  return (
    <Shell title={names[stage]}>
      {!id ? (
        <p className="plain-panel">
          Pilih layanan dan mulai persiapan terlebih dahulu.{" "}
          <Link className="text-link" to="/katalog">
            Cari layanan →
          </Link>
        </p>
      ) : (
        <>
          <nav
            aria-label="Tahap persiapan"
            className="flex flex-wrap gap-3 my-5"
          >
            {names.map((name, index) => (
              <Link
                key={name}
                className={
                  stage === index ? "button-primary" : "button-secondary"
                }
                aria-current={stage === index ? "step" : undefined}
                to={link(index)}
              >
                {index + 1}. {name}
              </Link>
            ))}
          </nav>
          <Loading resource={resource} />
          <Feedback {...action} />
          {resource.data && (
            <>
              <p className="my-4">
                {resource.data.prep.service.name} ·{" "}
                {resource.data.prep.internal_reference}
              </p>
              {stage < 2 && (
                <form
                  className="plain-panel auth-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void action.run(async () => {
                      await save();
                      navigate(link(stage + 1));
                    });
                  }}
                >
                  <p>
                    Jawaban menentukan persyaratan yang berlaku. Data disimpan
                    saat kamu menekan Simpan & lanjut.
                  </p>
                  {resource.data.questions.length ? (
                    <QuestionFields
                      questions={resource.data.questions}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                  ) : (
                    <p>
                      Layanan ini belum memiliki pertanyaan tambahan. Lanjutkan
                      untuk melihat persyaratan.
                    </p>
                  )}
                  <button className="button-primary" disabled={action.busy}>
                    Simpan & lanjut
                  </button>
                </form>
              )}
              {stage === 2 && (
                <>
                  <p className="my-4">
                    Gunakan PDF, JPG, atau PNG maksimal 10 MB. Berkas dikirim ke
                    penyimpanan server setelah dipilih.
                  </p>
                  {resource.data.requirements.map((req) => {
                    const doc = resource.data!.docs.find((item) =>
                      [req.code, req.requirement_id].includes(
                        item.document_type,
                      ),
                    );
                    return (
                      <section
                        key={req.requirement_id}
                        className="plain-panel my-4"
                      >
                        <h2 className="panel-title">
                          {req.name}
                          {req.required ? " (wajib)" : ""}
                        </h2>
                        <p>{req.description}</p>
                        {doc && (
                          <>
                            <p className="my-3">
                              {doc.original_filename || doc.display_name} ·
                              versi {doc.active_version}
                            </p>
                            <button
                              className="button-secondary"
                              disabled={action.busy}
                              onClick={() => preview(doc)}
                            >
                              Pratinjau
                            </button>
                            <button
                              className="text-link ml-4"
                              disabled={action.busy}
                              onClick={() => {
                                if (
                                  window.confirm("Hapus berkas ini dari draf?")
                                )
                                  void action.run(async () => {
                                    await request(
                                      `/preparations/${id}/documents/${doc.id}`,
                                      { method: "DELETE" },
                                    );
                                  });
                              }}
                            >
                              Hapus
                            </button>
                          </>
                        )}
                        <div className="form-field mt-4">
                          <label htmlFor={"upload-" + req.code}>
                            {doc ? "Ganti berkas" : "Pilih berkas"}
                          </label>
                          <input
                            id={"upload-" + req.code}
                            type="file"
                            accept="application/pdf,image/jpeg,image/png"
                            disabled={action.busy}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              if (file)
                                void action.run(async () => {
                                  await uploadServerDocument(
                                    id!,
                                    file,
                                    req.code,
                                  );
                                });
                              event.target.value = "";
                            }}
                          />
                        </div>
                        {DEMO_HELPERS_ENABLED && (
                          <button
                            type="button"
                            className="text-link min-h-[44px]"
                            disabled={action.busy}
                            onClick={() =>
                              action.run(async () => {
                                const sample = await fetch(
                                  "/demo-documents/contoh-berkas.pdf",
                                );
                                if (!sample.ok)
                                  throw new Error(
                                    "Berkas contoh belum tersedia.",
                                  );
                                await uploadServerDocument(
                                  id!,
                                  new File(
                                    [await sample.blob()],
                                    "CONTOH-DEMO.pdf",
                                    { type: "application/pdf" },
                                  ),
                                  req.code,
                                );
                              })
                            }
                          >
                            Gunakan berkas contoh ber-watermark
                          </button>
                        )}
                      </section>
                    );
                  })}
                  {!resource.data.requirements.length && (
                    <p className="plain-panel">
                      Tidak ada persyaratan yang dikembalikan untuk jawaban ini.
                      Periksa pilihan kebutuhan atau minta bantuan.
                    </p>
                  )}
                  <Link className="button-primary" to={link(3)}>
                    Lanjut ke validasi berkas →
                  </Link>
                </>
              )}
              {stage === 3 && (
                <div className="plain-panel my-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                    <div>
                      <h2 className="panel-title mb-1">
                        Pemeriksaan Awal Dokumen (AI &amp; Validasi)
                      </h2>
                      <p className="text-sm text-gray-600">
                        Status kesiapan:{" "}
                        <strong className="capitalize">
                          {resource.data.prep.readiness ?? resource.data.prep.status}
                        </strong>
                      </p>
                    </div>
                    <button
                      type="button"
                      className="button-primary"
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          await request(`/preparations/${id}/inspections`, {
                            method: "POST",
                            body: {
                              expected_data_version:
                                resource.data!.prep.data_version,
                            },
                            headers: {
                              "Idempotency-Key": `inspect-${id}-${resource.data!.prep.data_version}-${Date.now()}`,
                            },
                          });
                        }, "Pemeriksaan dokumen selesai dijalankan.")
                      }
                    >
                      {action.busy
                        ? "Sedang memeriksa..."
                        : "Jalankan Pemeriksaan AI/OCR"}
                    </button>
                  </div>

                  {resource.data.latestRun ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-semibold text-sm">
                            Hasil:{" "}
                            {resource.data.latestRun.summary?.title ??
                              resource.data.latestRun.status}
                          </span>
                          <span className="text-xs px-2.5 py-1 rounded bg-blue-100 text-blue-800 font-medium">
                            {resource.data.latestRun.status}
                          </span>
                        </div>
                        {resource.data.latestRun.summary && (
                          <p className="text-xs text-gray-600 mt-1">
                            {resource.data.latestRun.summary.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-700">
                          <div>
                            Diproses:{" "}
                            <strong>
                              {resource.data.latestRun.summary
                                ?.documents_processed ?? 0}
                            </strong>
                          </div>
                          <div>
                            Temuan wajib:{" "}
                            <strong>
                              {resource.data.latestRun.summary
                                ?.must_fix_count ?? 0}
                            </strong>
                          </div>
                          <div>
                            Perlu konfirmasi:{" "}
                            <strong>
                              {resource.data.latestRun.summary
                                ?.needs_confirmation_count ?? 0}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <h3 className="font-medium text-sm mt-4">
                        Daftar Temuan Pemeriksaan (
                        {resource.data.findings.length})
                      </h3>

                      {resource.data.findings.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                          Tidak ada temuan masalah pada berkas. Dokumen siap
                          diajukan.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {resource.data.findings.map((f) => (
                            <div
                              key={f.id}
                              className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                                f.action_level === "must_fix"
                                  ? "bg-red-50/60 border-red-200 text-red-950"
                                  : f.action_level === "needs_confirmation"
                                    ? "bg-yellow-50/60 border-yellow-200 text-yellow-950"
                                    : "bg-blue-50/60 border-blue-200 text-blue-950"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold">{f.title}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase ${
                                    f.action_level === "must_fix"
                                      ? "bg-red-200 text-red-800"
                                      : f.action_level === "needs_confirmation"
                                        ? "bg-yellow-200 text-yellow-800"
                                        : "bg-blue-200 text-blue-800"
                                  }`}
                                >
                                  {f.action_level} · {f.status}
                                </span>
                              </div>
                              <p className="text-gray-700">{f.explanation}</p>
                              {f.evidence?.quoted_text && (
                                <p className="italic text-gray-600 bg-white/70 p-2 rounded border border-gray-200">
                                  Teks terbaca: &ldquo;
                                  {f.evidence.quoted_text}&rdquo;
                                </p>
                              )}
                              {f.status === "open" && (
                                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
                                  <input
                                    type="text"
                                    placeholder="Isikan nilai koreksi atau konfirmasi..."
                                    className="text-xs p-1.5 border rounded flex-1 min-w-[180px]"
                                    value={correctionValues[f.id] ?? ""}
                                    onChange={(e) =>
                                      setCorrectionValues((prev) => ({
                                        ...prev,
                                        [f.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    type="button"
                                    className="button-secondary text-xs py-1 px-3"
                                    disabled={
                                      action.busy ||
                                      !correctionValues[f.id]?.trim()
                                    }
                                    onClick={() =>
                                      action.run(async () => {
                                        await request(
                                          `/preparations/${id}/findings/${f.id}/corrections`,
                                          {
                                            method: "POST",
                                            body: {
                                              corrected_value:
                                                correctionValues[f.id].trim(),
                                            },
                                          },
                                        );
                                      }, "Koreksi temuan berhasil dicatat.")
                                    }
                                  >
                                    Koreksi
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-lg text-xs text-blue-900">
                      Dokumen belum diperiksa secara otomatis. Tekan tombol{" "}
                      <strong>Jalankan Pemeriksaan AI/OCR</strong> untuk memulai
                      verifikasi awal dokumen dan kesesuaian data formulir.
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    <Link className="button-primary" to={link(4)}>
                      Lanjut ke Tinjau &amp; kirim →
                    </Link>
                    <Link className="button-secondary" to={link(2)}>
                      ← Kembali ke dokumen
                    </Link>
                  </div>
                </div>
              )}
              {stage === 4 && (
                <form
                  className="plain-panel auth-form"
                  onSubmit={(event) => {
                    const form = formObject(event);
                    void action.run(async () => {
                      if (!consent)
                        throw new Error(
                          "Persetujuan pengiriman wajib diberikan.",
                        );
                      if (
                        resource.data!.requirements.some(
                          (req) => req.required && !req.fulfilled,
                        )
                      )
                        throw new Error(
                          "Lengkapi seluruh dokumen wajib sebelum mengirim.",
                        );
                      const result = await request<Snapshot>(
                        applicationId
                          ? `/applications/${applicationId}/resubmissions`
                          : `/preparations/${id}/submissions`,
                        {
                          method: "POST",
                          body: {
                            citizen_note: field(form, "note"),
                            ...(field(form, "family_member_id")
                              ? {
                                  family_member_id: field(
                                    form,
                                    "family_member_id",
                                  ),
                                }
                              : {}),
                            consent_version: "2026-11-02",
                            consent_confirmed: consent,
                            ...(applicationId
                              ? { changes_summary: field(form, "changes") }
                              : {}),
                          },
                        },
                      );
                      navigate("/pelacakan/" + result.application_id);
                    });
                  }}
                >
                  <h2>Data dan berkas yang akan dikirim</h2>
                  <dl>
                    {resource.data.prep.answers.map((answer) => (
                      <div className="py-2" key={answer.question_id}>
                        <dt className="font-semibold">{answer.label}</dt>
                        <dd>{String(answer.value)}</dd>
                      </div>
                    ))}
                  </dl>
                  <ul>
                    {resource.data.requirements.map((req) => (
                      <li className="py-2" key={req.requirement_id}>
                        {req.name}:{" "}
                        {req.fulfilled ? "Tersedia" : "Belum tersedia"}
                      </li>
                    ))}
                  </ul>
                  {!applicationId && (
                    <>
                      <div className="form-field">
                        <label htmlFor="family-subject">Pengurusan untuk</label>
                        <select id="family-subject" name="family_member_id">
                          <option value="">Diri sendiri</option>
                          {family.members.map((member) => (
                            <option value={member.id} key={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p>
                        <Link className="text-link" to="/keluarga">
                          Kelola anggota keluarga
                        </Link>
                        . Jika mewakili keluarga, persetujuan di bawah juga
                        menyatakan kewenangan pendampingan.
                      </p>
                    </>
                  )}
                  <Field
                    name="note"
                    title="Catatan untuk petugas (opsional)"
                    type="textarea"
                  />
                  {applicationId && (
                    <Field
                      name="changes"
                      title="Ringkasan perbaikan"
                      type="textarea"
                      required
                    />
                  )}
                  <label className="consent-field">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={(event) => setConsent(event.target.checked)}
                    />
                    <span>
                      Saya telah memeriksa isian, berwenang mengurus subjek yang
                      dipilih, dan mengizinkan data serta berkas ini dikirim
                      untuk tinjauan pendamping.
                    </span>
                  </label>
                  <button
                    className="button-primary"
                    disabled={action.busy || !consent}
                  >
                    {applicationId ? "Kirim perbaikan" : "Kirim untuk ditinjau"}
                  </button>
                </form>
              )}
            </>
          )}
        </>
      )}
    </Shell>
  );
}

export function ApiTrackingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const resource = useServerResource("application:" + id, async () => {
    const [application, versions, timeline] = await Promise.all([
      request<Application>(`/applications/${id}`),
      request<Snapshot[]>(`/applications/${id}/submissions`),
      request<{
        events: {
          id: string;
          source_label: string;
          note?: string;
          occurred_at: string;
        }[];
      }>(`/applications/${id}/timeline`),
    ]);
    const latest = versions.length
      ? await request<Snapshot>(
          `/applications/${id}/submissions/${Math.max(...versions.map((item) => item.version_number))}`,
        )
      : null;
    return { application, versions, timeline, latest };
  });
  const action = useServerAction(resource.refresh);
  return (
    <Shell title="Detail pengajuan">
      <Link className="text-link" to="/pelacakan">
        ← Daftar pengajuan
      </Link>
      <Loading resource={resource} />
      <Feedback {...action} />
      {resource.data && (
        <>
          <section className="plain-panel my-5">
            <h2>{resource.data.application.service.name}</h2>
            <p>{resource.data.application.internal_reference}</p>
            <p>
              {label(
                resource.data.application.review_status ||
                  resource.data.application.current_status,
              )}
            </p>
          </section>
          {resource.data.latest?.reviews.map((review, index) => (
            <section className="plain-panel my-4" key={index}>
              <h2>Catatan tinjauan</h2>
              <p>{review.overall_notes}</p>
              <ul>
                {review.assessments.map((item) => (
                  <li className="py-2" key={item.item_id}>
                    <strong>
                      {item.verdict === "sesuai"
                        ? "Sesuai"
                        : "Perlu ditindaklanjuti"}
                    </strong>
                    <p>{item.note}</p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {code(resource.data.application.review_status) ===
            "revision_requested" && (
            <button
              className="button-primary"
              onClick={() =>
                navigate(
                  `/persiapan/data?prep=${resource.data!.latest?.preparation_id || resource.data!.application.preparation_id}&application=${id}`,
                )
              }
            >
              Perbaiki data dan berkas
            </button>
          )}
          <section className="plain-panel my-5">
            <h2>Riwayat kiriman</h2>
            {resource.data.versions.map((item) => (
              <p className="py-2" key={item.id}>
                Versi {item.version_number} ·{" "}
                {new Date(item.submitted_at).toLocaleString("id-ID")}
              </p>
            ))}
            <h2 className="mt-5">Perkembangan</h2>
            {resource.data.timeline.events.map((item) => (
              <article className="py-3" key={item.id}>
                <strong>{item.source_label}</strong>
                <p>{item.note}</p>
                <small>
                  {new Date(item.occurred_at).toLocaleString("id-ID")}
                </small>
              </article>
            ))}
          </section>
          <form
            className="plain-panel auth-form my-5"
            onSubmit={(event) => {
              const form = formObject(event);
              void action.run(async () => {
                await request(`/applications/${id}/citizen-notes`, {
                  method: "POST",
                  body: { note: field(form, "citizen-note") },
                });
              });
            }}
          >
            <h2>Tambahkan catatan tindak lanjut</h2>
            <Field
              name="citizen-note"
              title="Catatan"
              type="textarea"
              required
            />
            <button className="button-secondary" disabled={action.busy}>
              Simpan catatan
            </button>
          </form>
          {resource.data.latest &&
            resource.data.application.review_status === "review_completed" && (
              <Link
                className="button-primary my-4"
                to={`/pelacakan/catat?prep=${resource.data.latest.preparation_id}&service=${resource.data.application.service.id}`}
              >
                Sudah mengajukan di instansi? Catat tanda terima
              </Link>
            )}
          {!resource.data.latest && (
            <details className="plain-panel my-5">
              <summary>Dokumen hasil sudah diterima?</summary>
              <form
                className="auth-form"
                onSubmit={(event) => {
                  const form = formObject(event);
                  void action.run(async () => {
                    await request(
                      `/applications/${id}/confirm-result-received`,
                      {
                        method: "POST",
                        body: {
                          acknowledgement_confirmed: true,
                          channel: "other",
                          official_reference_number: field(form, "receipt"),
                          note: field(form, "result-note"),
                        },
                      },
                    );
                  });
                }}
              >
                <p>
                  Ini mencatat laporanmu, bukan konfirmasi otomatis dari
                  instansi.
                </p>
                <Field name="receipt" title="Nomor tanda terima instansi" />
                <Field
                  name="result-note"
                  title="Catatan hasil"
                  type="textarea"
                />
                <label className="consent-field">
                  <input type="checkbox" required />
                  <span>Saya benar-benar sudah menerima hasil layanan.</span>
                </label>
                <button className="button-primary" disabled={action.busy}>
                  Konfirmasi hasil diterima
                </button>
              </form>
            </details>
          )}
          <details className="plain-panel my-5">
            <summary>Tarik permintaan tinjauan</summary>
            <form
              className="auth-form"
              onSubmit={(event) => {
                const form = formObject(event);
                void action.run(async () => {
                  await request(`/applications/${id}/withdraw`, {
                    method: "POST",
                    body: { reason: field(form, "withdraw-reason") },
                  });
                });
              }}
            >
              <p>Penarikan ini tidak membatalkan pengajuan pada instansi.</p>
              <Field
                name="withdraw-reason"
                title="Alasan penarikan"
                type="textarea"
                required
              />
              <label className="consent-field">
                <input type="checkbox" required />
                <span>
                  Saya memahami tinjauan akan ditutup dan riwayat tetap
                  tersimpan.
                </span>
              </label>
              <button className="button-secondary" disabled={action.busy}>
                Tarik tinjauan
              </button>
            </form>
          </details>
        </>
      )}
    </Shell>
  );
}

export function ApiOfficialEntry() {
  const [params] = useSearchParams();
  const services = useServerResource("official-services", () =>
    serverList<Service>("/services"),
  );
  const navigate = useNavigate();
  const action = useServerAction();
  return (
    <Shell title="Catat pengajuan instansi">
      <Loading resource={services} />
      <Feedback {...action} />
      <form
        className="plain-panel auth-form my-5"
        onSubmit={(event) => {
          const form = formObject(event);
          void action.run(async () => {
            const app = await request<Application>("/applications", {
              method: "POST",
              body: {
                service_id: field(form, "service"),
                ...(params.get("prep")
                  ? { preparation_id: params.get("prep") }
                  : {}),
                official_application_number: field(form, "number"),
                channel: { type: field(form, "channel") },
                note: field(form, "note"),
              },
            });
            navigate("/pelacakan/" + app.id);
          });
        }}
      >
        <p>
          Isi setelah mengajukan melalui kanal resmi. Informasi ini berasal dari
          laporan warga.
        </p>
        <div className="form-field">
          <label htmlFor="official-service">Layanan</label>
          <select
            id="official-service"
            name="service"
            required
            defaultValue={params.get("service") || ""}
          >
            <option value="">Pilih layanan</option>
            {services.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="official-channel">Kanal</label>
          <select id="official-channel" name="channel">
            <option value="in_person">Loket instansi</option>
            <option value="online">Portal resmi</option>
            <option value="email">Email</option>
            <option value="other">Lainnya</option>
          </select>
        </div>
        <Field name="number" title="Nomor tanda terima resmi" required />
        <Field name="note" title="Catatan" type="textarea" />
        <label className="consent-field">
          <input type="checkbox" required />
          <span>
            Saya memahami ini pencatatan laporan warga dan bukan pengajuan
            otomatis ke instansi.
          </span>
        </label>
        <button className="button-primary" disabled={action.busy}>
          Simpan pencatatan
        </button>
      </form>
    </Shell>
  );
}

export function ApiOfficer() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const list = useServerResource("officer-list", () =>
    serverList<Application>("/officer/assignments"),
  );
  const detail = useServerResource("officer-detail:" + id, () =>
    id
      ? request<
          Application & {
            snapshot: Snapshot | null;
            evaluation: { items: Assessment[]; overall_notes?: string };
            documents: {
              id: string;
              name?: string;
              original_filename?: string;
            }[];
          }
        >(`/officer/applications/${id}`)
      : Promise.resolve(null),
  );
  const action = useServerAction(detail.refresh);
  const [items, setItems] = useState<Assessment[]>([]);
  const [notes, setNotes] = useState("");
  useEffect(() => {
    const data = detail.data;
    if (!data?.snapshot) return;
    const saved = data.evaluation?.items || [];
    setItems(
      [
        {
          item_type: "FORM_DATA" as const,
          item_id: "form_data",
          verdict: "",
          note: "",
        },
        ...data.snapshot.documents.map((doc) => ({
          item_type: "DOCUMENT" as const,
          item_id: doc.document_version_id,
          verdict: "",
          note: "",
        })),
      ].map(
        (item) => saved.find((old) => old.item_id === item.item_id) || item,
      ),
    );
    setNotes(data.evaluation?.overall_notes || "");
  }, [detail.data]);
  if (!id)
    return (
      <Shell
        title={
          pathname.includes("riwayat") ? "Riwayat tinjauan" : "Antrean tinjauan"
        }
      >
        <div className="form-field my-4">
          <label htmlFor="officer-query">Cari warga atau nomor kiriman</label>
          <input
            id="officer-query"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Loading resource={list} />
        {list.data
          ?.filter((item) => {
            const complete = ["review_completed", "withdrawn"].includes(
              code(item.review_status),
            );
            return (
              (pathname.includes("/riwayat") ? complete : !complete) &&
              [item.internal_reference, item.service.name, item.citizen?.name]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase())
            );
          })
          .map((item) => (
            <Link
              className="plain-panel block my-3"
              key={item.application_id || item.id}
              to={"/petugas/" + (item.application_id || item.id)}
            >
              <h2>{item.service.name}</h2>
              <p>
                {item.citizen?.name} · {item.internal_reference}
              </p>
              <p>{label(item.review_status || item.current_status)}</p>
            </Link>
          ))}
        {!list.loading && !list.error && !list.data?.length && (
          <p className="plain-panel">
            Belum ada pekerjaan yang ditugaskan. Warga perlu mengirim terlebih
            dahulu dan admin menyiapkan penugasan.
          </p>
        )}
      </Shell>
    );
  return (
    <Shell title="Tinjauan berkas">
      <Link to="/petugas" className="text-link">
        ← Antrean
      </Link>
      <Loading resource={detail} />
      <Feedback {...action} />
      {detail.data && (
        <>
          <section className="plain-panel my-5">
            <h2>{detail.data.service.name}</h2>
            <p>
              {detail.data.citizen?.name} · {detail.data.internal_reference}
            </p>
            <p>Kiriman versi {detail.data.snapshot?.version_number}</p>
            <p>{label(detail.data.review_status)}</p>
            {detail.data.review_status === "submitted" && (
              <button
                className="button-primary my-3"
                disabled={action.busy}
                onClick={() =>
                  action.run(async () => {
                    await request(
                      `/officer/applications/${id}/evaluation-draft`,
                      { method: "PUT", body: { items: [] } },
                    );
                  }, "Tinjauan dimulai.")
                }
              >
                Mulai tinjauan
              </button>
            )}
            {detail.data.snapshot?.answers.map((answer) => (
              <p className="py-2" key={answer.question_id}>
                <strong>{answer.label}:</strong> {String(answer.value)}
              </p>
            ))}
          </section>
          {detail.data.snapshot ? (
            <form
              className="auth-form"
              onSubmit={(event) => {
                event.preventDefault();
                void action.run(async () => {
                  if (items.some((item) => !item.verdict))
                    throw new Error(
                      "Nilai semua bagian sebelum mengirim keputusan.",
                    );
                  const decision = items.every(
                    (item) => item.verdict === "SESUAI",
                  )
                    ? "approved_for_submission"
                    : "revision_requested";
                  await request(`/officer/applications/${id}/decisions`, {
                    method: "POST",
                    body: {
                      decision,
                      expected_version: detail.data!.snapshot!.version_number,
                      overall_notes: notes,
                      items,
                    },
                  });
                });
              }}
            >
              {items.map((item, index) => (
                <section key={item.item_id} className="plain-panel">
                  <h2>
                    {item.item_type === "FORM_DATA"
                      ? "Data pemohon"
                      : detail.data!.snapshot!.documents.find(
                          (doc) => doc.document_version_id === item.item_id,
                        )?.original_filename || "Berkas persyaratan"}
                  </h2>
                  {item.item_type === "DOCUMENT" && (
                    <button
                      className="text-link min-h-[44px]"
                      type="button"
                      disabled={action.busy}
                      onClick={() =>
                        action.run(async () => {
                          const result = await request<{ url: string }>(
                            `/officer/applications/${id}/documents/${item.item_id}/content?redirect=false`,
                          );
                          const url = new URL(
                            result.url,
                            window.location.origin,
                          );
                          if (!["https:", "http:"].includes(url.protocol))
                            throw new Error("Alamat berkas tidak valid.");
                          window.open(
                            url.href,
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }, "Pratinjau dibuka.")
                      }
                    >
                      Pratinjau berkas
                    </button>
                  )}
                  <div className="form-field">
                    <label htmlFor={"verdict-" + index}>Penilaian</label>
                    <select
                      required
                      id={"verdict-" + index}
                      value={item.verdict}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((value, i) =>
                            i === index
                              ? { ...value, verdict: event.target.value }
                              : value,
                          ),
                        )
                      }
                    >
                      <option value="">Pilih penilaian</option>
                      <option value="SESUAI">Sesuai</option>
                      <option value="PERLU_PERBAIKAN">Perlu perbaikan</option>
                      <option value="BELUM_DAPAT_DIPERIKSA">
                        Belum dapat diperiksa
                      </option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor={"assessment-note-" + index}>
                      Catatan dan arahan perbaikan
                    </label>
                    <textarea
                      required={!!item.verdict && item.verdict !== "SESUAI"}
                      id={"assessment-note-" + index}
                      value={item.note}
                      onChange={(event) =>
                        setItems((current) =>
                          current.map((value, i) =>
                            i === index
                              ? { ...value, note: event.target.value }
                              : value,
                          ),
                        )
                      }
                    />
                  </div>
                </section>
              ))}
              <div className="form-field">
                <label htmlFor="review-notes">Ringkasan hasil tinjauan</label>
                <textarea
                  id="review-notes"
                  required
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button-secondary"
                  disabled={action.busy}
                  onClick={() =>
                    action.run(async () => {
                      await request(
                        `/officer/applications/${id}/evaluation-draft`,
                        {
                          method: "PUT",
                          body: {
                            overall_notes: notes,
                            items: items.filter((item) => item.verdict),
                          },
                        },
                      );
                    })
                  }
                >
                  Simpan penilaian sementara
                </button>
                <button
                  className="button-primary"
                  disabled={
                    action.busy || detail.data.review_status !== "in_review"
                  }
                >
                  {items.length &&
                  items.every((item) => item.verdict === "SESUAI")
                    ? "Selesaikan tinjauan"
                    : "Kirim permintaan perbaikan"}
                </button>
              </div>
            </form>
          ) : (
            <p className="plain-panel">Kiriman belum tersedia untuk dinilai.</p>
          )}
          <details className="plain-panel mt-5">
            <summary>Minta klarifikasi admin</summary>
            <form
              className="auth-form"
              onSubmit={(event) => {
                const form = formObject(event);
                void action.run(async () => {
                  await request(`/officer/applications/${id}/escalations`, {
                    method: "POST",
                    body: {
                      reason: field(form, "escalation"),
                      target_role: "admin",
                    },
                  });
                });
              }}
            >
              <Field
                name="escalation"
                title="Bagian yang perlu diklarifikasi"
                type="textarea"
                required
              />
              <button className="button-secondary" disabled={action.busy}>
                Kirim klarifikasi
              </button>
            </form>
          </details>
        </>
      )}
    </Shell>
  );
}
