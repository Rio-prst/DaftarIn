import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { useHelpRequests } from "../features/help";
export function HelpPage() {
  const { user, mode } = useAuth(),
    { applications, escalateReview, resolveReviewEscalation } = useApp(),
    { requests, create, reply } = useHelpRequests(),
    location = useLocation(),
    navigate = useNavigate();
  const [topic, setTopic] = useState(
      location.state?.topic || "Memahami persyaratan",
    ),
    [body, setBody] = useState(location.state?.question || ""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState(""),
    [answer, setAnswer] = useState("");
  const aid =
    typeof location.state?.applicationId === "string"
      ? location.state.applicationId
      : undefined;
  const content = (
    <>
      <p className="text-slate-600">
        Pilih panduan atau jelaskan kendala. Jangan memasukkan NIK, nomor KK,
        kata sandi, atau foto dokumen ke percakapan bantuan.
      </p>
      <details className="plain-panel mt-4">
        <summary className="min-h-[44px] cursor-pointer font-medium">
          Belum punya salah satu berkas wajib?
        </summary>
        <p className="mt-3">
          Simpan persiapanmu lebih dahulu. Buka sumber layanan untuk mengetahui
          cara memperoleh berkas tersebut. Berkas wajib tetap harus tersedia
          sebelum dikirim untuk ditinjau.
        </p>
        <Link
          className="text-link inline-flex min-h-[44px] items-center"
          to="/katalog"
        >
          Cari panduan dan sumber layanan →
        </Link>
      </details>
      <details className="plain-panel mt-3">
        <summary className="min-h-[44px] cursor-pointer font-medium">
          Saya membantu orang tua atau anggota keluarga
        </summary>
        <p className="mt-3">
          Gunakan akunmu sebagai pengurus, lalu pilih anggota keluarga pada
          tahap Kebutuhan. Pastikan memperoleh izin dan mengikuti persyaratan
          perwakilan dari layanan. Pernyataan di DaftarIn tidak menggantikan
          surat kuasa atau bukti kewenangan yang diminta instansi.
        </p>
        {user ? (
          <Link
            to="/keluarga"
            className="text-link inline-flex items-center min-h-[44px]"
          >
            Kelola data keluarga →
          </Link>
        ) : (
          <Link
            to="/daftar"
            className="text-link inline-flex items-center min-h-[44px]"
          >
            Daftar sebagai pengurus →
          </Link>
        )}
      </details>
      <details className="plain-panel mt-3">
        <summary className="min-h-[44px] cursor-pointer font-medium">
          Persiapan, tinjauan, dan pengajuan resmi itu apa?
        </summary>
        <ol className="list-decimal pl-5 mt-3 space-y-2">
          <li>Persiapan: kamu mengisi data dan menyiapkan dokumen.</li>
          <li>
            Tinjauan pendamping: petugas DaftarIn membaca kiriman dan memberi
            catatan.
          </li>
          <li>
            Pengajuan resmi: dilakukan melalui loket atau portal instansi, lalu
            dicatat di DaftarIn.
          </li>
        </ol>
      </details>
      {!user ? (
        <div className="plain-panel mt-5">
          <h2 className="panel-title">Butuh bantuan pengurus?</h2>
          <p className="mt-2">
            Panduan tetap bisa dibaca tanpa akun. Untuk pertanyaan yang
            berkaitan dengan urusan pribadi, masuk memakai akunmu atau akun
            anggota keluarga yang mendampingi.
          </p>
          <Link className="button-primary mt-4" to="/masuk?next=%2Fbantuan">
            Masuk untuk meminta bantuan
          </Link>
        </div>
      ) : (
        <>
          <form
            className="auth-form plain-panel mt-5"
            onSubmit={(event) => {
              event.preventDefault();
              setError("");
              try {
                if (
                  user.role === "petugas" &&
                  aid &&
                  !applications.some((item) => item.id === aid)
                )
                  throw new Error("Permintaan tidak ditugaskan kepadamu.");
                const row = create({ topic, body, applicationId: aid });
                if (user.role === "petugas" && aid)
                  escalateReview(aid, row.id, body);
                setSelected(row.id);
                setBody("");
              } catch (cause) {
                setError(
                  cause instanceof Error
                    ? cause.message
                    : "Bantuan belum disimpan.",
                );
              }
            }}
          >
            <h2 className="panel-title">
              {user.role === "petugas" && aid
                ? "Minta klarifikasi admin"
                : "Tulis permintaan bantuan"}
            </h2>
            <p className="text-sm text-slate-600">
              {mode === "demo"
                ? "Simulasi: permintaan dibaca dan dibalas lewat akun admin pada browser yang sama."
                : "Kanal bantuan server belum diaktifkan; aplikasi belum mengirim pertanyaan ke petugas nyata."}
            </p>
            <div className="form-field">
              <label htmlFor="help-topic">Topik</label>
              <input
                id="help-topic"
                maxLength={120}
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
              />
            </div>
            <div className="form-field">
              <label htmlFor="help-body">Pertanyaan atau kendala</label>
              <textarea
                id="help-body"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "help-form-error" : undefined}
                maxLength={2000}
                rows={4}
                value={body}
                onChange={(event) => setBody(event.target.value)}
              />
            </div>
            {error && (
              <p id="help-form-error" className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button-primary" type="submit">
              {mode === "demo"
                ? "Simpan permintaan bantuan"
                : "Kanal bantuan belum terhubung"}
            </button>
          </form>
          <section className="plain-panel mt-5">
            <h2 className="panel-title">
              {user.role === "admin"
                ? "Permintaan bantuan masuk"
                : "Riwayat bantuanmu"}
            </h2>
            {requests.map((row) => (
              <article className="py-4 border-b border-slate-200" key={row.id}>
                <h3 className="font-semibold">{row.topic}</h3>
                <p className="text-sm text-slate-600 mt-1">
                  {row.ownerName} ·{" "}
                  {row.status === "open"
                    ? "Menunggu tanggapan"
                    : row.status === "answered"
                      ? "Sudah ditanggapi"
                      : "Ditutup"}
                </p>
                <p className="mt-2">{row.body}</p>
                {row.messages.map((message, index) => (
                  <p
                    key={index}
                    className="mt-3 border-l-2 border-slate-200 pl-3"
                  >
                    <strong>{message.by}:</strong> {message.text}
                  </p>
                ))}
                {row.status !== "closed" && (
                  <button
                    className="text-link min-h-[44px] mt-2"
                    type="button"
                    onClick={() => {
                      setSelected(row.id);
                      setAnswer("");
                    }}
                  >
                    Tanggapi bantuan
                  </button>
                )}
                {selected === row.id && (
                  <form
                    className="auth-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      try {
                        reply(row.id, answer, user.role === "admin");
                        if (user.role === "admin" && row.applicationId)
                          resolveReviewEscalation(row.applicationId, answer);
                        setSelected("");
                        setAnswer("");
                        setError("");
                      } catch (cause) {
                        setError(
                          cause instanceof Error
                            ? cause.message
                            : "Tanggapan belum disimpan.",
                        );
                      }
                    }}
                  >
                    <div className="form-field">
                      <label htmlFor="help-reply">Tanggapan</label>
                      <textarea
                        id="help-reply"
                        rows={3}
                        maxLength={2000}
                        value={answer}
                        onChange={(event) => setAnswer(event.target.value)}
                      />
                    </div>
                    {error && (
                      <p role="alert" className="form-error">
                        {error}
                      </p>
                    )}
                    <button type="submit" className="button-primary">
                      {user.role === "admin"
                        ? "Kirim tanggapan & selesaikan"
                        : "Kirim tanggapan"}
                    </button>
                  </form>
                )}
              </article>
            ))}
            {!requests.length && (
              <p className="text-sm text-slate-600 mt-3">
                Belum ada permintaan bantuan.
              </p>
            )}
          </section>
        </>
      )}
      <button
        type="button"
        className="text-link min-h-[44px] mt-4"
        onClick={() => navigate("/kebutuhan")}
      >
        Kembali memilih kebutuhan →
      </button>
    </>
  );
  return user ? (
    <WorkspaceLayout title="Bantuan petugas">{content}</WorkspaceLayout>
  ) : (
    <>
      <Navbar />
      <main className="page-width py-8" id="main-content" tabIndex={-1}>
        <h1 className="text-3xl font-semibold mb-4">Bantuan dan panduan</h1>
        {content}
      </main>
      <Footer />
    </>
  );
}
