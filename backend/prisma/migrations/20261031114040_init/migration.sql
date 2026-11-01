-- CreateEnum
CREATE TYPE "ServicePublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GuideVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "RuleVersionStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING_VERIFICATION', 'ACTIVE', 'SUSPENDED', 'DELETION_REQUESTED', 'DELETED');

-- CreateEnum
CREATE TYPE "PreparationStatus" AS ENUM ('DRAFT', 'QUEUED', 'INSPECTING', 'NEEDS_COMPLETION', 'NEEDS_CONFIRMATION', 'READY_INITIAL_CHECK', 'INSPECTION_INCOMPLETE', 'RECHECK_REQUIRED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('INFO', 'WARNING', 'BLOCKING');

-- CreateEnum
CREATE TYPE "FindingResolutionStatus" AS ENUM ('OPEN', 'CORRECTED', 'CONFIRMED_BY_USER', 'NEEDS_OFFICIAL_CONFIRMATION', 'DISMISSED');

-- CreateEnum
CREATE TYPE "SubmissionChannel" AS ENUM ('ONLINE_PORTAL', 'IN_PERSON', 'EMAIL', 'OTHER');

-- CreateEnum
CREATE TYPE "StatusSourceType" AS ENUM ('CITIZEN_REPORT', 'OFFICER', 'INTEGRATION', 'SIMULATION');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('CITIZEN_RECORDED_UNCONFIRMED', 'ACCEPTED', 'VERIFICATION', 'NEEDS_CORRECTION', 'PROCESSING', 'COMPLETED', 'RESULT_RECEIVED_BY_CITIZEN');

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "regionType" TEXT NOT NULL,
    "parentRegionId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agencies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "agencyType" TEXT NOT NULL,
    "regionId" UUID NOT NULL,
    "address" TEXT,
    "officialWebsite" TEXT,
    "contactInfo" TEXT,
    "cooperationStatus" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "category" TEXT NOT NULL,
    "summary" TEXT,
    "agencyId" UUID NOT NULL,
    "regionId" UUID NOT NULL,
    "publicationStatus" "ServicePublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_versions" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "GuideVersionStatus" NOT NULL,
    "procedureJson" JSONB NOT NULL,
    "officialCostJson" JSONB,
    "officialDurationJson" JSONB,
    "applicationChannelsJson" JSONB,
    "sourceReviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,

    CONSTRAINT "guide_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_sections" (
    "id" UUID NOT NULL,
    "guideVersionId" UUID NOT NULL,
    "sectionType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentJson" JSONB NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "guide_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "official_sources" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourcePublishedDate" TIMESTAMP(3),
    "accessedAt" TIMESTAMP(3) NOT NULL,
    "lastCheckedAt" TIMESTAMP(3),
    "reviewStatus" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "official_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guide_source_links" (
    "id" UUID NOT NULL,
    "guideSectionId" UUID NOT NULL,
    "sourceId" UUID NOT NULL,
    "claimOrField" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "guide_source_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirement_rule_versions" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "status" "RuleVersionStatus" NOT NULL,
    "rulesConfigJson" JSONB NOT NULL,
    "effectiveAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" UUID,

    CONSTRAINT "requirement_rule_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "requirements" (
    "id" UUID NOT NULL,
    "ruleVersionId" UUID NOT NULL,
    "requirementCode" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirementType" TEXT NOT NULL,
    "isMandatory" BOOLEAN NOT NULL,
    "conditionJson" JSONB NOT NULL,
    "sourceId" UUID NOT NULL,
    "displayOrder" INTEGER NOT NULL,

    CONSTRAINT "requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_questions" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "questionKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "isPublicNonpersonal" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "optionsJson" JSONB,
    "validationJson" JSONB,
    "dependsOnQuestionId" UUID,
    "dependencyRuleJson" JSONB,
    "displayOrder" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "service_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "displayName" VARCHAR(200) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "phone" TEXT,
    "authProvider" TEXT NOT NULL,
    "passwordHash" TEXT,
    "accountStatus" "AccountStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "roleCode" VARCHAR(80) NOT NULL,
    "roleName" VARCHAR(160) NOT NULL,
    "description" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "agencyId" UUID,
    "regionId" UUID,
    "assignedById" UUID,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "purposeCode" TEXT NOT NULL,
    "noticeVersion" TEXT NOT NULL,
    "isAccepted" BOOLEAN NOT NULL,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "withdrawnAt" TIMESTAMP(3),
    "metadataJson" JSONB,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparations" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "guideVersionId" UUID NOT NULL,
    "internalReference" VARCHAR(120) NOT NULL,
    "status" "PreparationStatus" NOT NULL DEFAULT 'DRAFT',
    "currentDataVersion" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "preparations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "answer_versions" (
    "id" UUID NOT NULL,
    "preparationId" UUID NOT NULL,
    "questionId" UUID NOT NULL,
    "dataVersion" INTEGER NOT NULL,
    "answerJson" JSONB NOT NULL,
    "valueOrigin" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" UUID,

    CONSTRAINT "answer_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_versions" (
    "id" UUID NOT NULL,
    "preparationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "documentType" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "detectedMimeType" TEXT NOT NULL,
    "fileSizeBytes" BIGINT NOT NULL,
    "checksumSha256" TEXT NOT NULL,
    "processingStatus" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_runs" (
    "id" UUID NOT NULL,
    "preparationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "guideVersionId" UUID NOT NULL,
    "ruleVersionId" UUID NOT NULL,
    "dataVersion" INTEGER NOT NULL,
    "status" "InspectionStatus" NOT NULL,
    "engineVersion" TEXT NOT NULL,
    "modelVersion" TEXT,
    "inputSnapshotJson" JSONB NOT NULL,
    "summaryJson" JSONB,
    "failureCode" TEXT,
    "queuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "inspection_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "findings" (
    "id" UUID NOT NULL,
    "inspectionRunId" UUID NOT NULL,
    "requirementId" UUID NOT NULL,
    "documentVersionId" UUID,
    "findingCode" TEXT NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "evidenceJson" JSONB NOT NULL,
    "suggestedActionsJson" JSONB NOT NULL,
    "readingConfidence" DOUBLE PRECISION,
    "resolutionStatus" "FindingResolutionStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_corrections" (
    "id" UUID NOT NULL,
    "findingId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "originalValueJson" JSONB NOT NULL,
    "correctedValueJson" JSONB NOT NULL,
    "correctionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_records" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "preparationId" UUID,
    "agencyId" UUID NOT NULL,
    "internalReference" VARCHAR(120) NOT NULL,
    "officialReference" TEXT,
    "submittedDate" TIMESTAMP(3),
    "submissionChannel" "SubmissionChannel" NOT NULL,
    "sourceMode" "StatusSourceType" NOT NULL,
    "statusSummary" "ApplicationStatus" NOT NULL,
    "citizenNotes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "application_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status_events" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "actorUserId" UUID,
    "statusCode" "ApplicationStatus" NOT NULL,
    "sourceType" "StatusSourceType" NOT NULL,
    "sourceLabel" TEXT NOT NULL,
    "description" TEXT,
    "revisionReason" TEXT,
    "nextAction" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadataJson" JSONB,

    CONSTRAINT "status_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "officer_assignments" (
    "id" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "officerUserId" UUID NOT NULL,
    "assignmentStatus" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "officer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID,
    "notificationType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "targetPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "applicationId" UUID,
    "reminderType" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL,
    "scheduleConfigJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_events" (
    "id" UUID NOT NULL,
    "actorUserId" UUID,
    "actorRole" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "objectType" TEXT NOT NULL,
    "objectId" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "metadataJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "regions_regionType_idx" ON "regions"("regionType");

-- CreateIndex
CREATE INDEX "regions_isActive_idx" ON "regions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE INDEX "agencies_regionId_idx" ON "agencies"("regionId");

-- CreateIndex
CREATE INDEX "agencies_isActive_idx" ON "agencies"("isActive");

-- CreateIndex
CREATE INDEX "services_publicationStatus_regionId_category_idx" ON "services"("publicationStatus", "regionId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "guide_versions_serviceId_status_idx" ON "guide_versions"("serviceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "guide_versions_serviceId_versionNumber_key" ON "guide_versions"("serviceId", "versionNumber");

-- CreateIndex
CREATE INDEX "guide_sections_guideVersionId_idx" ON "guide_sections"("guideVersionId");

-- CreateIndex
CREATE INDEX "official_sources_reviewStatus_lastCheckedAt_idx" ON "official_sources"("reviewStatus", "lastCheckedAt");

-- CreateIndex
CREATE INDEX "guide_source_links_sourceId_idx" ON "guide_source_links"("sourceId");

-- CreateIndex
CREATE INDEX "requirement_rule_versions_serviceId_status_idx" ON "requirement_rule_versions"("serviceId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "requirement_rule_versions_serviceId_versionNumber_key" ON "requirement_rule_versions"("serviceId", "versionNumber");

-- CreateIndex
CREATE INDEX "requirements_ruleVersionId_idx" ON "requirements"("ruleVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "requirements_ruleVersionId_requirementCode_key" ON "requirements"("ruleVersionId", "requirementCode");

-- CreateIndex
CREATE INDEX "service_questions_serviceId_isActive_idx" ON "service_questions"("serviceId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "service_questions_serviceId_questionKey_key" ON "service_questions"("serviceId", "questionKey");

-- CreateIndex
CREATE INDEX "users_accountStatus_updatedAt_idx" ON "users"("accountStatus", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_roleCode_key" ON "roles"("roleCode");

-- CreateIndex
CREATE INDEX "user_roles_userId_roleId_idx" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE INDEX "consent_records_userId_purposeCode_idx" ON "consent_records"("userId", "purposeCode");

-- CreateIndex
CREATE INDEX "preparations_userId_status_updatedAt_idx" ON "preparations"("userId", "status", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "preparations_internalReference_key" ON "preparations"("internalReference");

-- CreateIndex
CREATE INDEX "answer_versions_preparationId_idx" ON "answer_versions"("preparationId");

-- CreateIndex
CREATE INDEX "document_versions_preparationId_documentType_idx" ON "document_versions"("preparationId", "documentType");

-- CreateIndex
CREATE UNIQUE INDEX "document_versions_preparationId_documentType_versionNumber_key" ON "document_versions"("preparationId", "documentType", "versionNumber");

-- CreateIndex
CREATE INDEX "inspection_runs_preparationId_status_idx" ON "inspection_runs"("preparationId", "status");

-- CreateIndex
CREATE INDEX "findings_inspectionRunId_resolutionStatus_idx" ON "findings"("inspectionRunId", "resolutionStatus");

-- CreateIndex
CREATE INDEX "user_corrections_findingId_idx" ON "user_corrections"("findingId");

-- CreateIndex
CREATE INDEX "application_records_userId_updatedAt_idx" ON "application_records"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "application_records_preparationId_agencyId_idx" ON "application_records"("preparationId", "agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "application_records_internalReference_key" ON "application_records"("internalReference");

-- CreateIndex
CREATE INDEX "status_events_applicationId_occurredAt_idx" ON "status_events"("applicationId", "occurredAt");

-- CreateIndex
CREATE INDEX "officer_assignments_officerUserId_assignmentStatus_idx" ON "officer_assignments"("officerUserId", "assignmentStatus");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_createdAt_idx" ON "notifications"("userId", "readAt", "createdAt");

-- CreateIndex
CREATE INDEX "reminder_preferences_userId_applicationId_idx" ON "reminder_preferences"("userId", "applicationId");

-- CreateIndex
CREATE INDEX "audit_events_actorUserId_createdAt_idx" ON "audit_events"("actorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "regions" ADD CONSTRAINT "regions_parentRegionId_fkey" FOREIGN KEY ("parentRegionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_versions" ADD CONSTRAINT "guide_versions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_versions" ADD CONSTRAINT "guide_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_sections" ADD CONSTRAINT "guide_sections_guideVersionId_fkey" FOREIGN KEY ("guideVersionId") REFERENCES "guide_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_source_links" ADD CONSTRAINT "guide_source_links_guideSectionId_fkey" FOREIGN KEY ("guideSectionId") REFERENCES "guide_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_source_links" ADD CONSTRAINT "guide_source_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_rule_versions" ADD CONSTRAINT "requirement_rule_versions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirement_rule_versions" ADD CONSTRAINT "requirement_rule_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_ruleVersionId_fkey" FOREIGN KEY ("ruleVersionId") REFERENCES "requirement_rule_versions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requirements" ADD CONSTRAINT "requirements_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "official_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_questions" ADD CONSTRAINT "service_questions_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_questions" ADD CONSTRAINT "service_questions_dependsOnQuestionId_fkey" FOREIGN KEY ("dependsOnQuestionId") REFERENCES "service_questions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparations" ADD CONSTRAINT "preparations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparations" ADD CONSTRAINT "preparations_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparations" ADD CONSTRAINT "preparations_guideVersionId_fkey" FOREIGN KEY ("guideVersionId") REFERENCES "guide_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_versions" ADD CONSTRAINT "answer_versions_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_versions" ADD CONSTRAINT "answer_versions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "service_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "answer_versions" ADD CONSTRAINT "answer_versions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_versions" ADD CONSTRAINT "document_versions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_runs" ADD CONSTRAINT "inspection_runs_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_runs" ADD CONSTRAINT "inspection_runs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_runs" ADD CONSTRAINT "inspection_runs_guideVersionId_fkey" FOREIGN KEY ("guideVersionId") REFERENCES "guide_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_runs" ADD CONSTRAINT "inspection_runs_ruleVersionId_fkey" FOREIGN KEY ("ruleVersionId") REFERENCES "requirement_rule_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_inspectionRunId_fkey" FOREIGN KEY ("inspectionRunId") REFERENCES "inspection_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "requirements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_documentVersionId_fkey" FOREIGN KEY ("documentVersionId") REFERENCES "document_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_corrections" ADD CONSTRAINT "user_corrections_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_corrections" ADD CONSTRAINT "user_corrections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_preparationId_fkey" FOREIGN KEY ("preparationId") REFERENCES "preparations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_records" ADD CONSTRAINT "application_records_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "agencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "status_events" ADD CONSTRAINT "status_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "officer_assignments" ADD CONSTRAINT "officer_assignments_officerUserId_fkey" FOREIGN KEY ("officerUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_preferences" ADD CONSTRAINT "reminder_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_preferences" ADD CONSTRAINT "reminder_preferences_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
