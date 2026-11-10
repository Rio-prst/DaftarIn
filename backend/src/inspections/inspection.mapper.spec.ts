import {
  FindingResolutionStatus,
  FindingSeverity,
  InspectionStatus,
} from '../generated/prisma/client';
import { InspectionMapper, INSPECTION_LIMITATIONS } from './inspection.mapper';
import type {
  FindingWithRelations,
  InspectionRunWithRuleVersion,
} from './interfaces/inspections.repository.interface';

describe('InspectionMapper', () => {
  let mapper: InspectionMapper;

  beforeEach(() => {
    mapper = new InspectionMapper();
  });

  describe('mapFindingActionLevel', () => {
    it('maps severities to expected contract action levels', () => {
      expect(mapper.mapFindingActionLevel(FindingSeverity.BLOCKING)).toBe(
        'must_fix',
      );
      expect(mapper.mapFindingActionLevel(FindingSeverity.WARNING)).toBe(
        'needs_confirmation',
      );
      expect(mapper.mapFindingActionLevel(FindingSeverity.INFO)).toBe(
        'information',
      );
    });
  });

  describe('mapFindingStatus', () => {
    it('maps resolution statuses correctly', () => {
      expect(mapper.mapFindingStatus(FindingResolutionStatus.OPEN)).toBe(
        'open',
      );
      expect(mapper.mapFindingStatus(FindingResolutionStatus.CORRECTED)).toBe(
        'resolved_in_new_version',
      );
      expect(
        mapper.mapFindingStatus(FindingResolutionStatus.CONFIRMED_BY_USER),
      ).toBe('resolved_in_new_version');
      expect(
        mapper.mapFindingStatus(
          FindingResolutionStatus.NEEDS_OFFICIAL_CONFIRMATION,
        ),
      ).toBe('needs_confirmation');
      expect(mapper.mapFindingStatus(FindingResolutionStatus.DISMISSED)).toBe(
        'not_applicable',
      );
    });
  });

  describe('mapRunStatus and mapProgress', () => {
    it('maps run status to lowercase string', () => {
      expect(mapper.mapRunStatus(InspectionStatus.RUNNING)).toBe('running');
      expect(mapper.mapRunStatus(InspectionStatus.COMPLETED)).toBe('completed');
      expect(mapper.mapRunStatus(InspectionStatus.FAILED)).toBe('failed');
    });

    it('returns progress stage and percent', () => {
      const runningProgress = mapper.mapProgress(InspectionStatus.RUNNING);
      expect(runningProgress.stage).toBe('inspecting');
      expect(runningProgress.percent).toBe(50);

      const completedProgress = mapper.mapProgress(InspectionStatus.COMPLETED);
      expect(completedProgress.stage).toBe('completed');
      expect(completedProgress.percent).toBe(100);
    });
  });

  describe('mapResult', () => {
    it('returns incomplete for failed status', () => {
      expect(mapper.mapResult(InspectionStatus.FAILED, null)).toBe(
        'incomplete',
      );
    });

    it('returns null while running or queued', () => {
      expect(mapper.mapResult(InspectionStatus.RUNNING, null)).toBeNull();
    });

    it('evaluates summary correctly for completed runs', () => {
      expect(
        mapper.mapResult(InspectionStatus.COMPLETED, {
          title: 'ok',
          description: '',
          open_findings_count: 1,
          must_fix_count: 1,
          needs_confirmation_count: 0,
          informational_count: 0,
          documents_processed: 1,
          documents_failed: 0,
          documents_skipped: 0,
        }),
      ).toBe('needs_completion');

      expect(
        mapper.mapResult(InspectionStatus.COMPLETED, {
          title: 'ok',
          description: '',
          open_findings_count: 1,
          must_fix_count: 0,
          needs_confirmation_count: 1,
          informational_count: 0,
          documents_processed: 1,
          documents_failed: 0,
          documents_skipped: 0,
        }),
      ).toBe('needs_review');

      expect(
        mapper.mapResult(InspectionStatus.COMPLETED, {
          title: 'ok',
          description: '',
          open_findings_count: 0,
          must_fix_count: 0,
          needs_confirmation_count: 0,
          informational_count: 0,
          documents_processed: 1,
          documents_failed: 0,
          documents_skipped: 0,
        }),
      ).toBe('ready_initial_check');
    });
  });

  describe('mapFindingToView', () => {
    it('transforms FindingWithRelations into InspectionFindingView', () => {
      const finding: FindingWithRelations = {
        id: 'finding-1',
        inspectionRunId: 'run-1',
        requirementId: 'req-1',
        documentVersionId: 'doc-1',
        findingCode: 'NAME_MISMATCH',
        severity: FindingSeverity.WARNING,
        category: 'data_mismatch',
        title: 'Nama tidak cocok',
        explanation: 'Nama pada dokumen berbeda dengan formulir.',
        evidenceJson: { quoted_text: 'Budi Santoso', page: 1, field: 'name' },
        suggestedActionsJson: {
          type: 'correct_issue',
          label: 'Sesuaikan nama',
        },
        readingConfidence: 0.92,
        resolutionStatus: FindingResolutionStatus.OPEN,
        createdAt: new Date('2026-11-10T10:00:00Z'),
        updatedAt: new Date('2026-11-10T10:00:00Z'),
        documentVersion: {
          id: 'doc-1',
          versionNumber: 2,
          originalFilename: 'ktp.jpg',
        },
        requirement: {
          id: 'req-1',
          ruleVersionId: 'rule-v1',
          sourceId: 'src-1',
          requirementCode: 'REQ_KTP',
          title: 'KTP Elektronik',
          description: 'Foto/scan KTP',
          isMandatory: true,
          conditionJson: null,
          displayOrder: 1,
          requirementType: 'GENERAL',
          source: {
            id: 'src-1',
            title: 'Permendagri',
            url: 'https://example.com/law',
          },
        },
        inspectionRun: {
          id: 'run-1',
          preparationId: 'prep-1',
          userId: 'user-1',
          guideVersionId: 'guide-1',
          ruleVersionId: 'rule-v1',
          dataVersion: 1,
          status: InspectionStatus.COMPLETED,
          engineVersion: 'gemini-ocr-v1',
          modelVersion: 'gemini-3.5-flash-lite',
          inputSnapshotJson: {},
          summaryJson: null,
          failureCode: null,
          queuedAt: new Date('2026-11-10T09:59:00Z'),
          startedAt: new Date('2026-11-10T09:59:01Z'),
          completedAt: new Date('2026-11-10T10:00:00Z'),
          ruleVersion: {
            id: 'rule-v1',
            versionNumber: 3,
          },
        },
        userCorrections: [],
      };

      const view = mapper.mapFindingToView(finding);

      expect(view.id).toBe('finding-1');
      expect(view.action_level).toBe('needs_confirmation');
      expect(view.status).toBe('open');
      expect(view.evidence.quoted_text).toBe('Budi Santoso');
      expect(view.evidence.field).toBe('name');
      expect(view.rule_reference.rule_version).toBe(3);
      expect(view.rule_reference.sources[0].title).toBe('Permendagri');
      expect(view.document_version).toBe(2);
    });
  });

  describe('mapRunToView', () => {
    it('transforms InspectionRunWithRuleVersion into InspectionRunView', () => {
      const run: InspectionRunWithRuleVersion = {
        id: 'run-1',
        preparationId: 'prep-1',
        userId: 'user-1',
        guideVersionId: 'guide-1',
        ruleVersionId: 'rule-v1',
        dataVersion: 2,
        status: InspectionStatus.COMPLETED,
        engineVersion: 'gemini-ocr-v1',
        modelVersion: 'gemini-3.5-flash-lite',
        inputSnapshotJson: {
          data_version: 2,
          guide_version: 1,
          rule_version: 3,
          document_versions: [{ document_id: 'doc-1', version: 1 }],
        },
        summaryJson: {
          title: 'Siap diajukan',
          description: 'Tidak ada temuan',
          open_findings_count: 0,
          must_fix_count: 0,
          needs_confirmation_count: 0,
          informational_count: 0,
          documents_processed: 1,
          documents_failed: 0,
          documents_skipped: 0,
        },
        failureCode: null,
        queuedAt: new Date('2026-11-10T10:00:00Z'),
        startedAt: new Date('2026-11-10T10:00:01Z'),
        completedAt: new Date('2026-11-10T10:00:05Z'),
        ruleVersion: {
          id: 'rule-v1',
          versionNumber: 3,
        },
      };

      const view = mapper.mapRunToView(run, 2);

      expect(view.id).toBe('run-1');
      expect(view.status).toBe('completed');
      expect(view.result).toBe('ready_initial_check');
      expect(view.is_current_for_active_input).toBe(true);
      expect(view.limitations).toEqual(INSPECTION_LIMITATIONS);
      expect(view.input_snapshot.document_versions).toHaveLength(1);
    });
  });
});
