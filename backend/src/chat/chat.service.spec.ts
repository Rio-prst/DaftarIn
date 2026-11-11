import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.module';
import { retrieveAdmindukKnowledge } from './knowledge';
import type { ICatalogService } from '../catalog/interfaces/catalog.service.interface';

describe('ChatService relay', () => {
  const create = (extra: Record<string, string> = {}) => {
    const settings = {
      CHAT_AI_PROVIDER: 'openai_compatible',
      CHAT_AI_API_KEY: 'unit-test-secret',
      CHAT_AI_MODEL: 'model-test',
      CHAT_AI_BASE_URL: 'https://provider.example/v1',
      NODE_ENV: 'production',
      ...extra,
    };
    return new ChatService({
      get: (key: string, fallback?: string) =>
        settings[key as keyof typeof settings] ?? fallback,
    } as unknown as ConfigService);
  };
  afterEach(() => jest.restoreAllMocks());
  it.each(['ada apa aja disini?', 'Di sini bisa urus apa aja?', 'Layanan apa saja?'])(
    'answers %s from the catalog without an AI provider',
    async (query) => {
      const listServices = jest.fn().mockResolvedValue({
        data: [{ name: 'Kartu Keluarga' }, { name: 'KTP-el' }],
        meta: { total_items: 2 },
      });
      const service = new ChatService(new ConfigService(), { listServices } as unknown as ICatalogService);
      await expect(service.ask({ query })).resolves.toMatchObject({
        source: 'catalog',
        text: expect.stringContaining('Kartu Keluarga'),
        quickAction: { route: '/katalog' },
      });
    },
  );
  it('routes a damaged KK to its published guide instead of the KTP guide', async () => {
    const listServices = jest.fn().mockResolvedValue({
      data: [{ slug: 'penerbitan-ktp-el' }, { slug: 'penerbitan-kartu-keluarga' }],
    });
    const service = new ChatService(new ConfigService(), { listServices } as unknown as ICatalogService);
    await expect(service.ask({ query: 'KK saya rusak. Apa yang perlu saya siapkan?' })).resolves.toMatchObject({
      source: 'catalog',
      quickAction: { route: '/layanan/1' },
    });
  });
  it('reads server process.env through the real Nest ConfigService', () => {
    const environment = jest.replaceProperty(process, 'env', {
      CHAT_AI_PROVIDER: 'openai_compatible',
      CHAT_AI_API_KEY: 'server-test-key',
      CHAT_AI_MODEL: 'server-test-model',
      AI_PROVIDER: 'disabled',
    });
    try {
      expect(new ChatService(new ConfigService()).status()).toEqual({
        configured: true,
        missing: [],
      });
    } finally {
      environment.restore();
    }
  });
  it('normalizes provider names and whitespace', () => {
    expect(
      create({ CHAT_AI_PROVIDER: ' OpenAI_Compatible \n' }).status(),
    ).toEqual({
      configured: true,
      missing: [],
    });
  });
  it('reads the legacy server environment without exposing secrets', () => {
    const service = create({
      CHAT_AI_PROVIDER: '',
      CHAT_AI_API_KEY: '',
      CHAT_AI_MODEL: '',
      VITE_AI_PROVIDER: 'openai',
      VITE_OPENAI_API_KEY: 'legacy-private-key',
      VITE_OPENAI_MODEL: 'legacy-model',
    });
    expect(service.status()).toEqual({ configured: true, missing: [] });
    expect(JSON.stringify(service.status())).not.toContain(
      'legacy-private-key',
    );
  });
  it('reports missing fields without secret values', () => {
    expect(
      create({ CHAT_AI_API_KEY: ' ', CHAT_AI_MODEL: '' }).status(),
    ).toEqual({
      configured: false,
      missing: ['api_key', 'model'],
    });
  });
  it('preserves an explicit disabled provider over legacy settings', () => {
    expect(
      create({
        CHAT_AI_PROVIDER: 'disabled',
        VITE_AI_PROVIDER: 'openai',
      }).status().configured,
    ).toBe(false);
  });
  it('does not call a provider while configuration is disabled', async () => {
    const fetch = jest.spyOn(global, 'fetch');
    await expect(
      create({ CHAT_AI_PROVIDER: 'disabled' }).ask({ query: 'Syarat KK' }),
    ).rejects.toThrow('belum dikonfigurasi');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('does not report an unsupported provider as configured', () => {
    expect(create({ CHAT_AI_PROVIDER: 'unknown' }).status().configured).toBe(
      false,
    );
  });
  it('redacts identifiers and trusts only application references and actions', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  answer: 'Baca panduan layanan.',
                  actionSteps: ['Periksa berkas.'],
                  quickAction: { route: '/admin' },
                  legalCitations: ['invented'],
                }),
              },
            },
          ],
        }),
    } as Response);
    const query = 'Syarat KK untuk 0000000000000099';
    const response = await create().ask({
      query,
      serviceId: 1,
      history: [{ sender: 'user', text: 'Nomor 0000 0000 0000 0099' }],
    });
    const [, options] = fetch.mock.calls[0];
    expect(typeof options?.body === 'string' ? options.body : '').not.toContain(
      '0000000000000099',
    );
    expect(typeof options?.body === 'string' ? options.body : '').not.toContain(
      '0000 0000 0000 0099',
    );
    expect(typeof options?.body === 'string' ? options.body : '').not.toContain(
      'unit-test-secret',
    );
    expect(response.legalCitations).toEqual(
      retrieveAdmindukKnowledge('Syarat KK untuk [identitas disamarkan]', 1)
        .legalCitations,
    );
    expect(response.quickAction?.route).not.toBe('/admin');
    expect(JSON.stringify(response)).not.toContain('unit-test-secret');
  });
  it('rejects insecure production provider URLs without sending a request', async () => {
    const fetch = jest.spyOn(global, 'fetch');
    await expect(
      create({ CHAT_AI_BASE_URL: 'http://provider.example/v1' }).ask({
        query: 'Syarat KK',
      }),
    ).rejects.toThrow('HTTPS');
    expect(fetch).not.toHaveBeenCalled();
  });
  it('sanitizes provider errors', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('provider error unit-test-secret'));
    await expect(create().ask({ query: 'Syarat KK' })).rejects.toThrow(
      'Asisten AI belum dapat menjawab',
    );
  });
  it('sends Gemini credentials only as a server header', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"answer":"Baca panduan layanan."}' }],
              },
            },
          ],
        }),
    } as Response);
    const response = await create({ CHAT_AI_PROVIDER: 'gemini' }).ask({
      query: 'Syarat KK',
    });
    const [url, options] = fetch.mock.calls[0];
    expect(
      typeof url === 'string' ? url : url instanceof URL ? url.href : url.url,
    ).not.toContain('unit-test-secret');
    expect(options?.headers).toEqual(
      expect.objectContaining({ 'x-goog-api-key': 'unit-test-secret' }),
    );
    expect(response.source).toBe('ai');
  });
  const goodResponse = () =>
    ({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          choices: [
            { message: { content: '{"answer":"Baca panduan layanan."}' } },
          ],
        }),
    }) as Response;
  it('uses the configured fallback after a primary rate limit', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 429 } as Response)
      .mockResolvedValueOnce(goodResponse());
    const response = await create({
      CHAT_AI_FALLBACK_MODEL: 'fallback-test',
    }).ask({ query: 'Syarat KK' });
    expect(response.modelUsed).toBe('fallback-test');
    expect(response.usedFallback).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(JSON.parse(fetch.mock.calls[1][1]?.body as string)).toHaveProperty(
      'model',
      'fallback-test',
    );
  });
  it('falls back when the primary request times out', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValueOnce(new DOMException('timed out', 'AbortError'))
      .mockResolvedValueOnce(goodResponse());
    const response = await create({
      CHAT_AI_FALLBACK_MODEL: 'fallback-test',
    }).ask({ query: 'Syarat KK' });
    expect(response.usedFallback).toBe(true);
  });
  it('falls back when primary output cannot be parsed safely', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'invalid json' } }],
          }),
      } as Response)
      .mockResolvedValueOnce(goodResponse());
    const response = await create({
      CHAT_AI_FALLBACK_MODEL: 'fallback-test',
    }).ask({ query: 'Syarat KK' });
    expect(response.modelUsed).toBe('fallback-test');
  });
  it('does not retry a rejected credential on another model using the same key', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue({ ok: false, status: 401 } as Response);
    await expect(
      create({ CHAT_AI_FALLBACK_MODEL: 'fallback-test' }).ask({
        query: 'Syarat KK',
      }),
    ).rejects.toThrow('Asisten AI belum dapat menjawab');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('tries at most two distinct models without exposing upstream details', async () => {
    const fetch = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('private upstream details'));
    await expect(
      create({ CHAT_AI_FALLBACK_MODEL: 'fallback-test' }).ask({
        query: 'Syarat KK',
      }),
    ).rejects.toThrow('Asisten AI belum dapat menjawab');
    expect(fetch).toHaveBeenCalledTimes(2);
  });
  it('uses separate direct Gemini credentials when that provider is selected', async () => {
    const fetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve({
          candidates: [
            {
              content: {
                parts: [{ text: '{"answer":"Panduan tersedia."}' }],
              },
            },
          ],
        }),
    } as Response);
    await create({
      CHAT_AI_PROVIDER: 'gemini',
      CHAT_GEMINI_API_KEY: 'google-test-secret',
      CHAT_GEMINI_MODEL: 'google-test-model',
      CHAT_AI_FALLBACK_MODEL: 'fallback-test',
    }).ask({ query: 'Syarat KK' });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1]?.headers).toEqual(
      expect.objectContaining({ 'x-goog-api-key': 'google-test-secret' }),
    );
    const requestedUrl = fetch.mock.calls[0][0];
    expect(
      requestedUrl instanceof URL
        ? requestedUrl.href
        : typeof requestedUrl === 'string'
          ? requestedUrl
          : requestedUrl.url,
    ).toContain('google-test-model');
  });
});
