-- CreateTable
CREATE TABLE "SurveyView" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "visitorKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SurveyView_surveyId_idx" ON "SurveyView"("surveyId");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyView_surveyId_visitorKey_key" ON "SurveyView"("surveyId", "visitorKey");

-- AddForeignKey
ALTER TABLE "SurveyView" ADD CONSTRAINT "SurveyView_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
