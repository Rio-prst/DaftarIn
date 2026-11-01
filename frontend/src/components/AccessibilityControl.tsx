import { useState, useRef } from "react";
import { useUserPreferences } from "../preferences/context";
export function AccessibilityControl() {
  const { preferences, save, isSaving } = useUserPreferences();
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState("");
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="display-control"
        aria-label="Atur tampilan"
        onClick={() => dialog.current?.showModal()}
      >
        <span aria-hidden="true">Aa</span>
        <span className="sr-only">Atur tampilan</span>
      </button>
      <dialog
        ref={dialog}
        className="accessibility-dialog"
        aria-labelledby="display-heading"
        onClose={() => trigger.current?.focus()}
      >
        <h2 id="display-heading" className="text-xl font-semibold">
          Tampilan yang nyaman
        </h2>
        <p className="text-sm mt-2">
          Bisa diatur sebelum masuk. Setelan ini mengikuti perangkat atau akun
          yang sedang dipakai.
        </p>
        <div className="form-field mt-4">
          <label htmlFor="global-text-size">Ukuran teks</label>
          <select
            id="global-text-size"
            disabled={isSaving}
            value={preferences.font_size}
            onChange={(event) => {
              void save({
                ...preferences,
                font_size: event.target.value as "normal" | "large",
              }).catch(() => setError("Setelan belum tersimpan."));
            }}
          >
            <option value="normal">Biasa</option>
            <option value="large">Lebih besar</option>
          </select>
        </div>
        <label className="consent-field mt-4">
          <input
            type="checkbox"
            checked={preferences.high_contrast}
            disabled={isSaving}
            onChange={(event) => {
              void save({
                ...preferences,
                high_contrast: event.target.checked,
              }).catch(() => setError("Setelan belum tersimpan."));
            }}
          />
          <span>Kontras lebih tinggi</span>
        </label>
        {error && <p role="alert">{error}</p>}
        <button
          type="button"
          className="button-primary mt-4"
          onClick={() => dialog.current?.close()}
        >
          Selesai mengatur tampilan
        </button>
      </dialog>
    </>
  );
}
