import { EXAMPLE_ACCOUNTS } from "../auth/mockAuth";

const RESET_KEY = "daftarin:demo-empty-start:2026-11-01";

/** One-time cleanup of this local development demo, preserving user accounts. */
export async function prepareCleanLocalDemo(): Promise<void> {
  if (!import.meta.env.DEV || import.meta.env.VITE_AUTH_MODE === "api") return;

  const reset = async () => {
    if (localStorage.getItem(RESET_KEY) === "done") return;

    // Pause old tabs so stale state cannot be written back during cleanup.
    window.dispatchEvent(new Event("daftarin-device-clear"));
    localStorage.setItem("daftarin:device-clear", String(Date.now()));
    
    // Preserve existing accounts if present, so password changes and registrations persist
    const existingAccounts = localStorage.getItem("daftarin:accounts:v1");

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("daftarin:") && key !== "daftarin:accounts:v1") {
        localStorage.removeItem(key);
      }
    }
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("daftarin:")) sessionStorage.removeItem(key);
    }

    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase("daftarin_file_storage_v1");
      const timeout = window.setTimeout(() => reject(new Error(
        "Tutup tab DaftarIn lain, lalu muat ulang untuk menyelesaikan reset berkas demo."
      )), 12000);
      request.onsuccess = () => { clearTimeout(timeout); resolve(); };
      request.onerror = () => { clearTimeout(timeout); reject(new Error("Berkas demo belum dapat dibersihkan. Muat ulang untuk mencoba lagi.")); };
    });

    if (!existingAccounts) {
      localStorage.setItem("daftarin:accounts:v1", JSON.stringify(EXAMPLE_ACCOUNTS));
    }
    localStorage.setItem("daftarin:applications:v1", "[]");
    for (const account of EXAMPLE_ACCOUNTS)
      localStorage.setItem("daftarin:" + account.id + ":preparations:v3", "[]");
    localStorage.setItem(RESET_KEY, "done");
    localStorage.setItem("daftarin:device-cleared", String(Date.now()));
  };

  if (navigator.locks) await navigator.locks.request(RESET_KEY, reset);
  else await reset();

  // sessionStorage belongs to each tab, so every existing tab must clear its
  // own old login, pending intent and chat after the shared reset completes.
  if (sessionStorage.getItem(RESET_KEY) !== "done") {
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith("daftarin:")) sessionStorage.removeItem(key);
    sessionStorage.setItem(RESET_KEY, "done");
  }
}
