export const INSPECTIONS_SERVICE = Symbol('INSPECTIONS_SERVICE');

export type InspectionProgressView = {
  stage: string;
  percent: number;
  message: string;
};

export type InspectionSummaryView = {
  title: string;
  description: string;
  open_findings_count: number;
  must_fix_count: number;
  needs_confirmation_count: number;
  informational_count: number;
  documents_processed: number;
  documents_failed: number;
  documents_skipped: number;
};

export type InspectionFailureView = {
  code: string;
  message: string;
  retryable: boolean;
};

export type InspectionRunView = {
  id: string;
  preparation_id: string;
  status: string;
  result: string | null;
  summary: InspectionSummaryView | null;
  limitations: string[];
  input_snapshot: {
    data_version: number;
    document_versions: { document_id: string; version: number }[];
    guide_version: number;
    rule_version: number;
  };
  progress: InspectionProgressView;
  is_current_for_active_input: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  failure: InspectionFailureView | null;
};

export type InspectionFindingView = {
  id: string;
  inspection_id: string;
  category: string;
  action_level: string;
  status: string;
  title: string;
  explanation: string;
  document_id: string | null;
  document_version: number;
  evidence: {
    page: number;
    field: string | null;
    bounding_box: unknown;
    quoted_text: string | null;
  };
  rule_reference: {
    rule_id: string;
    rule_version: number;
    requirement_id: string;
    sources: { id: string; title: string; url: string }[];
  };
  suggested_action: {
    type: string;
    label: string;
    target?: { document_id: string };
  };
  confidence: {
    value: number;
    meaning: 'reading_confidence';
    threshold_policy: string;
  };
  value_origin: 'machine_read';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type InspectionFindingsResult = {
  data: InspectionFindingView[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

export type CreateInspectionServiceInput = {
  expectedDataVersion: number;
  documentVersions?: { documentId: string; version: number }[];
  consent: {
    accepted: boolean;
    noticeVersion: string;
    purpose: string;
  };
};

export type ListInspectionFindingsInput = {
  status?: string;
  category?: string;
  actionLevel?: string;
  page: number;
  pageSize: number;
};

export type RecordInspectionCorrectionInput = {
  correctedValue: string;
  note?: string | null;
};

export interface IInspectionsService {
  runInspection(
    preparationId: string,
    userId: string,
    input: CreateInspectionServiceInput,
    idempotencyKey?: string,
  ): Promise<InspectionRunView>;
  listInspections(
    preparationId: string,
    userId: string,
  ): Promise<InspectionRunView[]>;
  getInspection(
    preparationId: string,
    inspectionId: string,
    userId: string,
  ): Promise<InspectionRunView>;
  listFindings(
    preparationId: string,
    inspectionId: string,
    userId: string,
    input: ListInspectionFindingsInput,
  ): Promise<InspectionFindingsResult>;
  recordCorrection(
    preparationId: string,
    findingId: string,
    userId: string,
    input: RecordInspectionCorrectionInput,
  ): Promise<{ success: boolean; message: string }>;
}
