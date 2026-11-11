CREATE TABLE "account_identities" (
    "userId" UUID NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "familyCardNumber" VARCHAR(16) NOT NULL,
    "photoStorageKey" TEXT NOT NULL,
    "privacyNoticeVersion" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_identities_pkey" PRIMARY KEY ("userId"),
    CONSTRAINT "account_identities_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

ALTER TABLE "account_identities" ENABLE ROW LEVEL SECURITY;
