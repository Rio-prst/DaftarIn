import { useCallback, useEffect, useRef, useState } from "react";
import { request } from "./transport";
import { api } from "./client";

export { request as serverRequest };
export function useServerResource<T>(key: string, load: () => Promise<T>) {
  const loader = useRef(load);
  loader.current = load;
  const [state, setState] = useState<{
    data?: T;
    error: string;
    loading: boolean;
  }>({ error: "", loading: true });
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((value) => value + 1), []);
  useEffect(() => {
    let alive = true;
    setState({ error: "", loading: true });
    loader
      .current()
      .then((data) => {
        if (alive) setState({ data, error: "", loading: false });
      })
      .catch((error) => {
        if (alive)
          setState({
            error:
              error instanceof Error
                ? error.message
                : "Data belum dapat dimuat.",
            loading: false,
          });
      });
    return () => {
      alive = false;
    };
  }, [key, version]);
  return { ...state, refresh };
}

export async function serverList<T>(path: string): Promise<T[]> {
  const result: T[] = [];
  for (let page = 1; page <= 1000; page++) {
    const response = await api.get(path, { params: { page, page_size: 50 } });
    const envelope = response.data;
    if (!Array.isArray(envelope?.data))
      throw new Error("Format daftar dari server belum sesuai.");
    result.push(...envelope.data);
    if (!envelope.meta?.total_pages || page >= envelope.meta.total_pages)
      return result;
  }
  throw new Error("Daftar terlalu besar. Gunakan filter yang lebih spesifik.");
}

export async function uploadServerDocument(
  prepId: string,
  file: File,
  slot: string,
) {
  if (
    !["application/pdf", "image/jpeg", "image/png"].includes(file.type) ||
    file.size > 10 * 1024 * 1024 ||
    !file.size
  )
    throw new Error(
      "Gunakan PDF, JPG, atau PNG yang tidak kosong, maksimal 10 MB.",
    );
  const form = new FormData();
  form.append("file", file);
  form.append("document_type", slot);
  const response = await api.post(
    `/preparations/${encodeURIComponent(prepId)}/documents`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return response.data.data;
}

export function useServerAction(refresh?: () => void) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const run = async (
    action: () => Promise<void>,
    success = "Perubahan berhasil disimpan.",
  ) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      setNotice(success);
      refresh?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Perubahan belum berhasil disimpan.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return { busy, error, notice, run };
}
