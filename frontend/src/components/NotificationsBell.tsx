import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useApp } from "../context/AppContext";
import { useUserPreferences } from "../preferences/context";
import { useOperationStore, writeOperationStore } from "../utils/operations";
import { useHelpRequests } from "../features/help";
import { request } from "../api/transport";

interface ApiNotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  target_path: string | null;
  related_resource: { type: string; id: string } | null;
  is_read: boolean;
  created_at: string;
}

const EMPTY: Record<string, boolean> = {};

export function NotificationsBell() {
  const { user, mode } = useAuth();
  const { applications } = useApp();
  const { preferences } = useUserPreferences();
  const { requests } = useHelpRequests();
  const [open, setOpen] = useState(false);

  const [apiNotifications, setApiNotifications] = useState<ApiNotificationItem[]>([]);
  const key = "daftarin:" + (user?.id || "guest") + ":notification-read:v1";
  const read = useOperationStore(key, EMPTY);

  const fetchApiNotifications = useCallback(async () => {
    if (mode !== "api" || !user || user.role !== "warga") return;
    try {
      const res = await request<{ data: ApiNotificationItem[] }>("/notifications");
      setApiNotifications(Array.isArray(res) ? res : res.data || []);
    } catch {
      // ignore notification load error silently
    }
  }, [mode, user]);

  useEffect(() => {
    if (mode === "api") {
      void fetchApiNotifications();
    }
  }, [fetchApiNotifications, mode]);

  if (!user || !preferences.notify_in_app) return null;

  const updates =
    mode === "api" && user.role === "warga" && apiNotifications.length > 0
      ? apiNotifications.map((n) => ({
          id: n.id,
          title: n.title + (n.body ? ` · ${n.body}` : ""),
          at: n.created_at,
          href: n.target_path || (n.related_resource ? `/pelacakan/${n.related_resource.id}` : "/pelacakan"),
          isRead: n.is_read || Boolean(read[n.id]),
        }))
      : [
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
                isRead: Boolean(read[app.id + "-" + event.id]),
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
              isRead: Boolean(
                read[
                  "help-" +
                    row.id +
                    "-" +
                    (user.role === "admin"
                      ? row.messages.length
                      : row.messages.filter((message) => message.role === "admin")
                          .length)
                ],
              ),
            })),
        ]
          .sort((a, b) => (Date.parse(b.at) || 0) - (Date.parse(a.at) || 0))
          .slice(0, 20);

  const unread = updates.filter((item) => !item.isRead).length;

  const markAllRead = async () => {
    if (mode === "api" && user.role === "warga") {
      try {
        await request<void>("/notifications/read-all", { method: "POST" });
        await fetchApiNotifications();
      } catch {
        // fallback to local mark
      }
    }
    writeOperationStore(key, {
      ...read,
      ...Object.fromEntries(updates.map((item) => [item.id, true])),
    });
  };

  const markSingleRead = async (id: string) => {
    if (mode === "api" && user.role === "warga" && !id.includes("-")) {
      try {
        await request<void>(`/notifications/${encodeURIComponent(id)}/read`, {
          method: "POST",
        });
        await fetchApiNotifications();
      } catch {
        // fallback
      }
    }
    writeOperationStore(key, { ...read, [id]: true });
    setOpen(false);
  };

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
              onClick={markAllRead}
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
                  onClick={() => markSingleRead(item.id)}
                >
                  {!item.isRead && <strong>Baru · </strong>}
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
