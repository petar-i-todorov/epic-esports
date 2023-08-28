/*
  Warnings:

  - You are about to drop the column `owner` on the `PasswordHash` table. All the data in the column will be lost.
  - Added the required column `userId` to the `PasswordHash` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "PostImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "blob" BLOB NOT NULL,
    "altText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "postId" TEXT NOT NULL,
    CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PasswordHash" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PasswordHash_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PasswordHash" ("createdAt", "hash", "id", "updatedAt") SELECT "createdAt", "hash", "id", "updatedAt" FROM "PasswordHash";
DROP TABLE "PasswordHash";
ALTER TABLE "new_PasswordHash" RENAME TO "PasswordHash";
CREATE UNIQUE INDEX "PasswordHash_userId_key" ON "PasswordHash"("userId");
CREATE INDEX "PasswordHash_userId_idx" ON "PasswordHash"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "PostImage_postId_idx" ON "PostImage"("postId");

-- CreateIndex
CREATE INDEX "Post_categoryId_idx" ON "Post"("categoryId");
