/** Keep all API clients on the same base without redirect-producing slashes. */
export function normalizeApiBaseUrl(value?: string): string {
  const base = value?.trim() || '/api';
  return base.replace(/(^|[^:])\/{2,}/g, '$1/').replace(/\/+$/, '') || '/api';
}
