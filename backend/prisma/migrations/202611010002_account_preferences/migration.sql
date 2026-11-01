-- CreateTable
CREATE TABLE "account_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fontSize" TEXT NOT NULL DEFAULT 'normal',
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "notifyInApp" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_preferences_userId_key" ON "account_preferences"("userId");

-- AddForeignKey
ALTER TABLE "account_preferences" ADD CONSTRAINT "account_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

