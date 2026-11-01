import { useState, type FormEvent } from "react";
import { useUserPreferences } from "../../preferences/context";
import { useApp } from "../../context/AppContext";
import type { AccountPreferences } from "../../api/account";
function PreferenceForm({
  kind,
  initial,
}: {
  kind: "display" | "notifications";
  initial: AccountPreferences;
}) {
  const { save, isSaving } = useUserPreferences();
  const { showToast } = useApp();
  const [draft, setDraft] = useState(initial);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      await save(draft);
      showToast("Setelan disimpan.");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Setelan belum tersimpan.",
      );
    }
  };
  return (
    <form className="auth-form" onSubmit={submit}>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {kind === "display" ? (
        <>
          <fieldset>
            <legend>Ukuran teks</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {[
                ["normal", "Biasa"],
                ["large", "Lebih besar"],
              ].map(([value, label]) => (
                <label
                  key={value}
                  className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-slate-300 p-3"
                >
                  <input
                    type="radio"
                    name="font-size"
                    value={value}
                    checked={draft.font_size === value}
                    onChange={() =>
                      setDraft((previous) => ({
                        ...previous,
                        font_size: value as "normal" | "large",
                      }))
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="consent-field">
            <input
              type="checkbox"
              checked={draft.high_contrast}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  high_contrast: event.target.checked,
                }))
              }
            />
            <span>
              Gunakan kontras lebih tinggi
              <span className="field-hint block">
                Memperjelas teks pendukung dan batas isian.
              </span>
            </span>
          </label>
        </>
      ) : (
        <label className="consent-field">
          <input
            type="checkbox"
            checked={draft.notify_in_app}
            onChange={(event) =>
              setDraft((previous) => ({
                ...previous,
                notify_in_app: event.target.checked,
              }))
            }
          />
          <span>
            Notifikasi perubahan urusan di aplikasi
            <span className="field-hint block">
              Riwayat pengurusan dan permintaan perbaikan tetap tersedia di
              dashboard serta pelacakan.
            </span>
          </span>
        </label>
      )}
      <button className="button-primary" disabled={isSaving}>
        {isSaving ? "Menyimpan…" : "Simpan setelan"}
      </button>
    </form>
  );
}
export function PreferenceSettings({
  kind,
}: {
  kind: "display" | "notifications";
}) {
  const { preferences, isLoading, error, reload } = useUserPreferences();
  return (
    <section className="plain-panel max-w-3xl">
      <h2 className="panel-title">
        {kind === "display" ? "Tampilan yang nyaman dibaca" : "Notifikasi akun"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {kind === "display"
          ? "Setelan diterapkan setelah disimpan dan mengikuti akunmu."
          : "Atur pemberitahuan di aplikasi. Pengiriman email belum terhubung."}
      </p>
      {isLoading ? (
        <p className="mt-4" role="status">
          Memuat setelan…
        </p>
      ) : error ? (
        <div className="mt-4">
          <p className="form-error" role="alert">
            {error}
          </p>
          <button
            className="button-secondary mt-3"
            type="button"
            onClick={() => void reload()}
          >
            Muat ulang setelan
          </button>
        </div>
      ) : (
        <PreferenceForm
          key={kind + JSON.stringify(preferences)}
          kind={kind}
          initial={preferences}
        />
      )}
    </section>
  );
}
