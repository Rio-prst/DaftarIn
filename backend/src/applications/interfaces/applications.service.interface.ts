import type { CreateApplicationDto } from '../dto/create-application.dto';
import type { ListApplicationsQueryDto } from '../dto/list-applications.query.dto';
import type { CreateCitizenNoteDto } from '../dto/create-citizen-note.dto';
import type { ConfirmResultReceivedDto } from '../dto/confirm-result-received.dto';
import type {
  CreateResubmissionDto,
  CreateSubmissionDto,
} from '../dto/create-submission.dto';
import type { WithdrawApplicationDto } from '../dto/withdraw-application.dto';

export const APPLICATIONS_SERVICE = Symbol('APPLICATIONS_SERVICE');

export interface ApplicationChannelView {
  type: 'online' | 'in_person' | 'email' | 'other';
  label?: string | null;
  url?: string | null;
}

export interface ApplicationItemView {
  id: string;
  internal_reference: string;
  service_id: string;
  service: {
    id: string;
    name: string;
    category: string;
    slug: string;
  };
  agency: {
    id: string;
    name: string;
    agency_type: string;
  };
  preparation_id: string | null;
  preparation?: {
    id: string;
    internal_reference: string;
    status: string;
  } | null;
  official_application_number: string | null;
  official_number_source:
    | 'not_provided'
    | 'citizen_reported'
    | 'officer_verified'
    | 'official_integration';
  submitted_at: string | null;
  channel: ApplicationChannelView;
  source_mode: string;
  current_status: string;
  review_status?: string;
  simulation: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApplicationDetailView extends ApplicationItemView {
  citizen_notes: string | null;
  latest_event?: StatusEventView | null;
}

export interface StatusEventView {
  id: string;
  application_id: string;
  event_type: string;
  status: string;
  source_type: string;
  source_label: string;
  occurred_at: string;
  recorded_at: string;
  actor?: {
    id: string | null;
    name: string | null;
  } | null;
  note: string | null;
  simulation: boolean;
  correction_of_event_id: string | null;
}

export interface ApplicationTimelineResult {
  application_id: string;
  source_mode: string;
  official_updates_available: boolean;
  message: string;
  events: StatusEventView[];
}

export interface ListApplicationsResult {
  data: ApplicationItemView[];
  meta: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
}

export interface SubmissionSnapshotItemView {
  id: string;
  application_id: string;
  preparation_id: string;
  version_number: number;
  submitted_at: string;
  citizen_note?: string | null;
  changes_summary?: string | null;
  consent_version: string;
  reviews: any[];
}

export interface SubmissionSnapshotDetailView extends SubmissionSnapshotItemView {
  service: any;
  applicant: any;
  answers: any[];
  documents: any[];
  required_slots: any;
}

export interface IApplicationsService {
  createApplication(
    userId: string,
    dto: CreateApplicationDto,
  ): Promise<ApplicationDetailView>;
  listApplications(
    userId: string,
    query: ListApplicationsQueryDto,
  ): Promise<ListApplicationsResult>;
  getApplication(id: string, userId: string): Promise<ApplicationDetailView>;
  getTimeline(id: string, userId: string): Promise<ApplicationTimelineResult>;
  addCitizenNote(
    id: string,
    userId: string,
    dto: CreateCitizenNoteDto,
  ): Promise<StatusEventView>;
  confirmResultReceived(
    id: string,
    userId: string,
    dto: ConfirmResultReceivedDto,
  ): Promise<ApplicationDetailView>;
  linkPreparation(
    id: string,
    userId: string,
    preparationId: string,
  ): Promise<ApplicationDetailView>;
  submitPreparation(
    preparationId: string,
    userId: string,
    dto: CreateSubmissionDto,
  ): Promise<SubmissionSnapshotDetailView>;
  resubmitApplication(
    applicationId: string,
    userId: string,
    dto: CreateResubmissionDto,
  ): Promise<SubmissionSnapshotDetailView>;
  listSubmissions(
    applicationId: string,
    userId: string,
  ): Promise<SubmissionSnapshotItemView[]>;
  getSubmissionDetail(
    applicationId: string,
    versionNumber: number,
    userId: string,
  ): Promise<SubmissionSnapshotDetailView>;
  withdrawApplication(
    applicationId: string,
    userId: string,
    dto: WithdrawApplicationDto,
  ): Promise<ApplicationDetailView>;
}
