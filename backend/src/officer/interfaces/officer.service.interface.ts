import type { CreateOfficerEventDto } from '../dto/create-officer-event.dto';
import type { ListAssignmentsQueryDto } from '../dto/list-assignments.query.dto';
import type { EvaluationDraftDto } from '../dto/evaluation-draft.dto';
import type { SubmitDecisionDto } from '../dto/submit-decision.dto';
import type { CreateOfficerEscalationDto } from '../dto/create-escalation.dto';

export const OFFICER_SERVICE = Symbol('OFFICER_SERVICE');

export interface OfficerAssignmentItemView {
  id: string;
  application_id: string;
  internal_reference: string;
  official_application_number: string | null;
  service: {
    id: string;
    name: string;
    category: string;
  };
  agency: {
    id: string;
    name: string;
  };
  citizen: {
    id: string;
    name: string;
  };
  current_status: string;
  assigned_at: string;
}

export interface ListAssignmentsResult {
  data: OfficerAssignmentItemView[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface OfficerApplicationTimelineItem {
  id: string;
  event_type: string;
  status: string;
  source_type: string;
  source_label: string;
  occurred_at: string;
  recorded_at: string;
  note: string | null;
  actor: {
    id: string | null;
    name: string | null;
  } | null;
}

export interface OfficerApplicationDetailView {
  id: string;
  internal_reference: string;
  official_application_number: string | null;
  service: {
    id: string;
    name: string;
    category: string;
    slug: string;
  };
  agency: {
    id: string;
    name: string;
  };
  citizen: {
    id: string;
    name: string;
  };
  submitted_at: string | null;
  current_status: string;
  timeline: OfficerApplicationTimelineItem[];
  allowed_actions: string[];
}

export interface OfficerEventResultView {
  id: string;
  application_id: string;
  event_type: string;
  status: string;
  source_type: string;
  source_label: string;
  occurred_at: string;
  recorded_at: string;
  revision_request?: {
    reason: string;
    actions: Array<{ type: string; label: string }>;
    due_at?: string | null;
  } | null;
  simulation: boolean;
}

export interface OfficerDocumentItemView {
  id: string;
  document_type: string;
  display_name: string;
  version_number: number;
  mime_type: string;
  size_bytes: number;
  uploaded_at: string;
}

export interface IOfficerService {
  listAssignments(
    officerUserId: string,
    query: ListAssignmentsQueryDto,
  ): Promise<ListAssignmentsResult>;
  getApplicationDetail(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerApplicationDetailView>;
  createEvent(
    applicationId: string,
    officerUserId: string,
    dto: CreateOfficerEventDto,
  ): Promise<OfficerEventResultView>;
  getApplicationDocuments(
    applicationId: string,
    officerUserId: string,
  ): Promise<OfficerDocumentItemView[]>;
  getApplicationDocumentContentUrl(
    applicationId: string,
    documentId: string,
    officerUserId: string,
  ): Promise<string>;
  saveEvaluationDraft(
    applicationId: string,
    officerUserId: string,
    dto: EvaluationDraftDto,
  ): Promise<any>;
  submitDecision(
    applicationId: string,
    officerUserId: string,
    dto: SubmitDecisionDto,
  ): Promise<any>;
  createEscalation(
    applicationId: string,
    officerUserId: string,
    dto: CreateOfficerEscalationDto,
  ): Promise<any>;
}
