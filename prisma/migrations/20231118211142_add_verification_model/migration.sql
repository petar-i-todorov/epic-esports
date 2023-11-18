-- CreateTable
CREATE TABLE "Verification" (
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

-- CreateIndex
CREATE UNIQUE INDEX "Verification_type_target_key" ON "Verification"("type", "target");
