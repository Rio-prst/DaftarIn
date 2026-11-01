import { useMemo, useSyncExternalStore } from 'react';
import type { ServiceDetail } from '../context/AppContext';

export interface GuideDraft { service: ServiceDetail; savedAt: string }
export interface GuideVersion { service: ServiceDetail; preservedAt: string }
export interface OperationAudit { id: string; message: string; by: string; time: string }
export const OPERATION_EVENT = 'daftarin:operations-updated';
export const EMPTY_DRAFTS: Record<number, GuideDraft> = {};
export const EMPTY_VERSIONS: GuideVersion[] = [];
export const EMPTY_AUDIT: OperationAudit[] = [];

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(OPERATION_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(OPERATION_EVENT, callback);
  };
}
export function useOperationStore<T>(key: string, fallback: T): T {
  const raw = useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(key) || ''; } catch { return ''; }
  }, () => '');
  return useMemo(() => {
    try { const value = JSON.parse(raw); return value && typeof value === typeof fallback && Array.isArray(value) === Array.isArray(fallback) ? value as T : fallback; }
    catch { return fallback; }
  }, [raw, fallback]);
}
export function writeOperationStore(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(OPERATION_EVENT));
}
export function appendOperationAudit(message: string, by: string) {
  let previous: OperationAudit[] = [];
  try { const parsed = JSON.parse(localStorage.getItem('daftarin:audit:v1') || '[]'); if (Array.isArray(parsed)) previous = parsed; } catch { /* Start a valid log if the demo store is damaged. */ }
  writeOperationStore('daftarin:audit:v1', [{id: crypto.randomUUID(), message, by, time: new Date().toISOString()}, ...previous]);
}
export function safeSourceUrl(value?: string): string | undefined {
  try { const url = new URL(value || ''); return url.protocol === 'https:' ? url.href : undefined; } catch { return undefined; }
}
export function sourceReviewStatus(service: ServiceDetail) {
  return service.source_review_version === (service.version || 1) && service.source_review_status
    ? service.source_review_status : service.source_verified ? 'sesuai' : 'perlu_ditinjau';
}
export const sourceReviewLabels = { sesuai: 'Sudah ditinjau admin', perlu_ditinjau: 'Perlu ditinjau', perlu_perbaikan: 'Perlu pembaruan' };
