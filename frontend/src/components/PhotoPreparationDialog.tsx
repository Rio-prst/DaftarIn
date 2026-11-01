import { useEffect, useRef, useState } from "react";
export function PhotoPreparationDialog({
  file,
  onReady,
  onClose,
}: {
  file: File;
  onReady: (file: File) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null),
    canvas = useRef<HTMLCanvasElement>(null),
    [angle, setAngle] = useState(0),
    [ready, setReady] = useState<File | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(true),
    [confirmed, setConfirmed] = useState(false);
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
  useEffect(() => {
    let alive = true;
    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
        "image/heif",
      ].includes(file.type) ||
      file.size > 30 * 1024 * 1024
    ) {
      setBusy(false);
      setReady(null);
      setError(
        "Pilih foto JPG, PNG, WebP atau HEIC/HEIF hingga 30 MB. Ekspor dari galeri atau ambil foto baru bila format belum didukung.",
      );
      return;
    }
    const url = URL.createObjectURL(file),
      image = new Image();
    setBusy(true);
    setReady(null);
    setConfirmed(false);
    image.onload = () => {
      void (async () => {
        try {
          if (
            file.size > 30 * 1024 * 1024 ||
            image.naturalWidth * image.naturalHeight > 40_000_000
          )
            throw new Error(
              "Foto terlalu besar untuk diproses di perangkat. Pilih foto beresolusi lebih rendah atau ambil foto baru.",
            );
          const scale = Math.min(
              1,
              2200 / Math.max(image.naturalWidth, image.naturalHeight),
            ),
            w = Math.round(image.naturalWidth * scale),
            h = Math.round(image.naturalHeight * scale),
            rotated = angle % 180 !== 0,
            target = canvas.current;
          if (!target || !alive) return;
          target.width = rotated ? h : w;
          target.height = rotated ? w : h;
          const ctx = target.getContext("2d");
          if (!ctx)
            throw new Error(
              "Pratinjau tidak tersedia. Gunakan foto JPG dari perangkat.",
            );
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, target.width, target.height);
          ctx.translate(target.width / 2, target.height / 2);
          ctx.rotate((angle * Math.PI) / 180);
          ctx.drawImage(image, -w / 2, -h / 2, w, h);
          const blob = await new Promise<Blob | null>((resolve) =>
            target.toBlob(resolve, "image/jpeg", 0.85),
          );
          if (!blob || blob.size > 5 * 1024 * 1024)
            throw new Error(
              "Hasil masih terlalu besar. Pilih foto beresolusi lebih rendah.",
            );
          if (alive) {
            setReady(
              new File(
                [blob],
                file.name.replace(/\.[^.]+$/, "") + "-siap.jpg",
                { type: "image/jpeg" },
              ),
            );
            setError("");
          }
        } catch (cause) {
          if (alive)
            setError(
              cause instanceof Error
                ? cause.message
                : "Foto belum dapat diproses.",
            );
        } finally {
          if (alive) setBusy(false);
        }
      })();
    };
    image.onerror = () => {
      if (alive) {
        setBusy(false);
        setError(
          "Format foto ini belum bisa dibaca oleh browser. Ekspor sebagai JPG/PNG di galeri, atau gunakan tombol Ambil foto. Berkas lama tetap dipertahankan.",
        );
      }
    };
    image.src = url;
    return () => {
      alive = false;
      URL.revokeObjectURL(url);
    };
  }, [file, angle]);
  return (
    <dialog
      ref={dialog}
      className="photo-dialog"
      aria-labelledby="photo-heading"
      onCancel={onClose}
    >
      <h2 id="photo-heading" className="text-xl font-semibold">
        Siapkan foto dokumen
      </h2>
      <p className="text-sm mt-2">
        Periksa seluruh sudut, tulisan dan bagian pengesahan. Versi asli di
        galeri tidak diubah. Penyiapan foto tidak menyatakan isi dokumen sudah
        benar.
      </p>
      <p className="text-sm mt-2">
        Ukuran awal {(file.size / 1024 / 1024).toFixed(2)} MB
        {ready
          ? " · hasil " + (ready.size / 1024 / 1024).toFixed(2) + " MB"
          : ""}
      </p>
      {busy && <p role="status">Menyiapkan pratinjau…</p>}
      <canvas
        ref={canvas}
        className="w-full max-h-[45dvh] object-contain mt-4"
        aria-label="Pratinjau foto setelah diputar dan diperkecil"
      />
      {error && (
        <p className="form-error mt-3" role="alert">
          {error}
        </p>
      )}
      <button
        type="button"
        className="button-secondary mt-3"
        disabled={busy || !ready}
        onClick={() => setAngle((angle + 90) % 360)}
      >
        Putar foto 90°
      </button>
      <label className="consent-field mt-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) => setConfirmed(event.target.checked)}
        />
        <span>
          Saya sudah melihat pratinjau dan semua bagian dokumen terlihat.
        </span>
      </label>
      <div className="flex flex-wrap gap-3 mt-4">
        <button
          type="button"
          className="button-primary"
          disabled={busy || !ready || !confirmed}
          onClick={() => ready && onReady(ready)}
        >
          Gunakan foto ini
        </button>
        <button type="button" className="button-secondary" onClick={onClose}>
          Batal menyiapkan foto
        </button>
      </div>
    </dialog>
  );
}
