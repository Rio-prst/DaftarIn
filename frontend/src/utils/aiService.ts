import { API_BASE_URL } from "../api/transport";
import { retrieveAdmindukKnowledge } from "./admindukRag";
export interface AskRagResponse {
  text: string;
  legalCitations: string[];
  actionSteps: string[];
  quickAction?: { label: string; route: string };
  source?: "ai" | "catalog" | "local_rag";
  notice?: string;
}
export const safeChatRoute = (value: string) =>
  /^\/(?:katalog|kebutuhan|bantuan|persiapan|layanan\/[1-6])$/.test(value);
export async function askAdmindukRag(params: {
  query: string;
  activeServiceId?: number;
  previousMessages?: { sender: "user" | "bot"; text: string }[];
  signal: AbortSignal;
}): Promise<AskRagResponse> {
  const query = params.query.replace(
    /\b(?:\d[ -]?){16}\b/g,
    "[identitas disamarkan]",
  );
  if (/^(?:halo|hai|hei|hello|selamat (?:pagi|siang|sore|malam))(?:\s+(?:daftarin|asisten|min|kak))?[\s!,.?]*$/i.test(query.trim())) {
    return {
      text: "Halo! Aku bisa bantu mencari layanan dan menyiapkan berkas. Kamu mau mengurus dokumen apa?",
      legalCitations: [],
      actionSteps: [],
      quickAction: { label: "Lihat layanan", route: "/katalog" },
    };
  }
  try {
    const response = await fetch(API_BASE_URL + "/chat/messages", {
      method: "POST",
      credentials: "include",
      signal: params.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query,
        serviceId: params.activeServiceId,
        history: (params.previousMessages || []).slice(-4).map((item) => ({
          ...item,
          text: item.text
            .slice(0, 1500)
            .replace(/\b(?:\d[ -]?){16}\b/g, "[identitas disamarkan]"),
        })),
      }),
    });
    if (!response.ok) throw new Error("unavailable");
    const json = await response.json(),
      data = json?.data;
    if (
      typeof data?.text !== "string" ||
      !data.text.trim() ||
      (data.source !== "ai" && data.source !== "catalog")
    )
      throw new Error("invalid_response");
    return {
      text: data.text.slice(0, 6000),
      legalCitations: Array.isArray(data.legalCitations)
        ? data.legalCitations
            .filter((item: unknown) => typeof item === "string")
            .slice(0, 8)
        : [],
      actionSteps: Array.isArray(data.actionSteps)
        ? data.actionSteps
            .filter((item: unknown) => typeof item === "string")
            .slice(0, 8)
        : [],
      quickAction:
        typeof data.quickAction?.label === "string" &&
        typeof data.quickAction?.route === "string" &&
        safeChatRoute(data.quickAction.route)
          ? data.quickAction
          : undefined,
      source: data.source,
    };
  } catch (error) {
    if (params.signal.aborted) throw error;
    const local = retrieveAdmindukKnowledge(query, params.activeServiceId);
    return {
      text: local.synthesizedAnswer,
      legalCitations: local.legalCitations,
      actionSteps: local.actionSteps,
      quickAction:
        local.quickAction && safeChatRoute(local.quickAction.route)
          ? local.quickAction
          : undefined,
      source: "local_rag",
      notice:
        "AI belum dapat dihubungi. Jawaban berikut berasal dari panduan lokal; kamu tetap bisa meminta bantuan petugas.",
    };
  }
}
