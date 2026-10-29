import axios, { type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  User,
  ServiceItem,
  ServiceGuide,
  Preparation,
  DocumentItem,
  InspectionRun,
  Finding,
  ApplicationRecord,
  StatusEvent,
} from '../types/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    Accept: 'application/json',
  },
});

// Interceptor for Auth token if saved in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jmw_access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Generic safe requester that wraps response or falls back cleanly
export async function requestSafe<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
  fallbackData: T
): Promise<T> {
  try {
    const res = await promise;
    return res.data?.data ?? fallbackData;
  } catch (err) {
    console.warn('[API Client Offline / Connecting fallback]', err);
    return fallbackData;
  }
}

// 1. Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return (await api.post('/auth/login', { email, password })).data;
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    return (await api.get('/auth/me')).data;
  },
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('jmw_access_token');
    }
  },
};

// 2. Services / Catalog API
export const servicesApi = {
  getAll: async (params?: { category?: string; search?: string }): Promise<ApiResponse<ServiceItem[]>> => {
    return (await api.get('/services', { params })).data;
  },
  getById: async (serviceId: string): Promise<ApiResponse<ServiceItem>> => {
    return (await api.get(`/services/${serviceId}`)).data;
  },
  getGuide: async (serviceId: string): Promise<ApiResponse<ServiceGuide>> => {
    return (await api.get(`/services/${serviceId}/guide`)).data;
  },
};

// 3. Preparations API
export const preparationsApi = {
  getAll: async (): Promise<ApiResponse<Preparation[]>> => {
    return (await api.get('/preparations')).data;
  },
  getById: async (id: string): Promise<ApiResponse<Preparation>> => {
    return (await api.get(`/preparations/${id}`)).data;
  },
  create: async (serviceId: string): Promise<ApiResponse<Preparation>> => {
    return (await api.post('/preparations', { service_id: serviceId })).data;
  },
  update: async (id: string, patch: Partial<Preparation>): Promise<ApiResponse<Preparation>> => {
    return (await api.patch(`/preparations/${id}`, patch)).data;
  },
  getDocuments: async (preparationId: string): Promise<ApiResponse<DocumentItem[]>> => {
    return (await api.get(`/preparations/${preparationId}/documents`)).data;
  },
};

// 4. Documents API
export const documentsApi = {
  upload: async (preparationId: string, file: File, docType: string): Promise<ApiResponse<DocumentItem>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', docType);
    return (
      await api.post(`/preparations/${preparationId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    ).data;
  },
  delete: async (preparationId: string, documentId: string): Promise<void> => {
    await api.delete(`/preparations/${preparationId}/documents/${documentId}`);
  },
};

// 5. Inspections API
export const inspectionsApi = {
  run: async (preparationId: string): Promise<ApiResponse<InspectionRun>> => {
    return (await api.post(`/preparations/${preparationId}/inspections`)).data;
  },
  getFindings: async (preparationId: string, inspectionId: string): Promise<ApiResponse<Finding[]>> => {
    return (await api.get(`/preparations/${preparationId}/inspections/${inspectionId}/findings`)).data;
  },
  recordCorrection: async (
    preparationId: string,
    findingId: string,
    correctedValue: string
  ): Promise<ApiResponse<void>> => {
    return (
      await api.post(`/preparations/${preparationId}/findings/${findingId}/corrections`, {
        corrected_value: correctedValue,
      })
    ).data;
  },
};

// 6. Applications (Tracking) API
export const applicationsApi = {
  getAll: async (): Promise<ApiResponse<ApplicationRecord[]>> => {
    return (await api.get('/applications')).data;
  },
  getById: async (id: string): Promise<ApiResponse<ApplicationRecord>> => {
    return (await api.get(`/applications/${id}`)).data;
  },
  create: async (payload: {
    service_id: string;
    preparation_id?: string;
    channel_type: string;
    simulation: boolean;
  }): Promise<ApiResponse<ApplicationRecord>> => {
    return (await api.post('/applications', payload)).data;
  },
  getTimeline: async (applicationId: string): Promise<ApiResponse<StatusEvent[]>> => {
    return (await api.get(`/applications/${applicationId}/timeline`)).data;
  },
  addCitizenNote: async (applicationId: string, note: string): Promise<ApiResponse<StatusEvent>> => {
    return (await api.post(`/applications/${applicationId}/citizen-notes`, { note })).data;
  },
};

// 7. Officer API
export const officerApi = {
  getAssignments: async (): Promise<ApiResponse<ApplicationRecord[]>> => {
    return (await api.get('/officer/assignments')).data;
  },
  recordEvent: async (
    applicationId: string,
    payload: { status: string; note: string; simulation?: boolean }
  ): Promise<ApiResponse<StatusEvent>> => {
    return (await api.post(`/officer/applications/${applicationId}/events`, payload)).data;
  },
};
