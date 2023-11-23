/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `Verification` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "period" INTEGER NOT NULL,
    "algorithm" TEXT NOT NULL,
    "charSet" TEXT NOT NULL
);
INSERT INTO "new_Verification" ("algorithm", "charSet", "createdAt", "digits", "id", "period", "secret", "target", "type", "updatedAt") SELECT "algorithm", "charSet", "createdAt", "digits", "id", "period", "secret", "target", "type", "updatedAt" FROM "Verification";
DROP TABLE "Verification";
ALTER TABLE "new_Verification" RENAME TO "Verification";
CREATE UNIQUE INDEX "Verification_type_target_key" ON "Verification"("type", "target");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
