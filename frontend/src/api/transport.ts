export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  constructor(status: number, message: string, requestId?: string) {
    super(message);
    this.status = status;
    this.requestId = requestId;
  }
}
export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
let refreshing: Promise<void> | null = null;
async function refreshSession() {
  if (!refreshing) {
    const refresh = async () => {
      try {
        await request("/auth/me", {}, false);
        return;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
      await request("/auth/refresh", { method: "POST" }, false);
    };
    refreshing = (
      typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("daftarin:refresh-session", refresh)
        : refresh()
    ).finally(() => {
      refreshing = null;
    });
  }
  await refreshing;
}
export async function request<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
  retry = true,
): Promise<T> {
  const abort = new AbortController();
  const timeout = setTimeout(() => abort.abort(), 15000);
  try {
    let response: Response;
    try {
      response = await fetch(API_BASE_URL + path, {
        method: options.method || "GET",
        credentials: "include",
        signal: abort.signal,
        headers: {
          Accept: "application/json",
          ...(options.body === undefined
            ? {}
            : { "Content-Type": "application/json" }),
        },
        ...(options.body === undefined
          ? {}
          : { body: JSON.stringify(options.body) }),
      });
    } catch (error) {
      throw new ApiError(
        0,
        error instanceof DOMException && error.name === "AbortError"
          ? "Server terlalu lama merespons. Coba lagi."
          : "Tidak dapat terhubung ke server. Periksa koneksi dan coba lagi.",
      );
    }
    if (response.status === 401 && retry) {
      clearTimeout(timeout);
      await refreshSession();
      return request(path, options, false);
    }
    if (response.status === 204) return undefined as T;
    const envelope: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const error =
        envelope && typeof envelope === "object" && "error" in envelope
          ? (
              envelope as {
                error?: { message?: unknown; request_id?: unknown };
              }
            ).error
          : null;
      throw new ApiError(
        response.status,
        typeof error?.message === "string"
          ? error.message
          : "Permintaan belum berhasil. Coba lagi.",
        typeof error?.request_id === "string" ? error.request_id : undefined,
      );
    }
    if (!envelope || typeof envelope !== "object" || !("data" in envelope))
      throw new ApiError(
        502,
        "Respons server belum sesuai. Silakan hubungi pengelola.",
      );
    return (envelope as { data: T }).data;
  } finally {
    clearTimeout(timeout);
  }
}
