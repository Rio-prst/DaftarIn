import { normalizeApiBaseUrl } from './baseUrl';

export class ApiError extends Error {
  readonly status: number;
  readonly requestId?: string;
  constructor(status: number, message: string, requestId?: string) {
    super(message);
    this.status = status;
    this.requestId = requestId;
  }
}

export const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);
let refreshing: Promise<void> | null = null;

const TOKEN_KEY = "daftarin:access_token";

export function getStoredToken(): string | null {
  try {
    return typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(TOKEN_KEY)
      : null;
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (typeof sessionStorage !== "undefined") {
      if (token) sessionStorage.setItem(TOKEN_KEY, token);
      else sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

export async function refreshSession() {
  if (!refreshing) {
    const refresh = async () => {
      try {
        await request("/auth/me", {}, false);
        return;
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401) throw error;
      }
      try {
        const result = await request<{ access_token?: string }>(
          "/auth/refresh",
          { method: "POST" },
          false,
        );
        if (result?.access_token) {
          setStoredToken(result.access_token);
        }
      } catch (e) {
        setStoredToken(null);
        throw e;
      }
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
  const token = getStoredToken();

  try {
    let response: Response;
    try {
      response = await fetch(API_BASE_URL + path, {
        method: options.method || "GET",
        credentials: "include",
        signal: abort.signal,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

    const dataObj = (envelope as { data: T }).data;
    // Check if envelope returned access_token at root of data
    if (
      dataObj &&
      typeof dataObj === "object" &&
      "access_token" in dataObj &&
      typeof (dataObj as any).access_token === "string"
    ) {
      setStoredToken((dataObj as any).access_token);
    }

    return dataObj;
  } finally {
    clearTimeout(timeout);
  }
}
