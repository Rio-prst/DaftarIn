/**
 * JejakMasWowo / DaftarIn — Canonical API Contract Types (v1.0)
 * Sesuai spesifikasi resmi di backend/docs/API-Contract.md
 */

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      issue?: string;
      message: string;
    }>;
    request_id?: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    request_id?: string;
    page?: number;
    page_size?: number;
    total_items?: number;
    total_pages?: number;
  };
}

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  display_name: string;
  email: string;
  email_verified: boolean;
  roles: UserRole[];
  status: 'active' | 'suspended';
  created_at: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  category: {
    id: string;
    name: string;
  };
  summary: string;
  agency: {
    id: string;
    name: string;
  };
  region: {
    id: string;
    name: string;
  };
  publication_status: 'published' | 'draft';
  current_guide_version: number;
  source_health: 'available' | 'unavailable' | 'conflicting' | 'needs_review' | 'unknown';
  reviewed_at: string;
}

export interface ServiceGuide {
  service_id: string;
  version: number;
  published_at: string | null;
  reviewed_at: string | null;
  summary: string;
  requirements: Array<{
    id: string;
    name: string;
    description: string;
    required: boolean;
    condition: string | null;
    sources: Array<{ id: string; title: string; url: string }>;
  }>;
  procedure_steps: Array<{
    step: number;
    title: string;
    description: string;
  }>;
  official_fee: {
    status: 'known' | 'unknown' | 'conflicting' | 'needs_review';
    amount: number | null;
    currency: string;
    display_text: string;
  };
  official_processing_time: {
    status: 'known' | 'unknown' | 'conflicting' | 'needs_review';
    value: number | null;
    unit: string | null;
    basis: string | null;
    display_text: string;
  };
  channels: Array<{
    id: string;
    type: 'website' | 'in_person' | 'mobile_app';
    label: string;
    url: string | null;
    instructions?: string;
  }>;
}

export type PreparationStatus =
  | 'draft'
  | 'queued'
  | 'inspecting'
  | 'needs_completion'
  | 'needs_review'
  | 'ready_initial_check'
  | 'inspection_incomplete'
  | 'needs_new_inspection'
  | 'archived';

export type ReadinessStatus =
  | 'not_assessed'
  | 'needs_completion'
  | 'needs_review'
  | 'ready_initial_check'
  | 'inspection_incomplete'
  | 'stale';

export interface Preparation {
  id: string;
  internal_reference: string; // e.g. "PREP-2026-000001"
  owner_id: string;
  service_id: string;
  region_id: string;
  guide_version: number;
  status: PreparationStatus;
  data_version: number;
  active_inspection_id: string | null;
  latest_inspection_id: string | null;
  readiness: ReadinessStatus;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  preparation_id: string;
  requirement_id: string | null;
  document_type: string;
  display_name: string;
  active_version: number;
  status: 'uploaded' | 'missing' | 'replaced' | 'deleted';
  created_at: string;
  updated_at: string;
}

export type InspectionStatus = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export type InspectionResult = 'needs_completion' | 'needs_review' | 'ready_initial_check' | 'incomplete';

export interface InspectionRun {
  id: string;
  preparation_id: string;
  status: InspectionStatus;
  result: InspectionResult | null;
  input_snapshot: {
    data_version: number;
    document_versions: Array<{ document_id: string; version: number }>;
    guide_version: number;
    rule_version: number;
  };
  progress: {
    stage: string;
    percent: number;
    message: string;
  };
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export type FindingCategory =
  | 'completeness'
  | 'document_type'
  | 'readability'
  | 'required_data'
  | 'data_mismatch'
  | 'uncertainty'
  | 'technical';

export type FindingActionLevel = 'must_fix' | 'needs_confirmation' | 'information';
export type FindingStatus = 'open' | 'resolved_in_new_version' | 'needs_confirmation' | 'not_applicable';

export interface Finding {
  id: string;
  inspection_id: string;
  category: FindingCategory;
  action_level: FindingActionLevel;
  status: FindingStatus;
  title: string;
  explanation: string;
  document_id: string;
  document_version: number;
  evidence: {
    page: number;
    field: string | null;
    bounding_box: any | null;
    quoted_text: string | null;
  };
  rule_reference: {
    rule_id: string;
    rule_version: number;
    requirement_id: string;
    sources: Array<{ id: string; title: string; url: string }>;
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
  value_origin: 'machine_read' | 'citizen_entered' | 'citizen_corrected';
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
}

export type ApplicationStatus =
  | 'citizen_recorded_unconfirmed'
  | 'accepted'
  | 'verification'
  | 'needs_correction'
  | 'processing'
  | 'completed'
  | 'result_received_by_citizen';

export type SourceType =
  | 'citizen'
  | 'officer'
  | 'official_integration'
  | 'simulation'
  | 'system_reminder';

export interface ApplicationRecord {
  id: string;
  internal_reference: string; // e.g. "APP-2026-000001"
  owner_id: string;
  service_id: string;
  preparation_id: string | null;
  official_application_number: string | null;
  official_number_source: 'not_provided' | 'citizen_reported' | 'officer_verified' | 'official_integration';
  submitted_at: string;
  channel: {
    type: 'in_person' | 'website' | 'mobile_app';
    label: string;
    url: string | null;
  };
  source_mode: 'citizen_recorded' | 'officer_recorded' | 'official_integration' | 'simulation';
  current_status: ApplicationStatus;
  simulation: boolean;
  created_at: string;
  updated_at: string;
}

export interface StatusEvent {
  id: string;
  application_id: string;
  event_type: 'status_changed' | 'citizen_note' | 'reminder';
  status: ApplicationStatus;
  source_type: SourceType;
  source_label: string;
  occurred_at: string;
  recorded_at: string;
  actor: {
    id: string | null;
    role: string;
  };
  note: string;
  simulation: boolean;
}
