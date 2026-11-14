-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "ratingLabels" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
