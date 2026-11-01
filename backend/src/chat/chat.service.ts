import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuideVersionStatus } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ChatMessageRequestDto } from './dto/chat-message.dto';

export interface ChatMessageResponseData {
  text: string;
  actionSteps: string[];
  legalCitations: string[];
  quickAction?: string;
  source: 'ai' | 'local_guide';
  modelUsed: string;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  getStatus(): {
    status: 'ready' | 'fallback_local' | 'disabled';
    provider: string;
    model: string;
  } {
    const provider =
      this.configService.get<string>('CHAT_AI_PROVIDER') ?? 'disabled';
    const apiKey = this.configService.get<string>('CHAT_AI_API_KEY');
    const model =
      this.configService.get<string>('CHAT_AI_MODEL') ?? 'local-fallback';

    if (provider === 'disabled') {
      return { status: 'disabled', provider, model };
    }

    if (!apiKey) {
      return { status: 'fallback_local', provider, model };
    }

    return { status: 'ready', provider, model };
  }

  async sendMessage(
    dto: ChatMessageRequestDto,
  ): Promise<ChatMessageResponseData> {
    const provider =
      this.configService.get<string>('CHAT_AI_PROVIDER') ?? 'disabled';
    const apiKey = this.configService.get<string>('CHAT_AI_API_KEY');
    const model =
      this.configService.get<string>('CHAT_AI_MODEL') ?? 'gpt-4o-mini';
    const baseUrl = this.configService.get<string>('CHAT_AI_BASE_URL');

    if (provider !== 'disabled' && apiKey) {
      try {
        if (provider === 'openai_compatible') {
          return await this.callOpenAiCompatible(
            baseUrl ?? 'https://api.openai.com/v1',
            apiKey,
            model,
            dto,
          );
        } else if (provider === 'gemini') {
          return await this.callGemini(apiKey, model, dto);
        }
      } catch (error: any) {
        this.logger.warn(
          `AI provider failed, falling back to local guide: ${error?.message}`,
        );
      }
    }

    return this.fallbackToLocalGuide(dto);
  }

  private async callOpenAiCompatible(
    baseUrl: string,
    apiKey: string,
    model: string,
    dto: ChatMessageRequestDto,
  ): Promise<ChatMessageResponseData> {
    const endpoint = `${baseUrl.replace(/\/+$/, '')}/chat/completions`;

    const messages = [
      {
        role: 'system',
        content:
          'Anda adalah asisten panduan layanan publik DaftarIn. Jawab pertanyaan pengguna secara akurat, sopan, dan terstruktur.',
      },
      ...dto.history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'assistant',
        content: h.text,
      })),
      {
        role: 'user',
        content: dto.query,
      },
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 800,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: HTTP ${res.status}`);
    }

    const data = (await res.json()) as any;
    const answer =
      data.choices?.[0]?.message?.content ?? 'Tidak ada jawaban dari AI.';

    return {
      text: answer,
      actionSteps: [
        'Periksa kelengkapan berkas persyaratan Anda',
        'Buat draf persiapan pada menu Layanan',
        'Unggah dokumen pendukung ke ruang penyimpanan privat',
      ],
      legalCitations: ['UU Pelayanan Publik No. 25 Tahun 2009'],
      source: 'ai',
      modelUsed: model,
    };
  }

  private async callGemini(
    apiKey: string,
    model: string,
    dto: ChatMessageRequestDto,
  ): Promise<ChatMessageResponseData> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const contents = [
      ...dto.history.map((h) => ({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      })),
      {
        role: 'user',
        parts: [{ text: dto.query }],
      },
    ];

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: HTTP ${res.status}`);
    }

    const data = (await res.json()) as any;
    const answer =
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      'Tidak ada jawaban dari Gemini.';

    return {
      text: answer,
      actionSteps: [
        'Periksa persyaratan administrasi yang diperlukan',
        'Lengkapi data pada formulir persiapan',
      ],
      legalCitations: ['SOP Pelayanan Terpadu'],
      source: 'ai',
      modelUsed: model,
    };
  }

  private async fallbackToLocalGuide(
    dto: ChatMessageRequestDto,
  ): Promise<ChatMessageResponseData> {
    let serviceName = 'Layanan Publik';
    let summary =
      'Silakan pastikan data identitas dan dokumen persyaratan Anda telah siap sebelum mengajukan permohonan ke instansi berwenang.';
    const citations: string[] = ['Standar Pelayanan Publik Indonesia'];

    if (dto.serviceId) {
      const isUuid =
        typeof dto.serviceId === 'string' && dto.serviceId.includes('-');
      const service = await this.prisma.service.findFirst({
        where: isUuid
          ? { id: dto.serviceId as string }
          : { publicationStatus: 'PUBLISHED' },
        include: {
          guideVersions: {
            where: { status: GuideVersionStatus.PUBLISHED },
            orderBy: { versionNumber: 'desc' },
            take: 1,
          },
        },
      });

      if (service) {
        serviceName = service.name;
        summary =
          service.summary ||
          `Panduan resmi untuk pengurusan ${service.name}. Pastikan mengisi formulir persiapan dan melampirkan berkas yang valid.`;
        citations.push(`Panduan Resmi: ${service.name}`);
      }
    }

    return {
      text: `Panduan Lokal (${serviceName}): ${summary} Untuk pertanyaan: "${dto.query}", silakan gunakan menu Persiapan Berkas untuk panduan langkah demi langkah.`,
      actionSteps: [
        'Lengkapi formulir kuesioner persiapan',
        'Unggah dokumen yang disyaratkan',
        'Kirim berkas untuk tinjauan pendamping DaftarIn',
      ],
      legalCitations: citations,
      quickAction: 'open_preparation',
      source: 'local_guide',
      modelUsed: 'local-catalog-fallback',
    };
  }
}
