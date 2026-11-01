export const NEEDS_SERVICE = Symbol('NEEDS_SERVICE');

export type AnswerInput = {
  questionId: string;
  value: string | boolean | number | string[];
};

export type EvaluateNeedsInput = {
  serviceId: string;
  regionId: string;
  questionnaireVersion?: number;
  answers: AnswerInput[];
};

export type SourceSummaryView = {
  id: string;
  title: string;
  url: string;
};

export type RequiredDocumentView = {
  requirement_id: string;
  name: string;
  required: boolean;
  reason: string;
  sources: SourceSummaryView[];
};

export type EvaluateNeedsResult = {
  service_id: string;
  region_id: string;
  questionnaire_version: number;
  required_documents: RequiredDocumentView[];
  changed_requirements: unknown[];
  next_action: {
    type: string;
    requires_authentication: boolean;
  };
};

export interface INeedsService {
  evaluateNeeds(input: EvaluateNeedsInput): Promise<EvaluateNeedsResult>;
}
