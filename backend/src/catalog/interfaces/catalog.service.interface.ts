import type {
  ListRegionsInput,
  ListServicesInput,
} from './catalog.repository.interface';

export const CATALOG_SERVICE = Symbol('CATALOG_SERVICE');

export type SourceHealth =
  'available' | 'unavailable' | 'conflicting' | 'needs_review' | 'unknown';

export type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type RegionView = {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
};

export type AgencySummaryView = {
  id: string;
  name: string;
};

export type RegionSummaryView = {
  id: string;
  name: string;
};

export type CategoryView = {
  id: string;
  name: string;
};

export type ChannelView = {
  id: string | null;
  type: string;
  label: string;
  url: string | null;
  instructions: string | null;
};

export type ServiceSummaryView = {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  agency: AgencySummaryView;
  region: RegionSummaryView;
  category: CategoryView;
  publication_status: string;
  current_guide_version: number | null;
  source_health: SourceHealth;
  reviewed_at: string | null;
};

export type ServiceDetailView = ServiceSummaryView & {
  agency: AgencySummaryView & {
    region_id: string;
    description: string | null;
    channels: ChannelView[];
  };
  region: RegionSummaryView & {
    type: string;
    parent_id: string | null;
  };
  channels: ChannelView[];
  published_at: string | null;
};

export type SourceSummaryView = {
  id: string;
  title: string;
  url: string;
};

export type SourceSupportView = {
  guide_section_id: string | null;
  title: string;
  claim_or_field: string;
};

export type SourceView = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published_at: string | null;
  accessed_at: string;
  source_status: SourceHealth;
  supports: SourceSupportView[];
};

export type RequirementView = {
  id: string;
  name: string;
  description: string;
  required: boolean;
  condition: unknown;
  sources: SourceSummaryView[];
};

export type ProcedureStepView = {
  step: number;
  title: string;
  description: string;
};

export type OfficialFeeView = {
  status: string;
  amount: number | null;
  currency: string | null;
  display_text: string;
  sources: SourceSummaryView[];
};

export type OfficialDurationView = {
  status: string;
  value: number | null;
  unit: string | null;
  basis: string | null;
  display_text: string;
  sources: SourceSummaryView[];
};

export type GuideView = {
  service_id: string;
  version: number;
  published_at: string | null;
  reviewed_at: string | null;
  summary: string | null;
  requirements: RequirementView[];
  procedure_steps: ProcedureStepView[];
  official_fee: OfficialFeeView;
  official_processing_time: OfficialDurationView;
  channels: ChannelView[];
  sources: SourceView[];
  source_health: SourceHealth;
  change_notice: string | null;
};

export type QuestionOptionView = {
  value: string;
  label: string;
};

export type QuestionView = {
  id: string;
  key: string;
  label: string;
  help_text: string | null;
  type: string;
  required: boolean;
  options: QuestionOptionView[] | null;
  visible_if: unknown;
  requirements_effect: string[];
  validation: unknown;
};

export type QuestionsView = {
  service_id: string;
  questionnaire_version: number;
  questions: QuestionView[];
};

export type SourcesView = {
  service_id: string;
  sources: SourceView[];
};

export type RegionListResult = {
  data: RegionView[];
  meta: PaginationMeta;
};

export type ServiceListResult = {
  data: ServiceSummaryView[];
  meta: PaginationMeta;
};

export interface ICatalogService {
  listRegions(input: ListRegionsInput): Promise<RegionListResult>;
  listServices(input: ListServicesInput): Promise<ServiceListResult>;
  getService(serviceId: string): Promise<ServiceDetailView>;
  getServiceGuide(serviceId: string): Promise<GuideView>;
  getServiceQuestions(serviceId: string): Promise<QuestionsView>;
  getServiceSources(serviceId: string): Promise<SourcesView>;
}
