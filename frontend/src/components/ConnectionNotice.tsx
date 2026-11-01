import { useEffect, useState } from "react";
export function ConnectionNotice() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online ? null : (
    <p role="status" className="connection-notice">
      Koneksi terputus. Isian yang tersimpan di perangkat tetap ada. Hubungkan
      kembali sebelum mengirim atau meminta jawaban AI.
    </p>
  );
}
