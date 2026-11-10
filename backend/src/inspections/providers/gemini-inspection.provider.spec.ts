import { ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GeminiInspectionProvider } from './gemini-inspection.provider';
import type { InspectionDocumentInput } from '../interfaces/inspection-ai.interface';

describe('GeminiInspectionProvider', () => {
  let provider: GeminiInspectionProvider;
  let configService: jest.Mocked<ConfigService>;
  const originalFetch = global.fetch;

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ConfigService>;
    provider = new GeminiInspectionProvider(configService);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  const sampleInput: InspectionDocumentInput = {
    documentVersionId: 'doc-version-1',
    documentType: 'KTP',
    mimeType: 'image/jpeg',
    filename: 'ktp.jpg',
    buffer: Buffer.from('fake-image-bytes'),
    requirement: {
      id: 'req-1',
      code: 'REQ_KTP',
      title: 'KTP Elektronik',
      description: 'Foto KTP asli',
      required: true,
    },
    answers: [
      {
        questionKey: 'nik',
        label: 'NIK',
        value: '3171012345678901',
      },
    ],
  };

  it('throws ServiceUnavailableException when provider is disabled or API key is missing', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'AI_API_KEY') return undefined;
      if (key === 'OCR_PROVIDER') return 'disabled';
      return undefined;
    });

    await expect(provider.analyzeDocument(sampleInput)).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('sends document to Gemini and returns parsed inspection result', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'AI_API_KEY') return 'test-gemini-key';
      if (key === 'OCR_PROVIDER') return 'gemini';
      if (key === 'AI_MODEL') return 'gemini-2.5-flash';
      if (key === 'INSPECTION_AI_TIMEOUT_MS') return '5000';
      return undefined;
    });

    const mockResponsePayload = {
      modelVersion: 'gemini-2.5-flash-preview',
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  document_type: 'KTP',
                  readable: true,
                  confidence: 0.95,
                  fields: [
                    {
                      name: 'nik',
                      value: '3171012345678901',
                      confidence: 0.98,
                    },
                  ],
                  issues: [],
                }),
              },
            ],
          },
        },
      ],
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponsePayload),
    });

    const result = await provider.analyzeDocument(sampleInput);

    expect(result.readable).toBe(true);
    expect(result.confidence).toBe(0.95);
    expect(result.modelVersion).toBe('gemini-2.5-flash-preview');
    expect(result.fields).toHaveLength(1);
    expect(result.issues).toEqual([]);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(String(url)).toContain('gemini-2.5-flash:generateContent');
    expect((options as RequestInit).headers).toMatchObject({
      'x-goog-api-key': 'test-gemini-key',
    });
  });

  it('handles fenced json response markdown from model', async () => {
    configService.get.mockImplementation((key: string) => {
      if (key === 'AI_API_KEY') return 'test-gemini-key';
      if (key === 'OCR_PROVIDER') return 'gemini';
      return undefined;
    });

    const fencedJson =
      '```json\n' +
      JSON.stringify({
        document_type: 'KTP',
        readable: false,
        confidence: 0.3,
        fields: [],
        issues: [
          {
            code: 'BLURRY_DOCUMENT',
            severity: 'BLOCKING',
            category: 'readability',
            title: 'Dokumen kabur',
            explanation: 'Foto KTP tidak fokus dan teks tidak terbaca.',
            field: null,
            quoted_text: null,
            suggested_action: 'Ambil ulang foto',
            page: 1,
            confidence: 0.3,
          },
        ],
      }) +
      '\n```';

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        modelVersion: 'gemini-3.5-flash-lite',
        candidates: [{ content: { parts: [{ text: fencedJson }] } }],
      }),
    });

    const result = await provider.analyzeDocument(sampleInput);

    expect(result.readable).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].code).toBe('BLURRY_DOCUMENT');
    expect(result.issues[0].severity).toBe('BLOCKING');
  });
});
