import { ConfigService } from '@nestjs/config';

/** Server-only compatibility for older chatbot environment names. */
export function readChatConfiguration(config: ConfigService) {
  const read = (...names: string[]) => {
    for (const name of names) {
      const value = config.get<unknown>(name);
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
  };
  const requested = read('CHAT_AI_PROVIDER', 'VITE_AI_PROVIDER').toLowerCase();
  const provider =
    requested === 'openai' ? 'openai_compatible' : requested || 'disabled';
  const gemini = provider === 'gemini';
  const key = gemini
    ? read(
        'CHAT_GEMINI_API_KEY',
        'GEMINI_API_KEY',
        'VITE_GEMINI_API_KEY',
        'CHAT_AI_API_KEY',
      )
    : read('CHAT_AI_API_KEY', 'OPENAI_API_KEY', 'VITE_OPENAI_API_KEY');
  const model = gemini
    ? read(
        'CHAT_GEMINI_MODEL',
        'GEMINI_MODEL',
        'VITE_GEMINI_MODEL',
        'CHAT_AI_MODEL',
      )
    : read('CHAT_AI_MODEL', 'OPENAI_MODEL', 'VITE_OPENAI_MODEL');
  return {
    provider,
    key,
    model,
    baseUrl:
      read('CHAT_AI_BASE_URL', 'OPENAI_BASE_URL', 'VITE_OPENAI_BASE_URL') ||
      'https://api.openai.com/v1',
    fallbackModel: gemini
      ? ''
      : read(
          'CHAT_AI_FALLBACK_MODEL',
          'OPENAI_FALLBACK_MODEL',
          'VITE_OPENAI_FALLBACK_MODEL',
        ),
  };
}
