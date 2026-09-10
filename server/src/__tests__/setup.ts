import { afterAll, beforeEach } from "vitest";
import { prisma } from "../config/prisma.js";

const TABLES = [
  "Answer",
  "Response",
  "SurveyView",
  "QuestionOption",
  "Question",
  "Survey",
  "RefreshSession",
  "AdminAuditLog",
  "User",
] as const;

async function truncateAll(): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "${TABLES.join('", "')}" RESTART IDENTITY CASCADE`,
  );
}

beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await prisma.$disconnect();
});
