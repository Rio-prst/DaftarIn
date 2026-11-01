import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { useUserPreferences } from "../preferences/context";
import { useOperationStore, writeOperationStore } from "../utils/operations";
import { useHelpRequests } from "../features/help";
const EMPTY: Record<string, boolean> = {};
export function NotificationsBell() {
  const { user, mode } = useAuth(),
    { applications } = useApp(),
    { preferences } = useUserPreferences(),
    { requests } = useHelpRequests(),
    [open, setOpen] = useState(false);
  const key = "daftarin:" + (user?.id || "guest") + ":notification-read:v1",
    read = useOperationStore(key, EMPTY);
  if (!user || mode === "api" || !preferences.notify_in_app) return null;
  const updates = [
    ...applications.flatMap((app) =>
      app.events
        .filter((event) =>
          user.role === "warga"
            ? event.source_type === "officer" || event.source_type === "admin"
            : event.source_type === "citizen",
        )
        .slice(-3)
        .map((event) => ({
          id: app.id + "-" + event.id,
          title: app.service_name + " · " + event.title,
          at: event.time,
          href:
            user.role === "admin"
              ? "/admin/penugasan"
              : (user.role === "warga" ? "/pelacakan/" : "/petugas/") +
                encodeURIComponent(app.id),
        })),
    ),
    ...requests
      .filter((row) =>
        user.role === "admin"
          ? row.status === "open"
          : row.messages.some((message) => message.role === "admin"),
      )
      .map((row) => ({
        id:
          "help-" +
          row.id +
          "-" +
          (user.role === "admin"
            ? row.messages.length
            : row.messages.filter((message) => message.role === "admin")
                .length),
        at:
          [...row.messages]
            .reverse()
            .find(
              (message) => user.role === "admin" || message.role === "admin",
            )?.at || row.createdAt,
        title:
          row.topic +
          " · " +
          (user.role === "admin"
            ? "Memerlukan tanggapan"
            : "Ada tanggapan bantuan"),
        href: user.role === "admin" ? "/admin/bantuan" : "/bantuan",
      })),
  ]
    .sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0))
    .slice(0, 20);
  const unread = updates.filter((item) => !read[item.id]).length;
  return (
    <div className="relative">
      <button
        type="button"
        className="display-control"
        aria-label={`Notifikasi, ${unread} belum dibaca`}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          notifications
        </span>
        {unread > 0 && <span className="text-xs">{unread}</span>}
      </button>
      {open && (
        <section className="notification-panel" aria-label="Pemberitahuan">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="font-semibold">Pemberitahuan</h2>
            <button
              className="text-link min-h-[44px] text-sm"
              type="button"
              onClick={() =>
                writeOperationStore(key, {
                  ...read,
                  ...Object.fromEntries(updates.map((item) => [item.id, true])),
                })
              }
            >
              Tandai semua dibaca
            </button>
          </div>
          <ul>
            {updates.map((item) => (
              <li key={item.id} className="border-t border-slate-200 py-3">
                <Link
                  className="block text-sm min-h-[44px]"
                  to={item.href}
                  onClick={() => {
                    writeOperationStore(key, { ...read, [item.id]: true });
                    setOpen(false);
                  }}
                >
                  {!read[item.id] && <strong>Baru · </strong>}
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          {!updates.length && (
            <p className="text-sm py-3">
              Belum ada perubahan yang perlu diberitahukan.
            </p>
          )}
          <button
            className="text-link min-h-[44px]"
            type="button"
            onClick={() => setOpen(false)}
          >
            Tutup pemberitahuan
          </button>
        </section>
      )}
    </div>
  );
}
