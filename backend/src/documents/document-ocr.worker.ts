import { parentPort, workerData } from 'node:worker_threads';
import { createWorker } from 'tesseract.js';

async function recognize() {
  const { image, langPath } = workerData as {
    image: Uint8Array;
    langPath?: string;
  };
  const worker = await createWorker('ind', 1, {
    cacheMethod: 'none',
    langPath,
    errorHandler: () => parentPort?.postMessage(null),
  });
  try {
    const { data } = await worker.recognize(Buffer.from(image));
    parentPort?.postMessage({
      enoughText: data.text.replace(/[^\p{L}\p{N}]/gu, '').length >= 12,
      confidence: data.confidence,
    });
  } finally {
    await worker.terminate();
  }
}

void recognize().catch(() => parentPort?.postMessage(null));
