-- Drop unique constraint on Candidate.email to allow re-applications
-- SQLite requires redefining the table to remove a constraint/index

PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Candidate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "resumePath" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPLIED',
    "scoreQ1" REAL,
    "scoreQ2" REAL,
    "scoreTotal" REAL,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "jobListingId" TEXT,
    CONSTRAINT "Candidate_jobListingId_fkey" FOREIGN KEY ("jobListingId") REFERENCES "JobListing" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

INSERT INTO "new_Candidate" SELECT * FROM "Candidate";
DROP TABLE "Candidate";
ALTER TABLE "new_Candidate" RENAME TO "Candidate";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
