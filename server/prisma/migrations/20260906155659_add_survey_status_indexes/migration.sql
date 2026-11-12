-- CreateIndex
CREATE INDEX "Survey_userId_status_idx" ON "Survey"("userId", "status");

-- CreateIndex
CREATE INDEX "Survey_status_updatedAt_idx" ON "Survey"("status", "updatedAt");
