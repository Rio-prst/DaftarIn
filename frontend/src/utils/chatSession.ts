/** Per-tab, per-account chat history; never writes to localStorage or a database. */
import { safeChatRoute } from "./aiService";

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  legalCitations?: string[];
  source?: "ai" | "catalog" | "local_rag";
  notice?: string;
  actionSteps?: string[];
  quickAction?: { label: string; route: string };
}
const PREFIX = "daftarin:chat-session:v1:";
const MAX_MESSAGES = 40;
export const chatSessionKey = (owner?: string) => PREFIX + (owner || "guest");
const welcome = (): ChatMessage => ({
  id: "welcome",
  sender: "bot",
  text: "Pilih contoh pertanyaan atau tulis kebutuhanmu. Hindari mengirim identitas dan isi dokumen pribadi.",
});
const strings = (value: unknown): string[] | undefined =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 8).map(item => item.slice(0, 500))
    : undefined;

export function readChatSession(key: string): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw || raw.length > 400_000) return [welcome()];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [welcome()];
    const messages: ChatMessage[] = [];
    for (const item of data.slice(-MAX_MESSAGES)) {
      if (!item || typeof item !== "object") continue;
      const row = item as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.text !== "string" ||
          (row.sender !== "user" && row.sender !== "bot")) continue;
      const action = row.quickAction as Record<string, unknown> | undefined;
      messages.push({
        id: row.id.slice(0, 100),
        sender: row.sender,
        text: row.text.slice(0, row.sender === "user" ? 1000 : 6000),
        source: row.source === "ai" || row.source === "catalog" || row.source === "local_rag" ? row.source : undefined,
        notice: typeof row.notice === "string" ? row.notice.slice(0, 500) : undefined,
        legalCitations: strings(row.legalCitations),
        actionSteps: strings(row.actionSteps),
        quickAction: action && typeof action.label === "string" &&
          typeof action.route === "string" && safeChatRoute(action.route)
          ? { label: action.label.slice(0, 100), route: action.route } : undefined,
      });
    }
    return messages.length ? messages : [welcome()];
  } catch {
    return [welcome()];
  }
}
export function writeChatSession(key: string, messages: ChatMessage[]) {
  try {
    sessionStorage.setItem(key, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  } catch {
    // Chat remains usable in memory if browser storage is blocked or full.
  }
}
export function clearChatSessions() {
  try {
    for (const key of Object.keys(sessionStorage))
      if (key.startsWith(PREFIX)) sessionStorage.removeItem(key);
  } catch {
    // Blocked storage must not prevent logout.
  }
}
