import axios, { type AxiosInstance } from "axios";
import type {
  ApiResponse,
  ServiceItem,
  ServiceGuide,
  Preparation,
  DocumentItem,
  InspectionRun,
  Finding,
  ApplicationRecord,
  StatusEvent,
} from "../types/api";

import { ApiError, API_BASE_URL, getStoredToken, refreshSession } from "./transport";
export { API_BASE_URL } from "./transport";
export { serverAuth as authApi } from "../auth/serverAuth";

export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(response => response, async error => {
  if (!axios.isAxiosError(error)) throw error;
  const config = error.config as (NonNullable<typeof error.config> & { sessionRetried?: boolean }) | undefined;
  if (error.response?.status === 401 && config && !config.sessionRetried && !config.url?.startsWith('/auth/')) {
    config.sessionRetried = true;
    await refreshSession();
    return api.request(config);
  }
  const body = error.response?.data as { error?: { message?: string; request_id?: string } } | undefined;
  throw new ApiError(error.response?.status || 0, body?.error?.message || (error.response ? 'Permintaan belum berhasil. Coba lagi.' : 'Tidak dapat terhubung ke server.'), body?.error?.request_id);
});

export async function requestSafe<T>(
  promise: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const res = await promise;
  if (!res.data || !("data" in res.data)) throw new ApiError(502, "Respons server belum sesuai.");
  return res.data.data;
}

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
  getQuestions: async (serviceId: string): Promise<ApiResponse<any[]>> => {
    return (await api.get(`/services/${serviceId}/questions`)).data;
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
  create: async (payload: {
    service_id: string;
    display_name?: string;
    answers?: Array<{ question_id: string; value: string }>;
  }): Promise<ApiResponse<Preparation>> => {
    return (await api.post("/preparations", payload)).data;
  },
  update: async (
    id: string,
    patch: Partial<Preparation> & {
      expected_data_version?: number;
      answers?: Array<{ question_id: string; value: string }>;
    },
  ): Promise<ApiResponse<Preparation>> => {
    return (await api.patch(`/preparations/${id}`, patch)).data;
  },
  archive: async (id: string): Promise<ApiResponse<Preparation>> => {
    return (await api.post(`/preparations/${id}/archive`, {})).data;
  },
  restore: async (id: string): Promise<ApiResponse<Preparation>> => {
    return (await api.post(`/preparations/${id}/restore`, {})).data;
  },
  delete: async (id: string): Promise<ApiResponse<void>> => {
    return (await api.delete(`/preparations/${id}`)).data;
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
  submitPreparation: async (
    preparationId: string,
    payload: {
      channel?: string;
      citizen_note?: string;
      consent_version?: string;
      consent_confirmed?: boolean;
    },
  ): Promise<ApiResponse<any>> => {
    return (await api.post(`/preparations/${preparationId}/submissions`, payload)).data;
  },
  resubmit: async (
    id: string,
    payload: {
      changes_summary: string;
      citizen_note?: string;
      consent_version?: string;
      consent_confirmed?: boolean;
    },
  ): Promise<ApiResponse<any>> => {
    return (await api.post(`/applications/${id}/resubmissions`, payload)).data;
  },
  withdraw: async (
    id: string,
    reason: string,
  ): Promise<ApiResponse<any>> => {
    return (await api.post(`/applications/${id}/withdraw`, { reason })).data;
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
  listSubmissions: async (id: string): Promise<ApiResponse<any[]>> => {
    return (await api.get(`/applications/${id}/submissions`)).data;
  },
  getSubmissionDetail: async (
    id: string,
    version: number,
  ): Promise<ApiResponse<any>> => {
    return (await api.get(`/applications/${id}/submissions/${version}`)).data;
  },
};

export const officerApi = {
  getAssignments: async (): Promise<ApiResponse<ApplicationRecord[]>> => {
    return (await api.get("/officer/assignments")).data;
  },
  getApplication: async (
    applicationId: string,
  ): Promise<ApiResponse<any>> => {
    return (await api.get(`/officer/applications/${applicationId}`)).data;
  },
  recordEvent: async (
    applicationId: string,
    payload: {
      event_type?: string;
      status: string;
      note?: string;
      simulation?: boolean;
    },
  ): Promise<ApiResponse<StatusEvent>> => {
    return (
      await api.post(`/officer/applications/${applicationId}/events`, {
        event_type: payload.event_type || 'status_changed',
        ...payload,
      })
    ).data;
  },
  saveEvaluationDraft: async (
    applicationId: string,
    payload: any,
  ): Promise<ApiResponse<any>> => {
    return (
      await api.put(`/officer/applications/${applicationId}/evaluation-draft`, payload)
    ).data;
  },
  submitDecision: async (
    applicationId: string,
    payload: {
      decision: string;
      note?: string;
      overall_notes?: string;
      expected_version?: number;
      revision_due_at?: string;
      items?: any[];
      item_assessments?: any[];
      revision_detail?: any;
    },
  ): Promise<ApiResponse<any>> => {
    const body = {
      decision: payload.decision,
      overall_notes: payload.overall_notes ?? payload.note,
      expected_version: payload.expected_version,
      revision_due_at: payload.revision_due_at,
      items: payload.items ?? payload.item_assessments ?? [],
    };
    return (
      await api.post(`/officer/applications/${applicationId}/decisions`, body)
    ).data;
  },
  createEscalation: async (
    applicationId: string,
    payload: {
      reason: string;
      urgency?: string;
    },
  ): Promise<ApiResponse<any>> => {
    return (
      await api.post(`/officer/applications/${applicationId}/escalations`, payload)
    ).data;
  },
};
