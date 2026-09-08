-- DropForeignKey
ALTER TABLE "Answer" DROP CONSTRAINT "Answer_questionId_fkey";

-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "optionTextSnapshot" TEXT,
ADD COLUMN     "questionPositionSnapshot" INTEGER,
ADD COLUMN     "questionTextSnapshot" TEXT,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Response" ADD COLUMN     "responderKey" TEXT;

-- CreateIndex
CREATE INDEX "Response_surveyId_createdAt_idx" ON "Response"("surveyId", "createdAt");

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill historical snapshots for existing answers whose question/option still exist.
UPDATE "Answer" a
SET "questionTextSnapshot" = snap."questionText",
    "optionTextSnapshot" = snap."optionText",
    "questionPositionSnapshot" = snap."position"
FROM (
    SELECT q."id" AS "qid", q."questionText", q."position",
           o."id" AS "oid", o."optionText"
    FROM "Question" q
    LEFT JOIN "QuestionOption" o ON o."questionId" = q."id"
) snap
WHERE a."questionId" = snap."qid"
  AND a."optionId" IS NOT DISTINCT FROM snap."oid";
