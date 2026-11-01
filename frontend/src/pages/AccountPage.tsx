import { clearLocalDevice } from "../utils/device";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { WorkspaceTabs } from "../components/WorkspaceTabs";
import { ProfileSettings } from "../components/account/ProfileSettings";
import { SecuritySettings } from "../components/account/SecuritySettings";
import { PreferenceSettings } from "../components/account/PreferenceSettings";
const tabs = [
  { value: "profile", label: "Profil" },
  { value: "security", label: "Keamanan" },
  { value: "display", label: "Tampilan" },
  { value: "notifications", label: "Notifikasi" },
];
export function AccountPage() {
  const { user, logout, mode } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [clearConfirmed, setClearConfirmed] = useState(false);
  const [clearError, setClearError] = useState("");
  const [tab, setTab] = useState("profile");
  const [leaving, setLeaving] = useState(false);
  if (!user) return null;
  return (
    <WorkspaceLayout
      title="Pengaturan akun"
      description="Kelola profil, keamanan, dan kenyamanan penggunaan akunmu."
    >
      <WorkspaceTabs
        items={tabs}
        value={tab}
        onChange={setTab}
        prefix="account"
        label="Pengaturan akun"
      />
      {user.role === "warga" && (
        <Link
          className="text-link inline-flex min-h-[44px] items-center mb-4"
          to="/keluarga"
        >
          Kelola data keluarga →
        </Link>
      )}
      <section
        id="account-panel"
        role="tabpanel"
        aria-labelledby={"account-tab-" + tab}
      >
        {tab === "profile" && <ProfileSettings key={user.id} />}
        {tab === "security" && <SecuritySettings />}
        {(tab === "display" || tab === "notifications") && (
          <PreferenceSettings kind={tab} />
        )}
      </section>
      <details className="plain-panel mt-6">
        <summary className="min-h-[44px] cursor-pointer font-medium">
          Memakai perangkat bersama?
        </summary>
        <p className="text-sm mt-3">
          Keluar dari akun setelah selesai. Jika perlu, bersihkan semua salinan
          DaftarIn pada browser ini: draf, profil keluarga, berkas, percakapan
          bantuan, dan akun contoh. Akun serta riwayat pada server tidak ikut
          dihapus. Tutup tab DaftarIn lain dahulu.
        </p>
        <label className="consent-field mt-3">
          <input
            type="checkbox"
            checked={clearConfirmed}
            onChange={(event) => setClearConfirmed(event.target.checked)}
          />
          <span>
            Saya memahami seluruh data lokal DaftarIn pada perangkat ini akan
            dibersihkan.
          </span>
        </label>
        {clearError && (
          <p className="form-error" role="alert">
            {clearError}
          </p>
        )}
        <button
          type="button"
          className="button-secondary mt-3"
          disabled={!clearConfirmed || leaving}
          onClick={() => {
            void (async () => {
              setLeaving(true);
              try {
                sessionStorage.setItem("daftarin:clearing-device", "1");
                window.dispatchEvent(new Event("daftarin-device-clear"));
                await logout();
                await clearLocalDevice();
              } catch (cause) {
                setClearError(
                  cause instanceof Error
                    ? cause.message
                    : "Belum dapat membersihkan perangkat.",
                );
                sessionStorage.removeItem("daftarin:clearing-device");
                localStorage.setItem(
                  "daftarin:device-cleared",
                  String(Date.now()),
                );
                window.location.replace("/?deviceClearFailed=1#/masuk");
                setLeaving(false);
              }
            })();
          }}
        >
          Keluar dan bersihkan perangkat
        </button>
      </details>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-5">
        <p className="text-sm text-slate-600">
          {mode === "api"
            ? "Akun terhubung ke server."
            : "Akun contoh dan setelannya tersimpan di browser ini."}{" "}
          <Link to="/privasi" className="text-link">
            Penggunaan data
          </Link>
        </p>
        <button
          className="button-secondary"
          type="button"
          disabled={leaving}
          onClick={async () => {
            setLeaving(true);
            try {
              await logout("/");
              navigate("/", { replace: true });
            } catch (cause) {
              showToast(
                cause instanceof Error
                  ? cause.message
                  : "Belum berhasil keluar.",
                "error",
              );
            } finally {
              setLeaving(false);
            }
          }}
        >
          {leaving ? "Sedang keluar…" : "Keluar dari akun"}
        </button>
      </div>
    </WorkspaceLayout>
  );
}
export default AccountPage;
