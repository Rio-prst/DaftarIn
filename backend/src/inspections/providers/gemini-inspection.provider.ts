import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  InspectionResultSchema,
  type InspectionResult,
} from '../inspection.schema';
import {
  buildInspectionPrompt,
  INSPECTION_SYSTEM_INSTRUCTION,
} from '../inspection.prompt';
import {
  type IInspectionAiProvider,
  type InspectionAiResult,
  type InspectionDocumentInput,
} from '../interfaces/inspection-ai.interface';

class ProviderAccessError extends Error {}

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  modelVersion?: string;
};

const firstNonEmpty = (...values: (string | undefined)[]): string | undefined =>
  values.map((value) => value?.trim()).find((value) => value);

const positiveNumber = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const delay = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const stripFences = (value: string): string =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');

@Injectable()
export class GeminiInspectionProvider implements IInspectionAiProvider {
  private readonly logger = new Logger(GeminiInspectionProvider.name);

  constructor(private readonly config: ConfigService) {}

  async analyzeDocument(
    input: InspectionDocumentInput,
  ): Promise<InspectionAiResult> {
    const key = firstNonEmpty(
      this.config.get<string>('AI_API_KEY'),
      this.config.get<string>('CHAT_GEMINI_API_KEY'),
      this.config.get<string>('CHAT_AI_API_KEY'),
    );
    const provider = (
      firstNonEmpty(
        this.config.get<string>('OCR_PROVIDER'),
        this.config.get<string>('AI_PROVIDER'),
      ) ?? (key ? 'gemini' : 'disabled')
    ).toLowerCase();
    const model =
      firstNonEmpty(
        this.config.get<string>('AI_MODEL'),
        this.config.get<string>('OCR_MODEL'),
        this.config.get<string>('CHAT_GEMINI_MODEL'),
      ) ?? 'gemini-3.5-flash-lite';
    const timeoutMs = positiveNumber(
      this.config.get<string>('INSPECTION_AI_TIMEOUT_MS'),
      30_000,
    );

    if (provider !== 'gemini' || !key) {
      throw new ServiceUnavailableException(
        'Pemeriksaan AI belum dikonfigurasi.',
      );
    }

    const endpoint = new URL(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    );
    if (
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash
    ) {
      throw new ServiceUnavailableException(
        'Alamat provider pemeriksaan belum sesuai.',
      );
    }

    const body = {
      systemInstruction: {
        parts: [{ text: INSPECTION_SYSTEM_INSTRUCTION }],
      },
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildInspectionPrompt(input) },
            {
              inlineData: {
                mimeType: input.mimeType,
                data: input.buffer.toString('base64'),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1800,
        responseMimeType: 'application/json',
      },
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      const startedAt = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          signal: controller.signal,
          redirect: 'error',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key,
          },
          body: JSON.stringify(body),
        });

        if (response.status === 401 || response.status === 403) {
          throw new ProviderAccessError();
        }

        if (!response.ok) {
          if (
            attempt === 0 &&
            (response.status === 429 || response.status >= 500)
          ) {
            await delay(900);
            continue;
          }
          throw new Error(`provider_status_${response.status}`);
        }

        const data = (await response.json()) as GeminiResponse;
        const raw =
          data.candidates?.[0]?.content?.parts
            ?.map((part) => part.text ?? '')
            .join('') ?? '';
        const parsed: InspectionResult = InspectionResultSchema.parse(
          JSON.parse(stripFences(raw)),
        );
        const modelVersion = data.modelVersion?.trim() || model;

        this.logger.log(
          `[inspection] provider ok document=${input.documentVersionId} model=${modelVersion} attempt=${attempt} durationMs=${Date.now() - startedAt}`,
        );

        return { ...parsed, modelVersion };
      } catch (error) {
        this.logger.warn(
          `[inspection] provider failed document=${input.documentVersionId} attempt=${attempt} durationMs=${Date.now() - startedAt} error=${error instanceof Error ? error.name : 'unknown'}`,
        );

        if (error instanceof ProviderAccessError) {
          throw new ServiceUnavailableException(
            'Akses provider pemeriksaan ditolak.',
          );
        }

        if (attempt === 0) {
          await delay(900);
          continue;
        }
      } finally {
        clearTimeout(timer);
      }
    }

    throw new ServiceUnavailableException(
      'Layanan pemeriksaan sementara tidak tersedia.',
    );
  }
}
