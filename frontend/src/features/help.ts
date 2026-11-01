import { useAuth } from "../auth/AuthContext";
import { useOperationStore, writeOperationStore } from "../utils/operations";
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
const EMPTY: HelpRequest[] = [];
export function useHelpRequests() {
  const { user, mode } = useAuth(),
    all = useOperationStore("daftarin:help:v1", EMPTY);
  const allowed = all.filter(
    (item) => user && (user.role === "admin" || item.ownerId === user.id),
  );
  return {
    requests: allowed,
    create: (input: {
      topic: string;
      body: string;
      applicationId?: string;
    }) => {
      if (!user)
        throw new Error(
          "Masuk dengan akun pengurus untuk menyimpan permintaan bantuan.",
        );
      if (mode === "api")
        throw new Error(
          "Pengiriman bantuan belum terhubung ke server. Simpan pertanyaanmu dan hubungi pengelola melalui kanal resmi yang tersedia.",
        );
      if (input.body.trim().length < 10)
        throw new Error(
          "Jelaskan pertanyaan atau kendala minimal 10 karakter.",
        );
      if (/\b(?:\d[ -]?){16}\b/.test(input.body))
        throw new Error(
          "Jangan menyertakan NIK atau nomor KK di pertanyaan. Gunakan nomor persiapan sebagai rujukan.",
        );
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
      writeOperationStore("daftarin:help:v1", [row, ...all]);
      return row;
    },
    reply: (id: string, text: string, close = false) => {
      if (!user) throw new Error("Masuk kembali.");
      const row = allowed.find((item) => item.id === id);
      if (!row) throw new Error("Permintaan bantuan tidak tersedia.");
      if (mode === "api")
        throw new Error("Balasan bantuan belum terhubung ke server.");
      if (text.trim().length < 5)
        throw new Error("Tuliskan tanggapan minimal 5 karakter.");
      writeOperationStore(
        "daftarin:help:v1",
        all.map((item) =>
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
