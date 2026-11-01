import { useState, useId } from "react";
import { useApp } from "../context/AppContext";
import { getStoredFileBlob } from "../utils/fileStorage";
export function ReuseDocument({ onReady }: { onReady: (file: File) => void }) {
  const fieldId = "reuse-" + useId();
  const { preparations, activePreparation } = useApp(),
    [selected, setSelected] = useState(""),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const sources = preparations
    .filter((prep) => prep.id !== activePreparation.id)
    .flatMap((prep) =>
      prep.documents
        .filter((doc) => doc.status === "TERUNGGAH" && doc.previewKey)
        .map((doc) => ({ prep, doc, key: prep.id + ":" + doc.id })),
    );
  if (!sources.length) return null;
  return (
    <details className="mt-3">
      <summary className="cursor-pointer min-h-[44px] py-2 text-sm text-[#17324D]">
        Gunakan berkas dari persiapan milik saya
      </summary>
      <div className="form-field mt-2">
        <label htmlFor={fieldId}>Berkas tersimpan pada akun ini</label>
        <select
          id={fieldId}
          value={selected}
          onChange={(event) => {
            setSelected(event.target.value);
            setConfirmed(false);
          }}
        >
          <option value="">Pilih berkas</option>
          {sources.map((item) => (
            <option key={item.key} value={item.key}>
              {item.prep.internalReference} · {item.doc.name} ·{" "}
              {item.doc.fileName}
            </option>
          ))}
        </select>
      </div>
      <label className="consent-field mt-2">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          Berkas ini masih berlaku dan sesuai untuk orang serta persyaratan yang
          sedang diurus.
        </span>
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <button
        type="button"
        className="button-secondary mt-2"
        disabled={!selected || !confirmed || busy}
        onClick={() => {
          void (async () => {
            setBusy(true);
            try {
              const source = sources.find((item) => item.key === selected);
              if (!source) throw new Error("Pilih berkas yang tersedia.");
              const blob = await getStoredFileBlob(source.doc.previewKey);
              if (!blob)
                throw new Error(
                  "Isi berkas tidak lagi tersedia. Pilih ulang dari perangkat.",
                );
              onReady(
                new File([blob], source.doc.fileName, { type: blob.type }),
              );
              setError("");
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Berkas belum bisa digunakan.",
              );
            } finally {
              setBusy(false);
            }
          })();
        }}
      >
        Gunakan salinan berkas
      </button>
    </details>
  );
}
