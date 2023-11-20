/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId]` on the table `PostReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "PostReaction_userId_postId_typeId_key";

-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_userId_postId_key" ON "PostReaction"("userId", "postId");
