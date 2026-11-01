-- CreateEnum
CREATE TYPE "CompanionReviewStatus" AS ENUM ('DRAFT_PREPARATION', 'SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED', 'REVIEW_COMPLETED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "SubmissionReviewStatus" AS ENUM ('DRAFT', 'NEEDS_REVISION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssessmentVerdict" AS ENUM ('SESUAI', 'PERLU_PERBAIKAN', 'BELUM_DAPAT_DIPERIKSA');

-- CreateEnum
CREATE TYPE "AssessmentItemType" AS ENUM ('FORM_DATA', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "ServiceAvailability" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "FamilyRelationship" AS ENUM ('SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'WARD', 'OTHER');

-- CreateEnum
CREATE TYPE "AccountTokenType" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- CreateEnum
CREATE TYPE "HelpTicketStatus" AS ENUM ('OPEN', 'RESOLVED', 'CLOSED');

-- AlterTable
ALTER TABLE "application_records" ADD COLUMN IF NOT EXISTS "reviewStatus" "CompanionReviewStatus" NOT NULL DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "preparations" ADD COLUMN IF NOT EXISTS "familyMemberId" UUID;

-- AlterTable
ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "availability" "ServiceAvailability" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "pausedReason" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "submission_snapshots" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "preparationId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "conditionKey" TEXT,
    "serviceSnapshotJson" JSONB NOT NULL,
    "applicantSnapshotJson" JSONB NOT NULL,
    "answersSnapshotJson" JSONB NOT NULL,
    "documentsSnapshotJson" JSONB NOT NULL,
    "requiredSlotsJson" JSONB NOT NULL,
    "citizenNote" TEXT,
    "changesSummary" TEXT,
    "consentVersion" TEXT NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "submission_reviews" (
    "id" UUID NOT NULL,
    "submissionSnapshotId" UUID NOT NULL,
    "officerUserId" UUID NOT NULL,
    "reviewStatus" "SubmissionReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "overallNotes" TEXT,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "submission_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "item_assessments" (
    "id" UUID NOT NULL,
    "submissionReviewId" UUID NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemType" "AssessmentItemType" NOT NULL,
    "verdict" "AssessmentVerdict" NOT NULL,
    "note" TEXT NOT NULL,
    "targetAction" TEXT,
    "documentVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "family_members" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "relationship" "FamilyRelationship" NOT NULL,
    "nik" VARCHAR(16),
    "birthDate" TIMESTAMP(3),
    "gender" TEXT,
    "isUnderAge" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "help_requests" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID,
    "preparationId" UUID,
    "topic" VARCHAR(200) NOT NULL,
    "category" VARCHAR(80) NOT NULL,
    "status" "HelpTicketStatus" NOT NULL DEFAULT 'OPEN',
    "assignedAdminId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "help_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "help_replies" (
    "id" UUID NOT NULL,
    "helpRequestId" UUID NOT NULL,
    "senderUserId" UUID NOT NULL,
    "senderRole" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "help_replies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "officer_escalations" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "officerUserId" UUID NOT NULL,
    "resolvedByAdminId" UUID,
    "reason" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "officer_escalations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "idempotency_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "operationKey" VARCHAR(100) NOT NULL,
    "idempotencyKey" VARCHAR(128) NOT NULL,
    "requestHash" VARCHAR(64) NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBodyJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "account_tokens" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "tokenHash" VARCHAR(64) NOT NULL,
    "type" "AccountTokenType" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "submission_snapshots_preparationId_idx" ON "submission_snapshots"("preparationId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "submission_snapshots_applicationId_versionNumber_key" ON "submission_snapshots"("applicationId", "versionNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "submission_reviews_submissionSnapshotId_officerUserId_idx" ON "submission_reviews"("submissionSnapshotId", "officerUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "item_assessments_submissionReviewId_idx" ON "item_assessments"("submissionReviewId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "family_members_userId_deletedAt_idx" ON "family_members"("userId", "deletedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "help_requests_userId_status_idx" ON "help_requests"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "help_replies_helpRequestId_idx" ON "help_replies"("helpRequestId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "officer_escalations_applicationId_status_idx" ON "officer_escalations"("applicationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "idempotency_records_userId_operationKey_idempotencyKey_key" ON "idempotency_records"("userId", "operationKey", "idempotencyKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "account_tokens_tokenHash_key" ON "account_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "account_tokens_userId_type_idx" ON "account_tokens"("userId", "type");

-- AddForeignKey
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'preparations_familyMemberId_fkey') THEN
    ALTER TABLE "preparations" ADD CONSTRAINT "preparations_familyMemberId_fkey" FOREIGN KEY ("familyMemberId") REFERENCES "family_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submission_snapshots_applicationId_fkey') THEN
    ALTER TABLE "submission_snapshots" ADD CONSTRAINT "submission_snapshots_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submission_snapshots_preparationId_fkey') THEN
    ALTER TABLE "submission_snapshots" ADD CONSTRAINT "submission_snapshots_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submission_reviews_submissionSnapshotId_fkey') THEN
    ALTER TABLE "submission_reviews" ADD CONSTRAINT "submission_reviews_submissionSnapshotId_fkey" FOREIGN KEY ("submissionSnapshotId") REFERENCES "submission_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submission_reviews_officerUserId_fkey') THEN
    ALTER TABLE "submission_reviews" ADD CONSTRAINT "submission_reviews_officerUserId_fkey" FOREIGN KEY ("officerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'item_assessments_submissionReviewId_fkey') THEN
    ALTER TABLE "item_assessments" ADD CONSTRAINT "item_assessments_submissionReviewId_fkey" FOREIGN KEY ("submissionReviewId") REFERENCES "submission_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'family_members_userId_fkey') THEN
    ALTER TABLE "family_members" ADD CONSTRAINT "family_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'help_requests_userId_fkey') THEN
    ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'help_requests_applicationId_fkey') THEN
    ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'help_requests_preparationId_fkey') THEN
    ALTER TABLE "help_requests" ADD CONSTRAINT "help_requests_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'help_replies_helpRequestId_fkey') THEN
    ALTER TABLE "help_replies" ADD CONSTRAINT "help_replies_helpRequestId_fkey" FOREIGN KEY ("helpRequestId") REFERENCES "help_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'help_replies_senderUserId_fkey') THEN
    ALTER TABLE "help_replies" ADD CONSTRAINT "help_replies_senderUserId_fkey" FOREIGN KEY ("senderUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'officer_escalations_applicationId_fkey') THEN
    ALTER TABLE "officer_escalations" ADD CONSTRAINT "officer_escalations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'officer_escalations_officerUserId_fkey') THEN
    ALTER TABLE "officer_escalations" ADD CONSTRAINT "officer_escalations_officerUserId_fkey" FOREIGN KEY ("officerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'idempotency_records_userId_fkey') THEN
    ALTER TABLE "idempotency_records" ADD CONSTRAINT "idempotency_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_tokens_userId_fkey') THEN
    ALTER TABLE "account_tokens" ADD CONSTRAINT "account_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
