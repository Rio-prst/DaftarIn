import { Link, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { Sidebar } from "../components/Sidebar";
import { TopBar } from "../components/TopBar";
import {
  suggestServices,
  type LifeEvent,
  type NeedAnswers,
} from "../utils/lifeEvents";
const events = [
  {
    id: "kelahiran",
    title: "Anak baru lahir",
    description: "Cari persiapan akta kelahiran, KK, dan identitas anak.",
  },
  {
    id: "pindah",
    title: "Pindah rumah",
    description: "Cari persiapan perpindahan dan perubahan data alamat.",
  },
  {
    id: "dokumen",
    title: "Dokumen hilang atau rusak",
    description: "Temukan panduan penggantian dokumen yang tersedia.",
  },
];
function NeedsContent() {
  const { services, selectedRegion, preparations, getPreparationReadiness } = useApp();
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(() => new URLSearchParams(params));
  useEffect(() => {
    setDraft(new URLSearchParams(params));
  }, [params]);
  const event = events.some((item) => item.id === draft.get("need"))
    ? (draft.get("need") as LifeEvent)
    : null;
  const value = (key: string) => draft.get(key) || "";
  const answers: NeedAnswers = {
    certificate: value("certificate"),
    familyCard: value("familyCard"),
    move: value("move"),
    document: value("document"),
    problem: value("problem"),
  };
  const update = (key: string, answer: string) => {
    const next = new URLSearchParams(draft);
    next.set(key, answer);
    setDraft(next);
    setParams(next, { replace: true });
  };
  const complete =
    event === "kelahiran"
      ? ["yes", "no", "unknown"].includes(answers.certificate || "") &&
        ["yes", "no", "unknown"].includes(answers.familyCard || "")
      : event === "pindah"
        ? ["local", "other"].includes(answers.move || "")
        : event === "dokumen"
          ? ["ktp", "other"].includes(answers.document || "") &&
            ["lost", "damaged"].includes(answers.problem || "")
          : false;
  const suggestions =
    event && complete
      ? suggestServices(event, answers).filter((item) =>
          services.some((service) => service.id === item.serviceId && (service.region || 'Kota Contoh') === selectedRegion),
        )
      : [];
  const question = (
    key: string,
    label: string,
    options: [string, string][],
  ) => (
    <fieldset className="needs-question mt-6">
      <legend className="font-semibold">{label}</legend>
      <div className={"grid gap-3 mt-3 " + (options.length === 2 ? "sm:grid-cols-2" : "md:grid-cols-3")}>
        {options.map(([answer, text]) => (
          <label
            key={answer}
            className={
              "needs-option gap-3 border rounded-lg p-4 min-h-[48px] cursor-pointer " +
              (value(key) === answer
                ? "border-blue-600 bg-blue-50"
                : "border-slate-300")
            }
          >
            <input
              type="radio"
              name={key}
              value={answer}
              checked={value(key) === answer}
              onChange={() => update(key, answer)}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <h1>Mulai dari kebutuhanmu</h1>
          <p className="text-slate-600 mt-3">
            Pilih keadaanmu untuk menemukan layanan yang bisa disiapkan.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Wilayah panduan: {selectedRegion}. <Link className="text-link" to="/katalog">Ubah wilayah</Link>
          </p>
        </div>
        <Link
          className="text-link min-h-[44px] inline-flex items-center"
          to="/katalog"
        >
          Saya sudah tahu layanannya →
        </Link>
      </div>
      <div
        className="grid gap-4 md:grid-cols-3"
        role="group"
        aria-label="Pilihan kebutuhan"
      >
        {events.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={event === item.id}
            onClick={() => {
              setDraft(new URLSearchParams({ need: item.id }));
              setParams({ need: item.id });
            }}
            className={
              "text-left rounded-lg border " +
              (event ? "p-3 " : "p-5 ") +
              (event === item.id
                ? "border-blue-600 bg-blue-50"
                : "border-slate-300 bg-white")
            }
          >
            <strong className="block text-lg">{item.title}</strong>
            {!event && (
              <span className="block text-sm text-slate-600 mt-2">
                {item.description}
              </span>
            )}
          </button>
        ))}
      </div>
      {event && (
        <section className="plain-panel mt-6" aria-labelledby="need-questions">
          <h2 id="need-questions" className="panel-title">
            Sesuaikan dengan keadaanmu
          </h2>
          {event === "kelahiran" && (
            <>
              {question(
                "certificate",
                "Apakah anak sudah memiliki akta kelahiran?",
                [
                  ["yes", "Sudah"],
                  ["no", "Belum"],
                  ["unknown", "Belum yakin"],
                ],
              )}
              {question("familyCard", "Apakah anak sudah tercantum pada KK?", [
                ["yes", "Sudah"],
                ["no", "Belum"],
                ["unknown", "Belum yakin"],
              ])}
            </>
          )}
          {event === "pindah" &&
            question("move", "Ke mana kamu akan pindah?", [
              ["local", "Dalam kelurahan/kecamatan"],
              ["other", "Ke kecamatan/kota/provinsi lain"],
            ])}
          {event === "dokumen" && (
            <>
              {question("document", "Dokumen apa yang ingin diganti?", [
                ["ktp", "KTP-el"],
                ["other", "Dokumen lain"],
              ])}
              {question("problem", "Apa yang terjadi pada dokumen?", [
                ["lost", "Hilang"],
                ["damaged", "Rusak"],
              ])}
            </>
          )}
          <p className="text-sm text-slate-600 mt-5">
            Rekomendasi memakai panduan contoh. Persyaratan akhir mengikuti
            instansi daerah; jawaban ini bukan verifikasi identitas atau
            kelayakan layanan.
          </p>
          {complete && (
            <button
              type="button"
              className="button-primary mt-4"
              onClick={() => {
                const result = document.getElementById("need-results");
                result?.scrollIntoView({ block: "start", behavior: "smooth" });
                result?.focus({ preventScroll: true });
              }}
            >
              Lihat hasil rekomendasi
            </button>
          )}
        </section>
      )}
      {complete && (
        <section className="mt-7" aria-labelledby="need-results">
          <h2 id="need-results" tabIndex={-1} className="text-xl font-semibold">
            Layanan yang bisa kamu siapkan
          </h2>
          {suggestions.length ? (
            <>
              <p className="text-sm text-slate-600 mt-2">
                Pilih satu urusan untuk mulai. Setiap layanan mempunyai
                persiapan dan status tersendiri.
              </p>
              {event === "kelahiran" &&
                (answers.certificate === "unknown" ||
                  answers.familyCard === "unknown") && (
                  <p className="text-sm text-slate-600 mt-2">
                    Pastikan dahulu dokumen yang sudah dimiliki keluarga agar
                    tidak mengajukan ulang.
                  </p>
                )}
              <ol className="grid gap-4 mt-4">
                {suggestions.map((item) => {
                  const service = services.find(
                    (value) => value.id === item.serviceId,
                  )!;
                  const query = new URLSearchParams({
                    need: event!,
                    ...(item.condition ? { condition: item.condition } : {}),
                    target: item.family ? "anggota_keluarga" : "diri_sendiri",
                  });
                  return (
                    <li key={item.serviceId} className="plain-panel">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="max-w-2xl">
                          <h3 className="font-semibold">{service.name}</h3>
                          <p className="text-sm text-slate-600 mt-2">
                            {item.reason}
                          </p>
                          {item.later && (
                            <p className="text-sm mt-2">
                              Persiapan lanjutan — pastikan dokumen pendukung
                              dari urusan sebelumnya tersedia.
                            </p>
                          )}
                        </div>
                        <Link
                          className="button-primary"
                          to={"/layanan/" + service.id + "?" + query}
                        >
                          Lihat panduan
                        </Link>
                      </div>
                      {preparations.filter(prep=>prep.serviceId===item.serviceId&&!prep.archivedAt&&prep.conditionKey===item.condition).map(prep=><Link key={prep.id} className="text-link block min-h-[44px] py-2 mt-2 text-sm" to={getPreparationReadiness(prep).steps.resumePath}>Lanjutkan {prep.familyMember?.name||prep.formData.nama_lengkap||'persiapan tersimpan'} · {prep.internalReference} →</Link>)}
                    </li>
                  );
                })}
              </ol>
            </>
          ) : (
            <div className="empty-state mt-4">
              <h3>{event === 'dokumen' ? 'Panduan penggantian dokumen ini belum tersedia' : 'Panduan kebutuhan ini belum tersedia'}</h3>
              <p>
                {event === 'dokumen' ? 'Jangan memakai persyaratan KTP-el untuk dokumen lain. ' : ''}
                Cari panduan yang sesuai pada katalog atau hubungi instansi terkait di wilayahmu.
              </p>
              <Link className="text-link" to="/katalog">
                Buka katalog layanan →
              </Link>
            </div>
          )}
        </section>
      )}
    </>
  );
}
export function NeedsPage() {
  const { user } = useAuth();
  return user?.role === "warga" ? (
    <div className="flex min-h-screen bg-[#FAF7F2]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar breadcrumbs={["Kebutuhan layanan"]} />
        <main id="main-content" tabIndex={-1} className="workspace-content">
          <NeedsContent />
        </main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="page-width catalog-main">
        <NeedsContent />
      </main>
      <Footer />
    </div>
  );
}
