import type { InspectionResult } from '../inspection.schema';

export const INSPECTION_AI_PROVIDER = Symbol('INSPECTION_AI_PROVIDER');

export type InspectionRequirementInput = {
  id: string;
  code: string;
  title: string;
  description: string;
  required: boolean;
};

export type InspectionAnswerInput = {
  questionKey: string;
  label: string;
  value: string;
};

export type InspectionDocumentInput = {
  documentVersionId: string;
  documentType: string;
  mimeType: string;
  filename: string;
  buffer: Buffer;
  requirement: InspectionRequirementInput;
  answers: InspectionAnswerInput[];
};

export type InspectionAiResult = InspectionResult & {
  modelVersion: string;
};

export interface IInspectionAiProvider {
  analyzeDocument(input: InspectionDocumentInput): Promise<InspectionAiResult>;
}
