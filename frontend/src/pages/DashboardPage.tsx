import { DocumentIllustration } from "../components/DocumentIllustration";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import {
  getOfficialSubmissionStatusLabel,
  getReviewStatusLabel,
  useApp,
} from "../context/AppContext";
import { caseNextAction, recordTime } from "../utils/dashboard";

export function DashboardPage() {
  const {
    user,
    preparations,
    applications,
    getPreparationReadiness,
    selectPreparation,
  } = useApp();
  const { user: account } = useAuth();
  const drafts = preparations
    .filter(
      (prep) =>
        prep.id !== "prep-draft-uninitialized" &&
        !prep.archivedAt &&
        prep.ownerId === user.id,
    )
    .slice()
    .sort((a, b) => recordTime(b.updatedAt) - recordTime(a.updatedAt));
  const cases = applications
    .filter((app) => app.owner_id === user.id)
    .map((app) => {
      const prep = drafts.find(
        (item) =>
          item.id === app.preparation_id || item.linkedApplicationId === app.id,
      );
      return { app, prep, next: caseNextAction(app, prep) };
    })
    .sort(
      (a, b) =>
        a.next.priority - b.next.priority ||
        recordTime(b.app.updated_at || b.app.created_at) -
          recordTime(a.app.updated_at || a.app.created_at),
    );
  const unsentDrafts = drafts.filter(
    (prep) =>
      !cases.some(
        (item) =>
          item.app.preparation_id === prep.id ||
          prep.linkedApplicationId === item.app.id,
      ),
  );
  const tasks = [
    ...cases
      .filter((item) => item.next.needsCitizen)
      .map(({ app, next }) => ({
        id: app.id,
        title: app.service_name,
        reference: app.internal_reference || "",
        description: next.description,
        label: next.label,
        href: next.href,
        priority: next.priority,
      })),
    ...unsentDrafts.map((prep) => {
      const ready = getPreparationReadiness(prep);
      return {
        id: prep.id,
        title: prep.serviceName,
        reference: prep.internalReference,
        description: ready.basicValidationPassed
          ? "Data dan berkas wajib sudah ditambahkan. Tinjau isian dan berikan persetujuan sebelum mengirim kepada petugas."
          : "Persiapan ini belum dikirim. Lanjutkan dari bagian yang belum lengkap; drafmu tetap tersimpan.",
        label: ready.steps.resumeLabel,
        href: ready.steps.resumePath,
        priority: ready.basicValidationPassed ? 30 : 40,
      };
    }),
  ].sort((a, b) => a.priority - b.priority);
  const updates = cases
    .flatMap(({ app }) =>
      app.events
        .filter((event) => event.completed || event.current)
        .map((event) => ({ app, event })),
    )
    .sort((a, b) => recordTime(b.event.time) - recordTime(a.event.time))
    .slice(0, 4);
  const waiting = cases.filter(
    (item) =>
      !item.next.needsCitizen && !item.next.resultReceived && !item.next.closed,
  );
  const isNewUser = drafts.length === 0 && cases.length === 0;

  return (
    <WorkspaceLayout
      title={
        isNewUser ? "Mulai urusan pertamamu" : "Mau lanjut urusan yang mana?"
      }
      eyebrow={"Halo, " + user.name.split(" ")[0] + "."}
      actions={
        <Link to="/kebutuhan" className="button-primary button-accent">
          Mulai persiapan
        </Link>
      }
    >
      {!isNewUser && (
        <p className="mb-6 text-sm text-slate-600">
          {tasks.length} perlu tindakanmu · {waiting.length} menunggu pembaruan
          · {cases.filter((item) => item.next.resultReceived).length} hasil
          diterima
        </p>
      )}

      {isNewUser ? (
        <section
          className="plain-panel dashboard-focus dashboard-welcome mb-6"
          aria-labelledby="welcome-title"
        >
          <div>
            <h2 id="welcome-title" className="panel-title">
              Mulai pengurusan pertamamu
            </h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
              Pilih layanan untuk melihat persyaratannya, lalu buat persiapan.
              Data dan dokumen belum dibagikan kepada petugas sampai kamu
              meninjau isian dan menyetujui pengiriman.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/katalog" className="button-primary">
                Pilih layanan
              </Link>
              <Link to="/akun" className="button-secondary">
                Lihat data akun
              </Link>
            </div>
          </div>
          <DocumentIllustration />
        </section>
      ) : (
        <section
          className="workspace-section"
          aria-labelledby="attention-title"
        >
          <h2 id="attention-title" className="panel-title">
            {tasks.length ? "Perlu tindakanmu (" + tasks.length + ")" : "Untukmu hari ini"}
          </h2>
          {tasks.length ? (
            <div className="mt-4 grid gap-3 dashboard-task-list">
              {tasks.map((task, index) => (
                <article
                  key={task.id}
                  className={
                    "rounded-xl border border-slate-200 bg-white p-4 sm:p-5" +
                    (index === 0 ? " dashboard-focus" : "")
                  }
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-500">{task.reference}</p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {task.title}
                      </h3>
                      <p className="mt-2 max-w-3xl text-base leading-relaxed text-slate-600">
                        {task.description}
                      </p>
                    </div>
                    <Link to={task.href} className="button-primary shrink-0">
                      {task.label}
                    </Link>
                  </div>
                  {index === 0 && <DocumentIllustration />}
                </article>
              ))}
            </div>
          ) : (
            <article className="dashboard-focus mt-4">
              <div>
                <p className="text-sm font-semibold">KABAR URUSANMU</p>
                <h3>
                  {waiting.length
                    ? "Urusanmu sedang berjalan."
                    : "Semua langkahmu sudah tercatat."}
                </h3>
                <p className="text-base leading-relaxed">
                  Tidak ada tindakan yang perlu kamu lakukan sekarang. Lihat
                  pembaruan pada urusan yang sedang berjalan.
                </p>
                <Link to="/pelacakan" className="button-primary">
                  Lihat perkembangan{" "}
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    arrow_forward
                  </span>
                </Link>
              </div>
              <DocumentIllustration />
            </article>
          )}
        </section>
      )}

      <div className="dashboard-columns">
        <div>
          {cases.length > 0 && (
            <section
              className="workspace-section"
              aria-labelledby="cases-title"
            >
              <h2 id="cases-title" className="panel-title">
                Perkembangan urusan ({cases.length})
              </h2>
              <div className="mt-4 grid gap-4">
                {cases.map(({ app, next }) => (
                  <article
                    key={app.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-slate-500">
                          {app.internal_reference || "Catatan pengajuan"}
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          {app.service_name}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          Untuk {app.applicant_name}
                        </p>
                      </div>
                      <span
                        className={
                          next.needsCitizen
                            ? "status-attention"
                            : "status-neutral"
                        }
                      >
                        {getReviewStatusLabel(app)}
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2">
                      <div>
                        <dt className="text-sm text-slate-500">
                          Tahap tinjauan pendamping
                        </dt>
                        <dd className="mt-1 font-medium">
                          {getReviewStatusLabel(app)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">
                          Pengajuan resmi instansi
                        </dt>
                        <dd className="mt-1 font-medium">
                          {getOfficialSubmissionStatusLabel(app)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">
                          Tindak lanjut oleh
                        </dt>
                        <dd className="mt-1">{next.actor}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-slate-500">
                          Pembaruan terakhir
                        </dt>
                        <dd className="mt-1">
                          {app.updated_at || app.created_at}
                        </dd>
                      </div>
                    </dl>
                    {!next.needsCitizen && (
                      <p className="mt-4 text-base leading-relaxed text-slate-600">
                        {next.description}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-sm text-slate-500">
                        {app.recipient_unit ||
                          app.agency ||
                          "Tinjauan pendamping DaftarIn"}
                      </p>
                      <Link to={next.href} className="text-link">
                        {next.label} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {drafts.length > 0 && (
            <section
              className="workspace-section"
              aria-labelledby="drafts-title"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="drafts-title" className="panel-title">
                  Persiapan tersimpan ({drafts.length})
                </h2>
                <Link to="/persiapan" className="text-link text-sm">
                  Lihat semua persiapan →
                </Link>
              </div>
              <div className="mt-4 grid gap-4">
                {drafts.slice(0, 3).map((prep) => {
                  const ready = getPreparationReadiness(prep);
                  const sent = cases.some(
                    (item) =>
                      item.app.preparation_id === prep.id ||
                      prep.linkedApplicationId === item.app.id,
                  );
                  const steps = [
                    {
                      label: "Kebutuhan",
                      complete: ready.steps.step1Kebutuhan,
                    },
                    { label: "Data", complete: ready.steps.step2Data },
                    { label: "Dokumen", complete: ready.steps.step3Dokumen },
                    {
                      label: "Kirim",
                      complete: sent && !ready.hasUnsentDraftChanges,
                    },
                  ];
                  return (
                    <article
                      key={prep.id}
                      className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5"
                    >
                      <p className="text-sm text-slate-500">
                        {prep.internalReference} · {prep.updatedAt}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold">
                        {prep.serviceName}
                      </h3>
                      <ol
                        aria-label={
                          "Progres persiapan " + prep.internalReference
                        }
                        className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
                      >
                        {steps.map((step) => (
                          <li
                            key={step.label}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              aria-hidden="true"
                              className={
                                step.complete
                                  ? "text-[#17324D]"
                                  : "text-slate-400"
                              }
                            >
                              {step.complete ? "✓" : "○"}
                            </span>
                            {step.label}
                            <span className="sr-only">
                              {step.complete ? " selesai" : " belum selesai"}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">
                        {sent
                          ? ready.hasUnsentDraftChanges
                            ? "Ada perubahan pada draf. Petugas masih melihat versi terakhir yang kamu kirim."
                            : "Salinan draf ini sudah dikirim untuk tinjauan. Perkembangannya ada pada urusan terkait."
                          : "Draf ini hanya terlihat olehmu sampai kamu menyetujui pembagian dan mengirimnya."}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-sm text-slate-500">
                          {ready.unavailableRequiredDocs.length
                            ? "Ada berkas yang perlu diunggah ulang"
                            : ready.missingRequiredDocs.length +
                              " dokumen wajib belum ditambahkan"}
                        </span>
                        <Link
                          to={ready.steps.resumePath}
                          onClick={() => selectPreparation(prep.id)}
                          className="text-link"
                        >
                          {sent ? "Buka draf" : ready.steps.resumeLabel} →
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {updates.length > 0 && (
            <section
              className="workspace-section"
              aria-labelledby="updates-title"
            >
              <h2 id="updates-title" className="panel-title">
                Pembaruan terbaru
              </h2>
              <ol className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-4 sm:px-5">
                {updates.map(({ app, event }) => (
                  <li key={app.id + ":" + event.id} className="py-4">
                    <div className="flex flex-wrap justify-between gap-2">
                      <Link
                        to={"/pelacakan/" + encodeURIComponent(app.id)}
                        className="font-semibold hover:underline"
                      >
                        {event.title}
                      </Link>
                      <time className="text-sm text-slate-500">
                        {event.time}
                      </time>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {app.service_name}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.source}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
        <aside
          className="dashboard-help"
          aria-labelledby="dashboard-help-title"
        >
          <span
            className="dashboard-help-icon material-symbols-outlined"
            aria-hidden="true"
          >
            help
          </span>
          <h2 id="dashboard-help-title">
            Pelan-pelan,
            <br />
            kita bantu.
          </h2>
          <p>
            Bingung syarat berkas atau langkah selanjutnya? Mulai dari panduan
            bantuan.
          </p>
          <Link className="button-secondary" to="/bantuan">
            Buka bantuan{" "}
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </aside>
      </div>
      <section className="workspace-section" aria-labelledby="journey-title">
        <details className="plain-panel" open={isNewUser}>
          <summary
            id="journey-title"
            className="cursor-pointer py-1 text-base font-semibold"
          >
            Bagaimana proses pengurusan di DaftarIn?
          </summary>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
              [
                "1. Siapkan data dan dokumen",
                "Pilih kebutuhan, isi data, dan tambahkan dokumen. Draf belum dibagikan.",
              ],
              [
                "2. Kirim untuk tinjauan pendamping",
                "Setelah kamu menyetujui pengiriman, petugas meninjau salinan berkas. Perbaiki pada permintaan yang sama jika diminta.",
              ],
              [
                "3. Ajukan melalui kanal resmi",
                "Tinjauan selesai belum berarti dokumen diterbitkan. Ikuti panduan instansi dan catat tanda terima yang kamu peroleh.",
              ],
              [
                "4. Catat hasil layanan",
                "Setelah hasil diterima, konfirmasikan pada pelacakan. Status dari instansi ditandai sebagai laporan warga.",
              ],
            ].map(([title, text]) => (
              <li key={title}>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-base leading-relaxed text-slate-600">
                  {text}
                </p>
              </li>
            ))}
          </ol>
        </details>
      </section>

      <section
        className="workspace-section border-t border-slate-200 pt-5 text-sm text-slate-600"
        aria-label="Informasi akun dan penyimpanan"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p>
            Identitas akun:{" "}
            {account?.identityStatus === "pending"
              ? "belum diverifikasi"
              : "data contoh telah diisi"}
            .
          </p>
          <Link to="/akun" className="text-link">
            Kelola akun →
          </Link>
        </div>
        <p className="mt-2 leading-relaxed">
          Versi ini menyimpan data di browser ini. Tinjauan petugas masih
          simulasi pada browser yang sama; belum terhubung ke sistem instansi.
        </p>
      </section>
    </WorkspaceLayout>
  );
}
export default DashboardPage;
