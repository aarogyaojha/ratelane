/*
  Warnings:

  - Added the required column `userId` to the `RateRequest` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable User first
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for User
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_email_idx" ON "User"("email");

-- Create AuditLog table
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "details" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for AuditLog
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Insert default user for existing data
INSERT INTO "User" ("id", "email", "password", "role", "updatedAt") 
VALUES ('00000000-0000-0000-0000-000000000000', 'legacy@cybership.local', 'LEGACY_USER_PLACEHOLDER', 'user', CURRENT_TIMESTAMP);

-- AlterTable RateRequest - add userId with default, then make NOT NULL
ALTER TABLE "RateRequest" ADD COLUMN "userId" TEXT DEFAULT '00000000-0000-0000-0000-000000000000',
ALTER COLUMN "userId" SET NOT NULL,
ALTER COLUMN "sessionId" DROP NOT NULL;

-- AlterTable AuthToken
ALTER TABLE "AuthToken" ADD COLUMN "refreshToken" TEXT;

-- CreateIndex for RateRequest
CREATE INDEX "RateRequest_userId_idx" ON "RateRequest"("userId");

-- AddForeignKey
ALTER TABLE "RateRequest" ADD CONSTRAINT "RateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
