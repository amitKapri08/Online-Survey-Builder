import bcrypt from "bcrypt";
import { randomBytes } from "node:crypto";
import { faker } from "@faker-js/faker";
import { prisma } from "../config/prisma.js";
import { signToken } from "../utils/jwt.js";
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from "../utils/cookies.js";

const SALT_ROUNDS = 4;

export const generateCsrfToken = (): string => randomBytes(32).toString("hex");

type CreateUserOverrides = {
  name?: string;
  email?: string;
  role?: "USER" | "ADMIN";
  deletedAt?: Date | null;
};

export async function createUser(overrides: CreateUserOverrides = {}) {
  const passwordHash = await bcrypt.hash("Password@123", SALT_ROUNDS);
  return prisma.user.create({
    data: {
      name: overrides.name ?? faker.person.fullName(),
      email: overrides.email ?? faker.internet.email().toLowerCase(),
      password: passwordHash,
      role: overrides.role ?? "USER",
      ...(overrides.deletedAt !== undefined && overrides.deletedAt !== null
        ? { deletedAt: overrides.deletedAt }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  });
}

export const createAdmin = (overrides: { name?: string; email?: string } = {}) =>
  createUser({ ...overrides, role: "ADMIN" });

type CreateSurveyOverrides = {
  userId: string;
  title?: string;
  status?: "DRAFT" | "PUBLISHED" | "CLOSED";
  allowMultipleResponses?: boolean;
  isAnonymous?: boolean;
  publishedAt?: Date | null;
};

export async function createSurvey(overrides: CreateSurveyOverrides) {
  const title = overrides.title ?? faker.lorem.words(3);
  return prisma.survey.create({
    data: {
      title,
      description: faker.lorem.sentence(),
      slug: faker.helpers
        .slugify(`${title}-${faker.string.uuid().slice(0, 8)}`)
        .toLowerCase(),
      status: overrides.status ?? "DRAFT",
      allowMultipleResponses: overrides.allowMultipleResponses ?? false,
      isAnonymous: overrides.isAnonymous ?? true,
      userId: overrides.userId,
      ...(overrides.publishedAt !== undefined && overrides.publishedAt !== null
        ? { publishedAt: overrides.publishedAt }
        : {}),
    },
  });
}

type CreateResponseOverrides = {
  surveyId: string;
  userId?: string | null;
  responderKey?: string | null;
};

export async function createResponse(overrides: CreateResponseOverrides) {
  return prisma.response.create({
    data: {
      surveyId: overrides.surveyId,
      ...(overrides.userId ? { userId: overrides.userId } : {}),
      responderKey: overrides.responderKey ?? `anon:${faker.string.uuid()}`,
    },
  });
}

export function authHeaders(user: { id: string; role: "USER" | "ADMIN" }) {
  const token = signToken({ userId: user.id, role: user.role });
  return { Cookie: `${AUTH_COOKIE_NAME}=${token}` };
}

export function authHeadersWithCsrf(user: { id: string; role: "USER" | "ADMIN" }) {
  const token = signToken({ userId: user.id, role: user.role });
  const csrfToken = generateCsrfToken();
  return {
    Cookie: `${AUTH_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    "X-CSRF-Token": csrfToken,
  };
}

type CreateQuestionOverrides = {
  surveyId: string;
  questionText?: string;
  questionType?: string;
  isRequired?: boolean;
  position?: number;
  minValue?: number | null;
  maxValue?: number | null;
  ratingLabels?: string[];
};

export async function createQuestion(overrides: CreateQuestionOverrides) {
  return prisma.question.create({
    data: {
      surveyId: overrides.surveyId,
      questionText: overrides.questionText ?? faker.lorem.sentence(),
      questionType: (overrides.questionType as any) ?? "SHORT_TEXT",
      isRequired: overrides.isRequired ?? false,
      position: overrides.position ?? 1,
      minValue: overrides.minValue ?? null,
      maxValue: overrides.maxValue ?? null,
      ratingLabels: overrides.ratingLabels ?? [],
    },
  });
}

type CreateOptionOverrides = {
  questionId: string;
  optionText?: string;
  position?: number;
};

export async function createOption(overrides: CreateOptionOverrides) {
  return prisma.questionOption.create({
    data: {
      questionId: overrides.questionId,
      optionText: overrides.optionText ?? faker.word.noun(),
      position: overrides.position ?? 1,
    },
  });
}

export type TestUser = Awaited<ReturnType<typeof createUser>>;

export async function seedMediumDataset() {
  const admin = await createAdmin({ email: "admin@test.com", name: "Admin User" });

  const users: TestUser[] = [];
  for (let i = 0; i < 99; i++) {
    users.push(await createUser());
  }

  const allUsers = [admin, ...users];
  const statuses: Array<"DRAFT" | "PUBLISHED" | "CLOSED"> = [
    "DRAFT",
    "PUBLISHED",
    "CLOSED",
  ];
  let counter = 0;
  for (const user of allUsers) {
    for (let s = 0; s < 2; s++) {
      const status = statuses[counter % statuses.length];
      counter++;
      await createSurvey({
        userId: user.id,
        status,
        ...(status === "PUBLISHED" ? { publishedAt: new Date() } : { publishedAt: null }),
      });
    }
  }

  const surveys = await prisma.survey.findMany({ select: { id: true } });
  for (let r = 0; r < 300; r++) {
    const survey = surveys[r % surveys.length];
    await createResponse({ surveyId: survey.id, responderKey: `seed:${r}` });
  }

  return { admin, users, allUsers, surveyCount: surveys.length };
}
