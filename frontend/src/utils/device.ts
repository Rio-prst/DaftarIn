export async function clearLocalDevice() {
  sessionStorage.setItem("daftarin:clearing-device", "1");
  window.dispatchEvent(new Event("daftarin-device-clear"));
  localStorage.setItem("daftarin:device-clear", String(Date.now()));
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase("daftarin_file_storage_v1");
    const timeout = setTimeout(
      () =>
        reject(
          new Error(
            "Tutup tab DaftarIn lain dan coba lagi; penyimpanan berkas masih dipakai.",
          ),
        ),
      8000,
    );
    request.onsuccess = () => {
      clearTimeout(timeout);
      resolve();
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(new Error("Berkas lokal belum dapat dibersihkan."));
    };
  });
  for (const key of Object.keys(localStorage))
    if (key.startsWith("daftarin:")) localStorage.removeItem(key);
  for (const key of Object.keys(sessionStorage))
    if (key.startsWith("daftarin:")) sessionStorage.removeItem(key);
  localStorage.setItem("daftarin:device-cleared", String(Date.now()));
  window.location.replace("/?deviceCleared=1#/masuk");
}
