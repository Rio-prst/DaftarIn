import type { OfficialSource } from '../generated/prisma/client';
import type {
  RegionRecord,
  ServiceGuideRecord,
  ServiceListRecord,
  ServiceQuestionsRecord,
  ServiceSourcesRecord,
} from './interfaces/catalog.repository.interface';
import type {
  ChannelView,
  GuideView,
  OfficialDurationView,
  OfficialFeeView,
  ProcedureStepView,
  QuestionOptionView,
  QuestionView,
  QuestionsView,
  RegionView,
  RequirementView,
  ServiceDetailView,
  ServiceSummaryView,
  SourceHealth,
  SourceSummaryView,
  SourceSupportView,
  SourceView,
  SourcesView,
} from './interfaces/catalog.service.interface';

type SourceRecord = OfficialSource;

type SourceEntry = {
  source: SourceRecord;
  supports: SourceSupportView[];
};

type SourceCollectable = {
  guideVersions: Array<{
    guideSections: Array<{
      id: string;
      title: string;
      guideSourceLinks: Array<{
        claimOrField: string;
        source: SourceRecord;
      }>;
    }>;
  }>;
  requirementRuleVersions: Array<{
    requirements: Array<{
      requirementCode: string;
      title: string;
      source: SourceRecord;
    }>;
  }>;
};

const UNKNOWN_FEE_DISPLAY_TEXT = 'Belum tersedia pada sumber yang dicatat';
const UNKNOWN_DURATION_DISPLAY_TEXT = 'Belum tersedia pada sumber yang dicatat';

export function mapRegion(record: RegionRecord): RegionView {
  return {
    id: record.id,
    name: record.name,
    type: record.regionType,
    parent_id: record.parentRegionId,
  };
}

export function mapServiceSummary(
  record: ServiceListRecord,
): ServiceSummaryView {
  const guide = record.guideVersions[0] ?? null;
  const entries = collectGuideSourceEntries(record.guideVersions);
  const sources = [...entries.values()].map((entry) => entry.source);

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    summary: record.summary,
    agency: {
      id: record.agency.id,
      name: record.agency.name,
    },
    region: {
      id: record.region.id,
      name: record.region.name,
    },
    category: {
      id: record.category,
      name: record.category,
    },
    publication_status: record.publicationStatus.toLowerCase(),
    current_guide_version: guide?.versionNumber ?? null,
    source_health: sourceHealthFromStatuses(
      sources.map((source) => source.reviewStatus),
    ),
    reviewed_at: toIso(guide?.sourceReviewedAt ?? latestSourceDate(sources)),
  };
}

export function mapServiceDetail(record: ServiceListRecord): ServiceDetailView {
  const summary = mapServiceSummary(record);
  const guide = record.guideVersions[0] ?? null;
  const channels = normalizeChannels(guide?.applicationChannelsJson);

  return {
    ...summary,
    agency: {
      ...summary.agency,
      region_id: record.agency.regionId,
      description: null,
      channels,
    },
    region: {
      ...summary.region,
      type: record.region.regionType,
      parent_id: record.region.parentRegionId,
    },
    channels,
    published_at: toIso(record.publishedAt),
  };
}

export function mapGuide(record: ServiceGuideRecord): GuideView {
  const guide = record.guideVersions[0];

  if (!guide) {
    throw new Error('Guide version wajib tersedia.');
  }

  const ruleVersion = record.requirementRuleVersions[0] ?? null;
  const entries = collectSourceEntries(record);
  const sources = [...entries.values()];
  const sourceViews = sources.map(mapSourceView);
  const requirements: RequirementView[] =
    ruleVersion?.requirements.map((requirement) => ({
      id: requirement.id,
      name: requirement.title,
      description: requirement.description,
      required: requirement.isMandatory,
      condition: requirement.conditionJson,
      sources: [mapSourceSummary(requirement.source)],
    })) ?? [];

  return {
    service_id: record.id,
    version: guide.versionNumber,
    published_at: toIso(guide.publishedAt),
    reviewed_at: toIso(
      guide.sourceReviewedAt ??
        latestSourceDate(sources.map((entry) => entry.source)),
    ),
    summary: record.summary,
    requirements,
    procedure_steps: normalizeProcedureSteps(guide.procedureJson),
    official_fee: normalizeOfficialFee(guide.officialCostJson),
    official_processing_time: normalizeOfficialDuration(
      guide.officialDurationJson,
    ),
    channels: normalizeChannels(guide.applicationChannelsJson),
    sources: sourceViews,
    source_health: sourceHealthFromStatuses(
      sourceViews.map((source) => source.source_status),
    ),
    change_notice: null,
  };
}

export function mapQuestions(record: ServiceQuestionsRecord): QuestionsView {
  const ruleVersion = record.requirementRuleVersions[0] ?? null;

  return {
    service_id: record.id,
    questionnaire_version: ruleVersion?.versionNumber ?? 1,
    questions: record.serviceQuestions.map((question) => mapQuestion(question)),
  };
}

export function mapSources(record: ServiceSourcesRecord): SourcesView {
  const entries = collectSourceEntries(record);

  return {
    service_id: record.id,
    sources: [...entries.values()].map(mapSourceView),
  };
}

function mapQuestion(
  question: ServiceQuestionsRecord['serviceQuestions'][number],
): QuestionView {
  return {
    id: question.id,
    key: question.questionKey,
    label: question.label,
    help_text: readString(question.validationJson, 'help_text'),
    type: question.inputType,
    required: question.isRequired,
    options: normalizeOptions(question.optionsJson),
    visible_if:
      question.dependencyRuleJson ??
      (question.dependsOnQuestionId
        ? { question_id: question.dependsOnQuestionId }
        : null),
    requirements_effect: readStringArray(
      question.validationJson,
      'requirements_effect',
    ),
    validation: question.validationJson,
  };
}

function mapSourceView(entry: SourceEntry): SourceView {
  return {
    id: entry.source.id,
    title: entry.source.title,
    publisher: entry.source.publisher,
    url: entry.source.url,
    published_at: toIso(entry.source.sourcePublishedDate),
    accessed_at: entry.source.accessedAt.toISOString(),
    source_status: normalizeSourceStatus(entry.source.reviewStatus),
    supports: entry.supports,
  };
}

function mapSourceSummary(source: SourceRecord): SourceSummaryView {
  return {
    id: source.id,
    title: source.title,
    url: source.url,
  };
}

function collectSourceEntries(
  record: SourceCollectable,
): Map<string, SourceEntry> {
  const entries = collectGuideSourceEntries(record.guideVersions);

  for (const ruleVersion of record.requirementRuleVersions) {
    for (const requirement of ruleVersion.requirements) {
      addSourceEntry(entries, requirement.source, {
        guide_section_id: null,
        title: requirement.title,
        claim_or_field: requirement.requirementCode,
      });
    }
  }

  return entries;
}

function collectGuideSourceEntries(
  guideVersions: SourceCollectable['guideVersions'],
): Map<string, SourceEntry> {
  const entries = new Map<string, SourceEntry>();

  for (const guideVersion of guideVersions) {
    for (const section of guideVersion.guideSections) {
      for (const link of section.guideSourceLinks) {
        addSourceEntry(entries, link.source, {
          guide_section_id: section.id,
          title: section.title,
          claim_or_field: link.claimOrField,
        });
      }
    }
  }

  return entries;
}

function addSourceEntry(
  entries: Map<string, SourceEntry>,
  source: SourceRecord,
  support: SourceSupportView,
): void {
  const existing = entries.get(source.id);

  if (existing) {
    existing.supports.push(support);
    return;
  }

  entries.set(source.id, {
    source,
    supports: [support],
  });
}

function sourceHealthFromStatuses(statuses: string[]): SourceHealth {
  if (statuses.length === 0) {
    return 'unknown';
  }

  const normalized = statuses.map((status) => status.toLowerCase());

  if (normalized.includes('conflicting')) {
    return 'conflicting';
  }

  if (normalized.includes('unavailable')) {
    return 'unavailable';
  }

  if (normalized.includes('needs_review')) {
    return 'needs_review';
  }

  if (normalized.every((status) => status === 'available')) {
    return 'available';
  }

  return 'unknown';
}

function normalizeSourceStatus(status: string): SourceHealth {
  const normalized = status.toLowerCase();

  if (normalized === 'available') {
    return 'available';
  }

  if (normalized === 'unavailable') {
    return 'unavailable';
  }

  if (normalized === 'conflicting') {
    return 'conflicting';
  }

  if (normalized === 'needs_review') {
    return 'needs_review';
  }

  return 'unknown';
}

function latestSourceDate(sources: SourceRecord[]): Date | null {
  return sources.reduce<Date | null>((latest, source) => {
    const candidate = source.lastCheckedAt ?? source.accessedAt;

    if (!latest || candidate.getTime() > latest.getTime()) {
      return candidate;
    }

    return latest;
  }, null);
}

function normalizeProcedureSteps(value: unknown): ProcedureStepView[] {
  if (Array.isArray(value)) {
    return value
      .map((item, index) => {
        if (!isRecord(item)) {
          return null;
        }

        const title = readUnknownString(item.title);
        const description = readUnknownString(item.description);

        if (!title && !description) {
          return null;
        }

        return {
          step:
            typeof item.step === 'number' && Number.isFinite(item.step)
              ? item.step
              : index + 1,
          title: title ?? `Langkah ${index + 1}`,
          description: description ?? '',
        };
      })
      .filter((item): item is ProcedureStepView => item !== null);
  }

  if (isRecord(value) && Array.isArray(value.steps)) {
    return normalizeProcedureSteps(value.steps);
  }

  return [];
}

function normalizeChannels(value: unknown): ChannelView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const type = readUnknownString(item.type);
      const label = readUnknownString(item.label);

      if (!type && !label) {
        return null;
      }

      return {
        id: readUnknownString(item.id),
        type: type ?? 'other',
        label: label ?? type ?? 'Kanal layanan',
        url: readUnknownString(item.url),
        instructions: readUnknownString(item.instructions),
      };
    })
    .filter((item): item is ChannelView => item !== null);
}

function normalizeOptions(value: unknown): QuestionOptionView[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          value: item,
          label: item,
        };
      }

      if (!isRecord(item)) {
        return null;
      }

      const optionValue = readUnknownString(item.value);
      const label = readUnknownString(item.label);

      if (!optionValue) {
        return null;
      }

      return {
        value: optionValue,
        label: label ?? optionValue,
      };
    })
    .filter((item): item is QuestionOptionView => item !== null);
}

function normalizeOfficialFee(value: unknown): OfficialFeeView {
  if (!isRecord(value)) {
    return {
      status: 'unknown',
      amount: null,
      currency: null,
      display_text: UNKNOWN_FEE_DISPLAY_TEXT,
      sources: [],
    };
  }

  return {
    status: readUnknownString(value.status) ?? 'unknown',
    amount: readUnknownNumber(value.amount),
    currency: readUnknownString(value.currency),
    display_text:
      readUnknownString(value.display_text) ?? UNKNOWN_FEE_DISPLAY_TEXT,
    sources: normalizeSourceSummaries(value.sources),
  };
}

function normalizeOfficialDuration(value: unknown): OfficialDurationView {
  if (!isRecord(value)) {
    return {
      status: 'unknown',
      value: null,
      unit: null,
      basis: null,
      display_text: UNKNOWN_DURATION_DISPLAY_TEXT,
      sources: [],
    };
  }

  return {
    status: readUnknownString(value.status) ?? 'unknown',
    value: readUnknownNumber(value.value),
    unit: readUnknownString(value.unit),
    basis: readUnknownString(value.basis),
    display_text:
      readUnknownString(value.display_text) ?? UNKNOWN_DURATION_DISPLAY_TEXT,
    sources: normalizeSourceSummaries(value.sources),
  };
}

function normalizeSourceSummaries(value: unknown): SourceSummaryView[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const id = readUnknownString(item.id);
      const title = readUnknownString(item.title);
      const url = readUnknownString(item.url);

      if (!id || !title || !url) {
        return null;
      }

      return {
        id,
        title,
        url,
      };
    })
    .filter((item): item is SourceSummaryView => item !== null);
}

function readString(value: unknown, key: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  return readUnknownString(value[key]);
}

function readStringArray(value: unknown, key: string): string[] {
  if (!isRecord(value)) {
    return [];
  }

  const items = value[key];

  if (!Array.isArray(items)) {
    return [];
  }

  return items.filter((item): item is string => typeof item === 'string');
}

function readUnknownString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function readUnknownNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toIso(value: Date | null | undefined): string | null {
  return value ? value.toISOString() : null;
}
