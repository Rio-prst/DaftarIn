import { BadRequestException } from '@nestjs/common';
import {
  ApplicationStatus,
  CompanionReviewStatus,
} from '../../generated/prisma/client';

const validReviewTransitions: Record<
  CompanionReviewStatus,
  CompanionReviewStatus[]
> = {
  [CompanionReviewStatus.DRAFT_PREPARATION]: [CompanionReviewStatus.SUBMITTED],
  [CompanionReviewStatus.SUBMITTED]: [
    CompanionReviewStatus.IN_REVIEW,
    CompanionReviewStatus.WITHDRAWN,
  ],
  [CompanionReviewStatus.IN_REVIEW]: [
    CompanionReviewStatus.REVISION_REQUESTED,
    CompanionReviewStatus.REVIEW_COMPLETED,
    CompanionReviewStatus.WITHDRAWN,
  ],
  [CompanionReviewStatus.REVISION_REQUESTED]: [
    CompanionReviewStatus.SUBMITTED,
    CompanionReviewStatus.WITHDRAWN,
  ],
  [CompanionReviewStatus.REVIEW_COMPLETED]: [],
  [CompanionReviewStatus.WITHDRAWN]: [],
};

const validApplicationTransitions: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  [ApplicationStatus.CITIZEN_RECORDED_UNCONFIRMED]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.VERIFICATION,
    ApplicationStatus.PROCESSING,
    ApplicationStatus.NEEDS_CORRECTION,
    ApplicationStatus.COMPLETED,
    ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
  ],
  [ApplicationStatus.ACCEPTED]: [
    ApplicationStatus.VERIFICATION,
    ApplicationStatus.PROCESSING,
    ApplicationStatus.NEEDS_CORRECTION,
    ApplicationStatus.COMPLETED,
    ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN,
  ],
  [ApplicationStatus.VERIFICATION]: [
    ApplicationStatus.PROCESSING,
    ApplicationStatus.NEEDS_CORRECTION,
    ApplicationStatus.COMPLETED,
  ],
  [ApplicationStatus.NEEDS_CORRECTION]: [
    ApplicationStatus.VERIFICATION,
    ApplicationStatus.PROCESSING,
    ApplicationStatus.COMPLETED,
  ],
  [ApplicationStatus.PROCESSING]: [
    ApplicationStatus.COMPLETED,
    ApplicationStatus.NEEDS_CORRECTION,
  ],
  [ApplicationStatus.COMPLETED]: [ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN],
  [ApplicationStatus.RESULT_RECEIVED_BY_CITIZEN]: [],
};

export function assertValidReviewTransition(
  current: CompanionReviewStatus,
  next: CompanionReviewStatus,
): void {
  if (current === next) return;
  const allowed = validReviewTransitions[current] || [];
  if (!allowed.includes(next)) {
    throw new BadRequestException(
      `Transisi status tinjauan tidak valid dari ${current} ke ${next}.`,
    );
  }
}

export function assertValidApplicationTransition(
  current: ApplicationStatus,
  next: ApplicationStatus,
): void {
  if (current === next) return;
  const allowed = validApplicationTransitions[current] || [];
  if (!allowed.includes(next)) {
    throw new BadRequestException(
      `Transisi status pengajuan tidak valid dari ${current} ke ${next}.`,
    );
  }
}
