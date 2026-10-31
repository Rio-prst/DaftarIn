import axios, { type AxiosInstance } from "axios";
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
} from "../types/api";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

/**
 * HTTP Client untuk komunikasi dengan Backend NestJS (/api/v1).
 * Catatan implementasi saat ini:
 * - Backend di folder `backend/` baru berisi scaffold awal NestJS 11 (`GET /` -> "Hello World!").
 * - Saat backend diimplementasikan, autentikasi menggunakan cookie `httpOnly` (`withCredentials: true`),
 *   bukan menyimpan access token di `localStorage`.
 * - Selama endpoint `/api/v1/*` belum tersedia di backend, aplikasi menggunakan adapter lokal
 *   di `src/auth/mockAuth.ts` dan `src/context/AppContext.tsx` dengan kontrak data yang setara.
 */
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  },
});

export async function requestSafe<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
  fallbackData: T,
): Promise<T> {
  try {
    const res = await promise;
    return res.data?.data ?? fallbackData;
  } catch (err) {
    console.warn("[DaftarIn API Adapter: fallback ke penyimpanan browser]", err);
    return fallbackData;
  }
}

export const authApi = {
  login: async (
    identifier: string,
    password: string,
  ): Promise<ApiResponse<{ user: User }>> => {
    return (await api.post("/auth/login", { email: identifier, password })).data;
  },
  getMe: async (): Promise<ApiResponse<User>> => {
    return (await api.get("/auth/me")).data;
  },
  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },
};

export const servicesApi = {
  getAll: async (params?: {
    category?: string;
    region?: string;
    q?: string;
  }): Promise<ApiResponse<ServiceItem[]>> => {
    return (await api.get("/services", { params })).data;
  },
  getById: async (serviceId: string): Promise<ApiResponse<ServiceItem>> => {
    return (await api.get(`/services/${serviceId}`)).data;
  },
  getGuide: async (serviceId: string): Promise<ApiResponse<ServiceGuide>> => {
    return (await api.get(`/services/${serviceId}/guide`)).data;
  },
  evaluateNeeds: async (payload: {
    service_id: string;
    answers: Record<string, string>;
  }): Promise<ApiResponse<{ required_document_ids: string[] }>> => {
    return (await api.post("/service-needs/evaluate", payload)).data;
  },
};

export const preparationsApi = {
  getAll: async (): Promise<ApiResponse<Preparation[]>> => {
    return (await api.get("/preparations")).data;
  },
  getById: async (id: string): Promise<ApiResponse<Preparation>> => {
    return (await api.get(`/preparations/${id}`)).data;
  },
  create: async (serviceId: string): Promise<ApiResponse<Preparation>> => {
    return (await api.post("/preparations", { service_id: serviceId })).data;
  },
  update: async (
    id: string,
    patch: Partial<Preparation> & { expected_data_version?: number },
  ): Promise<ApiResponse<Preparation>> => {
    return (await api.patch(`/preparations/${id}`, patch)).data;
  },
  getDocuments: async (
    preparationId: string,
  ): Promise<ApiResponse<DocumentItem[]>> => {
    return (await api.get(`/preparations/${preparationId}/documents`)).data;
  },
};

export const documentsApi = {
  upload: async (
    preparationId: string,
    file: File,
    docType: string,
  ): Promise<ApiResponse<DocumentItem>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", docType);
    return (
      await api.post(`/preparations/${preparationId}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ).data;
  },
  replaceVersion: async (
    preparationId: string,
    documentId: string,
    file: File,
  ): Promise<ApiResponse<DocumentItem>> => {
    const formData = new FormData();
    formData.append("file", file);
    return (
      await api.post(
        `/preparations/${preparationId}/documents/${documentId}/versions`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
    ).data;
  },
  delete: async (preparationId: string, documentId: string): Promise<void> => {
    await api.delete(`/preparations/${preparationId}/documents/${documentId}`);
  },
};

export const inspectionsApi = {
  run: async (
    preparationId: string,
    expectedDataVersion: number,
    idempotencyKey: string,
  ): Promise<ApiResponse<InspectionRun>> => {
    return (
      await api.post(
        `/preparations/${preparationId}/inspections`,
        { expected_data_version: expectedDataVersion },
        { headers: { "Idempotency-Key": idempotencyKey } },
      )
    ).data;
  },
  getFindings: async (
    preparationId: string,
    inspectionId: string,
  ): Promise<ApiResponse<Finding[]>> => {
    return (
      await api.get(
        `/preparations/${preparationId}/inspections/${inspectionId}/findings`,
      )
    ).data;
  },
  recordCorrection: async (
    preparationId: string,
    findingId: string,
    correctedValue: string,
  ): Promise<ApiResponse<void>> => {
    return (
      await api.post(
        `/preparations/${preparationId}/findings/${findingId}/corrections`,
        {
          corrected_value: correctedValue,
        },
      )
    ).data;
  },
};

export const applicationsApi = {
  getAll: async (): Promise<ApiResponse<ApplicationRecord[]>> => {
    return (await api.get("/applications")).data;
  },
  getById: async (id: string): Promise<ApiResponse<ApplicationRecord>> => {
    return (await api.get(`/applications/${id}`)).data;
  },
  create: async (payload: {
    service_id: string;
    preparation_id?: string;
    official_application_number?: string;
    channel_type: string;
    simulation: boolean;
  }): Promise<ApiResponse<ApplicationRecord>> => {
    return (await api.post("/applications", payload)).data;
  },
  getTimeline: async (
    applicationId: string,
  ): Promise<ApiResponse<StatusEvent[]>> => {
    return (await api.get(`/applications/${applicationId}/timeline`)).data;
  },
  addCitizenNote: async (
    applicationId: string,
    note: string,
  ): Promise<ApiResponse<StatusEvent>> => {
    return (
      await api.post(`/applications/${applicationId}/citizen-notes`, { note })
    ).data;
  },
  confirmResultReceived: async (
    applicationId: string,
    note?: string,
  ): Promise<ApiResponse<StatusEvent>> => {
    return (
      await api.post(
        `/applications/${applicationId}/confirm-result-received`,
        { note },
      )
    ).data;
  },
};

export const officerApi = {
  getAssignments: async (): Promise<ApiResponse<ApplicationRecord[]>> => {
    return (await api.get("/officer/assignments")).data;
  },
  recordEvent: async (
    applicationId: string,
    payload: { status: string; note: string; simulation?: boolean },
  ): Promise<ApiResponse<StatusEvent>> => {
    return (
      await api.post(`/officer/applications/${applicationId}/events`, payload)
    ).data;
  },
};
