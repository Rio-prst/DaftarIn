export const DOCUMENTS_SERVICE = Symbol('DOCUMENTS_SERVICE');

export type DocumentVersionInfo = {
  id: string;
  version: number;
  mime_type: string;
  size_bytes: number;
  page_count: number | null;
  processing_status: string;
  uploaded_at: string;
};

export type DocumentItemView = {
  id: string;
  preparation_id: string;
  requirement_id: string | null;
  document_type: string;
  display_name: string;
  active_version: number;
  status: string;
  version: DocumentVersionInfo;
};

export type DocumentDetailView = DocumentItemView & {
  versions: DocumentVersionInfo[];
};

export type DocumentDeletionResult = {
  document_id: string;
  deletion_status: string;
  message: string;
};

export interface IDocumentsService {
  uploadDocument(
    preparationId: string,
    userId: string,
    file: Express.Multer.File,
    documentType: string,
    requirementId?: string,
    displayName?: string,
  ): Promise<DocumentItemView>;

  uploadNewVersion(
    preparationId: string,
    documentId: string,
    userId: string,
    file: Express.Multer.File,
    displayName?: string,
  ): Promise<DocumentItemView>;

  reuseDocument(
    preparationId: string,
    userId: string,
    sourceDocumentId: string,
    documentType: string,
    userConsent: boolean,
  ): Promise<DocumentItemView>;

  listDocuments(
    preparationId: string,
    userId: string,
  ): Promise<DocumentItemView[]>;

  getDocumentDetail(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<DocumentDetailView>;

  getDocumentContentUrl(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<string>;

  deleteDocument(
    preparationId: string,
    documentId: string,
    userId: string,
  ): Promise<DocumentDeletionResult>;
}
