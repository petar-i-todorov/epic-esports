/*
  Warnings:

  - You are about to drop the column `type` on the `PostReactionType` table. All the data in the column will be lost.
  - Added the required column `name` to the `PostReactionType` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostReactionType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_PostReactionType" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "PostReactionType";
DROP TABLE "PostReactionType";
ALTER TABLE "new_PostReactionType" RENAME TO "PostReactionType";
CREATE UNIQUE INDEX "PostReactionType_name_key" ON "PostReactionType"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
