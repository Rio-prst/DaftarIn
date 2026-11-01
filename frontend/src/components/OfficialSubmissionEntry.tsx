import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

export function OfficialSubmissionEntry() {
  const {
    preparations,
    applications,
    addApplication,
    recordOfficialSubmission,
  } = useApp();
  const drafts = preparations.filter(
    (prep) => prep.id !== "prep-draft-uninitialized",
  );
  const [open, setOpen] = useState(false);
  const [prepId, setPrepId] = useState("");
  const [channel, setChannel] = useState("");
  const [receipt, setReceipt] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const prep = drafts.find((item) => item.id === prepId);
    if (!prep || !channel.trim()) {
      setError("Pilih persiapan dan isi loket atau portal tempat mengajukan.");
      return;
    }
    try {
      const existing =
        applications.find((item) => item.id === prep.linkedApplicationId) ||
        applications.find((item) => item.preparation_id === prep.id);
      let id = existing?.id;
      if (existing) recordOfficialSubmission(existing.id, receipt, channel, "");
      else {
        id = "CITIZEN-" + crypto.randomUUID();
        const now = new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        });
        addApplication(
          {
            id,
            service_id: prep.serviceId,
            service_name: prep.serviceName,
            official_number: receipt.trim(),
            channel: channel.trim(),
            applicant_name: prep.formData.nama_lengkap || "Belum diisi",
            applicant_nik: prep.formData.nik,
            current_status: "DICATAT_WARGA",
            created_at: now,
            events: [
              {
                id: Date.now(),
                status: "DICATAT_WARGA",
                title: "Pengajuan di instansi dicatat oleh warga",
                time: now,
                source: "Dilaporkan warga",
                source_type: "citizen",
                notes: "Diajukan melalui " + channel.trim(),
                completed: true,
                current: true,
              },
            ],
          },
          prep.id,
        );
      }
      setOpen(false);
      setReceipt("");
      setChannel("");
      navigate("/pelacakan/" + encodeURIComponent(id!));
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Catatan belum tersimpan.",
      );
    }
  };
  return (
    <div className="mb-5">
      <button
        type="button"
        className="text-link min-h-[44px]"
        aria-expanded={open}
        aria-controls="official-entry"
        onClick={() => setOpen(!open)}
      >
        {open
          ? "Tutup pencatatan pengajuan"
          : "Sudah mengajukan di instansi? Catat pengajuan"}
      </button>
      {open && (
        <section id="official-entry" className="plain-panel mt-2 max-w-2xl">
          <h2 className="panel-title">Catat pengajuan di instansi</h2>
          <p className="text-sm text-slate-600 mt-2">
            Gunakan setelah mengajukan melalui loket atau portal resmi. Catatan
            ini berasal darimu dan belum dikonfirmasi oleh instansi.
          </p>
          {!drafts.length ? (
            <Link
              to="/katalog"
              className="text-link inline-flex min-h-[44px] items-center mt-3"
            >
              Pilih layanan dan buat persiapan terlebih dahulu →
            </Link>
          ) : (
            <form className="auth-form mt-4" onSubmit={submit}>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <div className="form-field">
                <label htmlFor="official-prep">Persiapan yang diajukan</label>
                <select
                  id="official-prep"
                  value={prepId}
                  required
                  onChange={(event) => setPrepId(event.target.value)}
                >
                  <option value="">Pilih persiapan</option>
                  {drafts.map((prep) => (
                    <option key={prep.id} value={prep.id}>
                      {prep.serviceName} · {prep.internalReference}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="official-channel">
                  Loket atau portal resmi
                </label>
                <input
                  id="official-channel"
                  value={channel}
                  required
                  maxLength={200}
                  onChange={(event) => setChannel(event.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="official-receipt">
                  Nomor tanda terima (jika sudah diterbitkan)
                </label>
                <input
                  id="official-receipt"
                  value={receipt}
                  maxLength={160}
                  onChange={(event) => setReceipt(event.target.value)}
                />
              </div>
              <button className="button-primary">
                Simpan catatan pengajuan
              </button>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
