import { useState } from "react";
import { api, requestSafe } from "../api/client";
import { useServerAction } from "../api/workspace";

type Result = {
  scope: "first_page" | "image";
  readable: boolean;
  confidence: number;
  advice: string;
  advice_source: "llm" | "rules";
};

export function DocumentReadabilityCheck({
  preparationId,
  documentId,
}: {
  preparationId: string;
  documentId: string;
}) {
  const action = useServerAction();
  const [result, setResult] = useState<Result>();

  return (
    <div className="mt-4">
      <button
        type="button"
        className="button-secondary"
        disabled={action.busy}
        onClick={() =>
          void action.run(async () => {
            setResult(undefined);
            const path = `/preparations/${encodeURIComponent(preparationId)}/documents/${encodeURIComponent(documentId)}/check`;
            setResult(await requestSafe<Result>(api.post(path, undefined, { timeout: 50_000 })));
          })
        }
      >
        {action.busy ? "Memeriksa keterbacaan…" : "Cek keterbacaan berkas"}
      </button>
      {action.busy && <p role="status">OCR sedang membaca tulisan pada berkas.</p>}
      {action.error && <p className="form-error mt-2" role="alert">{action.error}</p>}
      {result && (
        <div className="mt-2" role="status">
          <p>
            <strong>{result.readable ? "Tulisan terdeteksi" : "Tulisan sulit dibaca"}</strong>
            {" · "}Skor OCR {result.confidence}%{" · "}
            {result.scope === "first_page" ? "Halaman pertama PDF" : "Gambar"}
          </p>
          <p>{result.advice}</p>
          <p className="text-sm">
            {result.advice_source === "llm" ? "Saran dipilih dengan AI. " : ""}
            Hasil ini membantu cek kualitas tulisan. Keputusan tinjauan tetap pada petugas.
          </p>
        </div>
      )}
    </div>
  );
}
