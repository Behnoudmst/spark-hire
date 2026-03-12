-- Add GDPR consent tracking fields to Candidate
-- Using ALTER TABLE ADD COLUMN (safe for SQLite with defaults/nullable)

ALTER TABLE "Candidate" ADD COLUMN "consentGiven" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Candidate" ADD COLUMN "consentAt" DATETIME;
ALTER TABLE "Candidate" ADD COLUMN "privacyPolicyVersion" TEXT;
