import type {
  CreatePreparationRepositoryInput,
  ListPreparationsRepositoryInput,
  UpdatePreparationAnswersRepositoryInput,
} from './preparations.repository.interface';

export const PREPARATIONS_SERVICE = Symbol('PREPARATIONS_SERVICE');

export type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type PreparationItemView = {
  id: string;
  internal_reference: string;
  status: string;
  readiness: string;
  service: {
    id: string;
    name: string;
    slug: string;
  };
  region: {
    id: string;
    name: string;
  };
  guide_version: number;
  data_version: number;
  latest_inspection_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PreparationAnswerView = {
  question_id: string;
  question_key: string;
  label: string;
  value: unknown;
};

export type PreparationDocumentSummaryView = {
  id: string;
  document_type: string;
  active_version: number;
  original_filename: string;
  file_size_bytes: number;
  status: string;
};

export type PreparationDetailView = {
  id: string;
  internal_reference: string;
  owner_id: string;
  service_id: string;
  region_id: string;
  guide_version: number;
  status: string;
  data_version: number;
  active_inspection_id: string | null;
  latest_inspection_id: string | null;
  readiness: string;
  is_archived: boolean;
  is_stale: boolean;
  service: {
    id: string;
    name: string;
    slug: string;
  };
  region: {
    id: string;
    name: string;
  };
  answers: PreparationAnswerView[];
  documents: PreparationDocumentSummaryView[];
  created_at: string;
  updated_at: string;
};

export type PreparationRequirementView = {
  requirement_id: string;
  code: string;
  name: string;
  description: string;
  required: boolean;
  reason: string;
  fulfilled: boolean;
  sources: {
    id: string;
    title: string;
    url: string;
  }[];
  document: {
    id: string;
    version: number;
    filename: string;
  } | null;
};

export type PreparationRequirementsResult = {
  preparation_id: string;
  requirements: PreparationRequirementView[];
  change_notice: string | null;
};

export type ListPreparationsResult = {
  data: PreparationItemView[];
  meta: PaginationMeta;
};

export interface IPreparationsService {
  listPreparations(
    input: ListPreparationsRepositoryInput,
  ): Promise<ListPreparationsResult>;
  createPreparation(
    input: CreatePreparationRepositoryInput,
  ): Promise<PreparationDetailView>;
  getPreparation(id: string, userId: string): Promise<PreparationDetailView>;
  updatePreparation(
    input: UpdatePreparationAnswersRepositoryInput & {
      userId: string;
      expectedDataVersion?: number;
    },
  ): Promise<PreparationDetailView>;
  archivePreparation(
    id: string,
    userId: string,
  ): Promise<PreparationDetailView>;
  restorePreparation(
    id: string,
    userId: string,
  ): Promise<PreparationDetailView>;
  deletePreparation(
    id: string,
    userId: string,
  ): Promise<{ message: string }>;
  getPreparationRequirements(
    id: string,
    userId: string,
  ): Promise<PreparationRequirementsResult>;
}
