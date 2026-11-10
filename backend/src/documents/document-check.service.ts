import {
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { Worker } from 'node:worker_threads';
import { readChatConfiguration } from '../chat/chat.config';
import {
  STORAGE_SERVICE,
  type IStorageService,
} from '../storage/interfaces/storage.service.interface';
import {
  DOCUMENTS_REPOSITORY,
  type IDocumentsRepository,
} from './interfaces/documents.repository.interface';

const tips = {
  compare:
    'Cocokkan nama, tanggal, dan nomor dokumen dengan berkas asli sebelum mengirim.',
  review:
    'Perbesar pratinjau dan periksa tulisan kecil atau bagian yang tertutup bayangan.',
  retake:
    'Ambil ulang foto atau pindai dengan cahaya merata. Pastikan tulisan tajam dan seluruh tepi berkas terlihat.',
  rescan:
    'Pindai ulang halaman yang sulit dibaca, lalu pastikan hasilnya dapat diperbesar sebelum diunggah.',
};
type Tip = keyof typeof tips;
const exec = promisify(execFile);

@Injectable()
export class DocumentCheckService {
  private busy = false;

  constructor(
    @Inject(DOCUMENTS_REPOSITORY)
    private readonly documents: IDocumentsRepository,
    @Inject(STORAGE_SERVICE) private readonly storage: IStorageService,
    private readonly config: ConfigService,
  ) {}

  async check(preparationId: string, documentId: string, userId: string) {
    const document = await this.documents.findByDocumentId(
      documentId,
      preparationId,
    );
    if (!document || document.userId !== userId) {
      throw new NotFoundException('Dokumen tidak ditemukan.');
    }
    if (
      this.config.get('NODE_ENV') === 'production' &&
      this.config.get('DOCUMENT_CHECK_ENABLED') !== 'true'
    ) {
      throw new ServiceUnavailableException(
        'Cek keterbacaan belum diaktifkan pada server ini.',
      );
    }
    if (this.busy)
      throw new ServiceUnavailableException(
        'Cek keterbacaan sedang berjalan. Coba lagi sebentar.',
      );

    this.busy = true;
    try {
      const file = await this.storage.downloadFile(document.storageKey);
      const pdf = document.detectedMimeType === 'application/pdf';
      const image = pdf ? await this.renderFirstPage(file) : file;
      const { enoughText, confidence } = await this.recognize(image);
      const confidenceScore = Math.round(
        Math.max(0, Math.min(100, confidence || 0)),
      );
      const readable = enoughText && confidenceScore >= 60;
      const fallback: Tip = readable ? 'compare' : 'retake';
      const tip = await this.suggest(
        readable,
        enoughText,
        confidenceScore,
        pdf,
      );
      return {
        document_id: document.id,
        scope: pdf ? 'first_page' : 'image',
        readable,
        confidence: confidenceScore,
        advice: tips[tip ?? fallback],
        advice_source: tip ? 'llm' : 'rules',
      };
    } finally {
      this.busy = false;
    }
  }

  private async renderFirstPage(file: Buffer): Promise<Buffer> {
    const directory = await mkdtemp(join(tmpdir(), 'daftarin-ocr-'));
    try {
      const pdf = join(directory, 'source.pdf');
      const output = join(directory, 'page');
      await writeFile(pdf, file);
      const converter = this.config.get<string>('PDFTOPPM_PATH') || 'pdftoppm';
      await exec(
        converter,
        [
          '-f',
          '1',
          '-l',
          '1',
          '-scale-to',
          '1800',
          '-singlefile',
          '-png',
          pdf,
          output,
        ],
        {
          timeout: 8000,
          windowsHide: true,
        },
      );
      return await readFile(output + '.png');
    } catch {
      throw new ServiceUnavailableException(
        'Halaman pertama PDF belum dapat dibaca. Pastikan PDF tidak terkunci dan alat pdftoppm tersedia.',
      );
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }

  private async recognize(image: Buffer) {
    const worker = new Worker(join(__dirname, 'document-ocr.worker.js'), {
      workerData: {
        image,
        langPath: this.config.get<string>('DOCUMENT_OCR_LANG_PATH'),
      },
    });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await new Promise<{ enoughText: boolean; confidence: number }>(
        (resolve, reject) => {
          const fail = () => reject(new Error('OCR unavailable'));
          timer = setTimeout(fail, 30_000);
          worker.once('error', fail);
          worker.once('exit', fail);
          worker.once('message', (result) => {
            if (result) resolve(result);
            else fail();
          });
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'OCR belum dapat membaca berkas ini. Coba ulang atau periksa berkas secara manual.',
      );
    } finally {
      clearTimeout(timer);
      await worker.terminate().catch(() => undefined);
    }
  }

  private async suggest(
    readable: boolean,
    enoughText: boolean,
    confidence: number,
    pdf: boolean,
  ): Promise<Tip | undefined> {
    if (this.config.get('DOCUMENT_CHECK_LLM') !== 'true') return;
    const { provider, key, model, baseUrl } = readChatConfiguration(
      this.config,
    );
    if (provider !== 'openai_compatible' || !key || !model) return;
    const allowed: Tip[] = readable
      ? ['compare', 'review']
      : ['retake', 'rescan'];
    try {
      const url = new URL(baseUrl.replace(/\/+$/, '') + '/chat/completions');
      if (
        url.protocol !== 'https:' ||
        url.username ||
        url.password ||
        url.search ||
        url.hash
      )
        return;
      const response = await fetch(url, {
        method: 'POST',
        redirect: 'error',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + key,
        },
        signal: AbortSignal.timeout(6000),
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content:
                'Select the most useful next step from allowed_tips and return its code only. compare = compare fields with the original. review = zoom in on small or shadowed text. retake = retake the photo with better light. rescan = rescan the page at higher resolution. Use the OCR signals and format. Do not decide document validity.',
            },
            {
              role: 'user',
              content: JSON.stringify({
                readable,
                enough_text: enoughText,
                confidence,
                scope: pdf ? 'first_page' : 'image',
                allowed_tips: allowed,
              }),
            },
          ],
          max_tokens: 128,
        }),
      });
      if (!response.ok) return;
      const result = await response.json();
      const tip = result?.choices?.[0]?.message?.content?.trim();
      return allowed.find((code) => code === tip);
    } catch {
      return;
    }
  }
}
