import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useOperationStore, writeOperationStore } from "../utils/operations";
import { request } from "../api/transport";

export interface HelpRequest {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerRole: string;
  topic: string;
  body: string;
  applicationId?: string;
  status: "open" | "answered" | "closed";
  createdAt: string;
  messages: { by: string; role: string; text: string; at: string }[];
}

interface ApiHelpRequestItem {
  id: string;
  topic: string;
  category: string;
  status: string;
  application_id: string | null;
  preparation_id: string | null;
  created_at: string;
  updated_at: string;
  reply_count: number;
}

interface ApiHelpRequestDetail extends ApiHelpRequestItem {
  replies: Array<{
    id: string;
    sender_id: string;
    sender_name: string;
    sender_role: string;
    message: string;
    created_at: string;
  }>;
}

const EMPTY: HelpRequest[] = [];

export function useHelpRequests() {
  const { user, mode } = useAuth();
  const allLocal = useOperationStore("daftarin:help:v1", EMPTY);

  const allowedLocal = allLocal.filter(
    (item) => user && (user.role === "admin" || item.ownerId === user.id),
  );

  const [apiRequests, setApiRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(mode === "api");
  const [error, setError] = useState<string | null>(null);

  const fetchApiRequests = useCallback(async () => {
    if (mode !== "api" || !user) return;
    setLoading(true);
    setError(null);
    try {
      const items = await request<ApiHelpRequestItem[]>("/help-requests");
      // Fetch details with replies for each item
      const detailed = await Promise.all(
        items.map(async (item) => {
          try {
            const detail = await request<ApiHelpRequestDetail>(
              `/help-requests/${encodeURIComponent(item.id)}`,
            );
            const firstMsg = detail.replies[0]?.message || item.topic;
            const messages = detail.replies.map((r) => ({
              by: r.sender_name,
              role: r.sender_role,
              text: r.message,
              at: r.created_at,
            }));
            const mappedStatus: "open" | "answered" | "closed" =
              detail.status === "closed"
                ? "closed"
                : detail.replies.some((r) => r.sender_role === "admin")
                  ? "answered"
                  : "open";

            return {
              id: detail.id,
              ownerId: detail.replies[0]?.sender_id || user.id,
              ownerName: detail.replies[0]?.sender_name || user.name,
              ownerRole: detail.replies[0]?.sender_role || "warga",
              topic: detail.topic,
              body: firstMsg,
              applicationId: detail.application_id || undefined,
              status: mappedStatus,
              createdAt: detail.created_at,
              messages,
            };
          } catch {
            return {
              id: item.id,
              ownerId: user.id,
              ownerName: user.name,
              ownerRole: user.role,
              topic: item.topic,
              body: item.topic,
              applicationId: item.application_id || undefined,
              status: (item.status === "closed"
                ? "closed"
                : item.reply_count > 1
                  ? "answered"
                  : "open") as "open" | "answered" | "closed",
              createdAt: item.created_at,
              messages: [],
            };
          }
        }),
      );
      setApiRequests(detailed);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal memuat bantuan dari server.",
      );
    } finally {
      setLoading(false);
    }
  }, [mode, user]);

  useEffect(() => {
    if (mode === "api") {
      void fetchApiRequests();
    }
  }, [fetchApiRequests, mode]);

  const requests = mode === "api" ? apiRequests : allowedLocal;

  return {
    requests,
    loading,
    error,
    reload: fetchApiRequests,
    create: async (input: {
      topic: string;
      body: string;
      applicationId?: string;
    }) => {
      if (!user)
        throw new Error(
          "Masuk dengan akun pengurus untuk menyimpan permintaan bantuan.",
        );

      if (input.body.trim().length < 10)
        throw new Error(
          "Jelaskan pertanyaan atau kendala minimal 10 karakter.",
        );
      if (/\b(?:\d[ -]?){16}\b/.test(input.body))
        throw new Error(
          "Jangan menyertakan NIK atau nomor KK di pertanyaan. Gunakan nomor persiapan sebagai rujukan.",
        );

      if (mode === "api") {
        const created = await request<ApiHelpRequestDetail>("/help-requests", {
          method: "POST",
          body: {
            topic: input.topic.trim(),
            category: "general",
            message: input.body.trim(),
            application_id: input.applicationId || undefined,
          },
        });
        await fetchApiRequests();
        const row: HelpRequest = {
          id: created.id,
          ownerId: user.id,
          ownerName: user.name,
          ownerRole: user.role,
          topic: created.topic,
          body: input.body.trim(),
          applicationId: created.application_id || undefined,
          status: "open",
          createdAt: created.created_at,
          messages: [
            {
              by: user.name,
              role: user.role,
              text: input.body.trim(),
              at: created.created_at,
            },
          ],
        };
        return row;
      }

      const row: HelpRequest = {
        id: crypto.randomUUID(),
        ownerId: user.id,
        ownerName: user.name,
        ownerRole: user.role,
        ...input,
        body: input.body.trim(),
        status: "open",
        createdAt: new Date().toISOString(),
        messages: [],
      };
      writeOperationStore("daftarin:help:v1", [row, ...allLocal]);
      return row;
    },
    reply: async (id: string, text: string, close = false) => {
      if (!user) throw new Error("Masuk kembali.");
      const row = requests.find((item) => item.id === id);
      if (!row) throw new Error("Permintaan bantuan tidak tersedia.");

      if (text.trim().length < 5)
        throw new Error("Tuliskan tanggapan minimal 5 karakter.");

      if (mode === "api") {
        await request<unknown>(
          `/help-requests/${encodeURIComponent(id)}/replies`,
          {
            method: "POST",
            body: { message: text.trim() },
          },
        );
        await fetchApiRequests();
        return;
      }

      writeOperationStore(
        "daftarin:help:v1",
        allLocal.map((item) =>
          item.id !== id
            ? item
            : {
                ...item,
                status: close
                  ? "closed"
                  : user.role === "admin"
                    ? "answered"
                    : "open",
                messages: [
                  ...item.messages,
                  {
                    by: user.name,
                    role: user.role,
                    text: text.trim(),
                    at: new Date().toISOString(),
                  },
                ],
              },
        ),
      );
    },
  };
}
