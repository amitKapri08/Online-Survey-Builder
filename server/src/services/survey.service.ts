import { randomBytes } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { CreateSurveyInput, UpdateSurveyInput, SurveyQueryInput } from "../validators/survey.validator.js";

const SURVEY_UNDO_WINDOW_MS = 30 * 1000;
const UNIQUE_SLUG_RETRIES = 5;

function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  const normalizedBase = base || "survey";
  const suffix = randomBytes(3).toString("hex");
  return `${normalizedBase}-${suffix}`;
}

async function generateUniqueSlug(title: string): Promise<string> {
  for (let attempt = 0; attempt < UNIQUE_SLUG_RETRIES; attempt++) {
    const slug = generateSlug(title);
    const existing = await prisma.survey.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing) {
      return slug;
    }
  }

  const slug = `survey-${randomBytes(4).toString("hex")}`;
  const existing = await prisma.survey.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (existing) {
    throw new AppError("Could not generate a unique slug, please try again", 409);
  }
  return slug;
}

const surveySelect = {
  id: true,
  title: true,
  description: true,
  slug: true,
  status: true,
  isAnonymous: true,
  allowMultipleResponses: true,
  viewCount: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      questions: true,
      responses: true,
    },
  },
} as const;

const surveyDetailSelect = {
  ...surveySelect,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} as const;

export const createSurvey = async (userId: string, input: CreateSurveyInput) => {
  let slug: string;

  if (input.slug) {
    slug = input.slug;
    const existingSlug = await prisma.survey.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      throw new AppError("Slug is already taken", 409);
    }
  } else {
    slug = await generateUniqueSlug(input.title);
  }

  const survey = await prisma.survey.create({
    data: {
      title: input.title,
      description: input.description ?? null,
      slug,
      isAnonymous: input.isAnonymous ?? false,
      allowMultipleResponses: input.allowMultipleResponses ?? false,
      userId,
    },
    select: surveySelect,
  });

  return survey;
};

export const getSurveys = async (userId: string, query: SurveyQueryInput) => {
  const { page, limit, status, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(status && { status }),
    ...(search && {
      title: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      select: surveySelect,
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.survey.count({ where }),
  ]);

  return {
    surveys,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getSurveyById = async (surveyId: string, userId?: string) => {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: surveyDetailSelect,
  });

  if (!survey) {
    throw new AppError("Survey not found", 404);
  }

  if (userId && survey.user.id !== userId) {
    throw new AppError("Survey not found", 404);
  }

  return survey;
};

export const getSurveyBySlug = async (slug: string) => {
  const survey = await prisma.survey.findUnique({
    where: { slug },
    select: {
      ...surveyDetailSelect,
      questions: {
        select: {
          id: true,
          questionText: true,
          questionType: true,
          isRequired: true,
          position: true,
          minValue: true,
          maxValue: true,
          options: {
            select: {
              id: true,
              optionText: true,
              position: true,
            },
            orderBy: { position: "asc" as const },
          },
        },
        orderBy: { position: "asc" as const },
      },
    },
  });

  if (!survey) {
    throw new AppError("Survey not found", 404);
  }

  if (survey.status !== "PUBLISHED") {
    throw new AppError("Survey is not available", 404);
  }

  return survey;
};

export const recordSurveyView = async (
  surveyId: string,
  visitorKey: string,
): Promise<void> => {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { id: true, status: true },
  });

  if (!survey || survey.status !== "PUBLISHED") {
    throw new AppError("Survey not found", 404);
  }

  try {
    await prisma.surveyView.create({
      data: { surveyId, visitorKey },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return;
    }
    throw error;
  }

  await prisma.survey.update({
    where: { id: surveyId },
    data: { viewCount: { increment: 1 } },
  });
};

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["PUBLISHED"],
  PUBLISHED: ["CLOSED"],
  CLOSED: [],
};

export const updateSurvey = async (surveyId: string, userId: string, input: UpdateSurveyInput) => {
  const existing = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { id: true, userId: true, status: true, slug: true, updatedAt: true },
  });

  if (!existing) {
    throw new AppError("Survey not found", 404);
  }

  if (existing.userId !== userId) {
    throw new AppError("Survey not found", 404);
  }

  if (input.slug && input.slug !== existing.slug) {
    const slugConflict = await prisma.survey.findUnique({
      where: { slug: input.slug },
      select: { id: true },
    });
    if (slugConflict && slugConflict.id !== surveyId) {
      throw new AppError("Slug is already taken", 409);
    }
  }

  if (input.status) {
    const isUndo =
      existing.status === "CLOSED" &&
      input.status === "PUBLISHED" &&
      Date.now() - existing.updatedAt.getTime() < SURVEY_UNDO_WINDOW_MS;

    const allowed = VALID_TRANSITIONS[existing.status] ?? [];
    if (
      input.status !== existing.status &&
      !isUndo &&
      !allowed.includes(input.status)
    ) {
      throw new AppError(
        `Cannot transition survey from ${existing.status} to ${input.status}`,
        400,
        "INVALID_STATUS_TRANSITION",
      );
    }
  }

  if (existing.status !== "DRAFT") {
    const editFields: (keyof UpdateSurveyInput)[] = [
      "title",
      "description",
      "slug",
      "isAnonymous",
      "allowMultipleResponses",
    ];
    if (editFields.some((field) => input[field] !== undefined)) {
      throw new AppError(
        "Survey details can only be edited while the survey is in draft",
        400,
        "SURVEY_LOCKED",
      );
    }
  }

  const data: Record<string, unknown> = Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  );

  if (input.status === "PUBLISHED" && existing.status !== "PUBLISHED") {
    data.publishedAt = new Date();
  }

  const survey = await prisma.survey.update({
    where: { id: surveyId },
    data,
    select: surveySelect,
  });

  return survey;
};

export const deleteSurvey = async (surveyId: string, userId: string) => {
  const existing = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { id: true, userId: true },
  });

  if (!existing) {
    throw new AppError("Survey not found", 404);
  }

  if (existing.userId !== userId) {
    throw new AppError("Survey not found", 404);
  }

  await prisma.survey.delete({ where: { id: surveyId } });
};
