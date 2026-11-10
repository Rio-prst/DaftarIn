import { Injectable } from '@nestjs/common';
import {
  FindingResolutionStatus,
  FindingSeverity,
  InspectionStatus,
} from '../generated/prisma/client';
import type {
  FindingWithRelations,
  InspectionRunWithRuleVersion,
} from './interfaces/inspections.repository.interface';
import type {
  InspectionFailureView,
  InspectionFindingView,
  InspectionProgressView,
  InspectionRunView,
  InspectionSummaryView,
} from './interfaces/inspections.service.interface';

export const INSPECTION_LIMITATIONS: string[] = [
  'Pemeriksaan ini adalah asistensi otomatis dan bukan keputusan resmi instansi.',
  'Petugas verifikator tetap melakukan verifikasi akhir terhadap dokumen fisik maupun digital.',
  'Hasil pembacaan dapat dipengaruhi oleh kualitas pemindaian, pencahayaan, atau resolusi berkas.',
];

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

@Injectable()
export class InspectionMapper {
  mapFindingActionLevel(severity: FindingSeverity): string {
    switch (severity) {
      case FindingSeverity.BLOCKING:
        return 'must_fix';
      case FindingSeverity.WARNING:
        return 'needs_confirmation';
      case FindingSeverity.INFO:
      default:
        return 'information';
    }
  }

  mapFindingStatus(status: FindingResolutionStatus): string {
    switch (status) {
      case FindingResolutionStatus.OPEN:
        return 'open';
      case FindingResolutionStatus.CORRECTED:
      case FindingResolutionStatus.CONFIRMED_BY_USER:
        return 'resolved_in_new_version';
      case FindingResolutionStatus.NEEDS_OFFICIAL_CONFIRMATION:
        return 'needs_confirmation';
      case FindingResolutionStatus.DISMISSED:
      default:
        return 'not_applicable';
    }
  }

  mapRunStatus(status: InspectionStatus): string {
    switch (status) {
      case InspectionStatus.QUEUED:
        return 'queued';
      case InspectionStatus.RUNNING:
        return 'running';
      case InspectionStatus.COMPLETED:
        return 'completed';
      case InspectionStatus.FAILED:
        return 'failed';
      case InspectionStatus.CANCELLED:
        return 'cancelled';
      default:
        return 'queued';
    }
  }

  mapProgress(status: InspectionStatus): InspectionProgressView {
    switch (status) {
      case InspectionStatus.QUEUED:
        return {
          stage: 'queued',
          percent: 10,
          message: 'Menunggu giliran pemeriksaan dokumen',
        };
      case InspectionStatus.RUNNING:
        return {
          stage: 'inspecting',
          percent: 50,
          message: 'Sedang memeriksa dokumen dan kesesuaian data',
        };
      case InspectionStatus.COMPLETED:
        return {
          stage: 'completed',
          percent: 100,
          message: 'Pemeriksaan dokumen selesai',
        };
      case InspectionStatus.FAILED:
        return {
          stage: 'failed',
          percent: 100,
          message: 'Pemeriksaan dokumen tidak dapat diselesaikan',
        };
      case InspectionStatus.CANCELLED:
        return {
          stage: 'cancelled',
          percent: 100,
          message: 'Pemeriksaan dokumen dibatalkan',
        };
      default:
        return {
          stage: 'queued',
          percent: 0,
          message: 'Menunggu antrean',
        };
    }
  }

  mapResult(
    status: InspectionStatus,
    summary: InspectionSummaryView | null,
  ): string | null {
    if (
      status === InspectionStatus.FAILED ||
      status === InspectionStatus.CANCELLED
    ) {
      return 'incomplete';
    }
    if (status !== InspectionStatus.COMPLETED) {
      return null;
    }
    if (!summary) {
      return 'ready_initial_check';
    }
    if (summary.must_fix_count > 0) {
      return 'needs_completion';
    }
    if (summary.needs_confirmation_count > 0) {
      return 'needs_review';
    }
    return 'ready_initial_check';
  }

  mapFailure(failureCode: string | null): InspectionFailureView | null {
    if (!failureCode) return null;
    const messages: Record<string, string> = {
      INSPECTION_STALE:
        'Pemeriksaan sebelumnya telah kedaluwarsa atau terputus.',
      AI_SERVICE_UNAVAILABLE:
        'Layanan AI/OCR sementara tidak tersedia. Silakan coba kembali.',
      INVALID_PAYLOAD:
        'Format berkas dokumen tidak sesuai untuk pemeriksaan otomatis.',
      INSPECTION_FAILED:
        'Terjadi kendala saat memeriksa berkas. Silakan coba kembali.',
    };

    return {
      code: failureCode,
      message:
        messages[failureCode] ??
        'Pemeriksaan dokumen belum berhasil diselesaikan.',
      retryable: true,
    };
  }

  mapFindingToView(finding: FindingWithRelations): InspectionFindingView {
    const evidenceRaw = asRecord(finding.evidenceJson);
    const actionsRaw = asRecord(finding.suggestedActionsJson);
    const latestCorrection = finding.userCorrections[0];

    const evidence = {
      page: typeof evidenceRaw.page === 'number' ? evidenceRaw.page : 1,
      field: typeof evidenceRaw.field === 'string' ? evidenceRaw.field : null,
      bounding_box: evidenceRaw.bounding_box ?? null,
      quoted_text:
        typeof evidenceRaw.quoted_text === 'string'
          ? evidenceRaw.quoted_text
          : null,
    };

    const suggested_action = {
      type:
        typeof actionsRaw.type === 'string'
          ? actionsRaw.type
          : 'check_document',
      label:
        typeof actionsRaw.label === 'string'
          ? actionsRaw.label
          : 'Periksa kembali dokumen ini',
      target:
        actionsRaw.target && typeof actionsRaw.target === 'object'
          ? (actionsRaw.target as { document_id: string })
          : finding.documentVersionId
            ? { document_id: finding.documentVersionId }
            : undefined,
    };

    const sources = finding.requirement.source
      ? [
          {
            id: finding.requirement.source.id,
            title: finding.requirement.source.title,
            url: finding.requirement.source.url,
          },
        ]
      : [];

    return {
      id: finding.id,
      inspection_id: finding.inspectionRunId,
      category: finding.category,
      action_level: this.mapFindingActionLevel(finding.severity),
      status: this.mapFindingStatus(finding.resolutionStatus),
      title: finding.title,
      explanation: finding.explanation,
      document_id: finding.documentVersionId,
      document_version: finding.documentVersion?.versionNumber ?? 1,
      evidence,
      rule_reference: {
        rule_id: finding.inspectionRun.ruleVersion.id,
        rule_version: finding.inspectionRun.ruleVersion.versionNumber,
        requirement_id: finding.requirementId,
        sources,
      },
      suggested_action,
      confidence: {
        value: finding.readingConfidence ?? 0.8,
        meaning: 'reading_confidence',
        threshold_policy: 'warning_below_80_percent',
      },
      value_origin: 'machine_read',
      resolved_by: latestCorrection?.userId ?? null,
      resolved_at: latestCorrection?.createdAt.toISOString() ?? null,
      created_at: finding.createdAt.toISOString(),
    };
  }

  mapRunToView(
    run: InspectionRunWithRuleVersion,
    activeDataVersion: number,
  ): InspectionRunView {
    const rawSnapshot = asRecord(run.inputSnapshotJson);
    const summary = (run.summaryJson as InspectionSummaryView | null) ?? null;
    const documentVersionsRaw = Array.isArray(rawSnapshot.document_versions)
      ? rawSnapshot.document_versions
      : [];

    const document_versions = documentVersionsRaw.map((item) => {
      const rec = asRecord(item);
      return {
        document_id: typeof rec.document_id === 'string' ? rec.document_id : '',
        version: typeof rec.version === 'number' ? rec.version : 1,
      };
    });

    return {
      id: run.id,
      preparation_id: run.preparationId,
      status: this.mapRunStatus(run.status),
      result: this.mapResult(run.status, summary),
      summary,
      limitations: INSPECTION_LIMITATIONS,
      input_snapshot: {
        data_version: run.dataVersion,
        document_versions,
        guide_version:
          typeof rawSnapshot.guide_version === 'number'
            ? rawSnapshot.guide_version
            : 1,
        rule_version: run.ruleVersion.versionNumber,
      },
      progress: this.mapProgress(run.status),
      is_current_for_active_input: run.dataVersion === activeDataVersion,
      started_at: run.startedAt?.toISOString() ?? null,
      completed_at: run.completedAt?.toISOString() ?? null,
      created_at: run.queuedAt.toISOString(),
      failure: this.mapFailure(run.failureCode),
    };
  }
}
