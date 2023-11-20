/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId,typeId]` on the table `PostReaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostReaction_userId_postId_typeId_key" ON "PostReaction"("userId", "postId", "typeId");
