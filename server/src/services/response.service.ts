import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type { SubmitResponseInput } from "../validators/response.validator.js";

type AnswerValue = string | number | string[];

const TEXT_TYPES: ReadonlyArray<string> = ["SHORT_TEXT", "LONG_TEXT"];
const SINGLE_OPTION_TYPES: ReadonlyArray<string> = [
  "SINGLE_CHOICE",
  "DROPDOWN",
];

const publicSurveySelect = {
  id: true,
  title: true,
  description: true,
  slug: true,
  status: true,
  isAnonymous: true,
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
} as const;

type PublicSurvey = Prisma.SurveyGetPayload<{
  select: typeof publicSurveySelect;
}>;

function isBlankValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function requireValue(label: string, value: unknown): void {
  if (isBlankValue(value)) {
    throw new AppError(`${label} is required`, 400, "REQUIRED_FIELD_MISSING");
  }
}

function buildAnswer(
  survey: PublicSurvey,
  questionId: string,
  value: AnswerValue,
):
  | Prisma.AnswerCreateWithoutResponseInput
  | Prisma.AnswerCreateWithoutResponseInput[] {
  const question = survey.questions.find(
    (candidate) => candidate.id === questionId,
  );
  if (!question) {
    throw new AppError("Answer references an unknown question", 400, "INVALID_ANSWER");
  }

  const label = question.questionText;
  const optionIds = new Set(question.options.map((option) => option.id));
  const type = question.questionType;
  const link = { question: { connect: { id: questionId } } };

  switch (type) {
    case "SHORT_TEXT":
    case "LONG_TEXT": {
      requireValue(label, value);
      if (typeof value !== "string") {
        throw new AppError(`${label} must be text`, 400, "INVALID_ANSWER");
      }
      return { ...link, answerText: value };
    }
    case "YES_NO": {
      requireValue(label, value);
      if (typeof value !== "string" || !["yes", "no"].includes(value)) {
        throw new AppError(`${label} must be Yes or No`, 400, "INVALID_ANSWER");
      }
      return { ...link, answerText: value };
    }
    case "NUMBER": {
      requireValue(label, value);
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new AppError(`${label} must be a number`, 400, "INVALID_ANSWER");
      }
      if (
        question.minValue != null &&
        (value < question.minValue || !Number.isInteger(value))
      ) {
        throw new AppError(
          `${label} must be at least ${question.minValue}`,
          400,
          "INVALID_ANSWER",
        );
      }
      if (
        question.maxValue != null &&
        (value > question.maxValue || !Number.isInteger(value))
      ) {
        throw new AppError(
          `${label} must be at most ${question.maxValue}`,
          400,
          "INVALID_ANSWER",
        );
      }
      return { ...link, answerNumber: value };
    }
    case "RATING": {
      requireValue(label, value);
      if (typeof value !== "number" || Number.isNaN(value)) {
        throw new AppError(`${label} must be a number`, 400, "INVALID_ANSWER");
      }
      const min = question.minValue ?? 1;
      const max = question.maxValue ?? 5;
      if (!Number.isInteger(value) || value < min || value > max) {
        throw new AppError(
          `${label} must be between ${min} and ${max}`,
          400,
          "INVALID_ANSWER",
        );
      }
      return { ...link, answerNumber: value };
    }
    case "DATE": {
      requireValue(label, value);
      if (typeof value !== "string") {
        throw new AppError(`${label} must be a date`, 400, "INVALID_ANSWER");
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new AppError(`${label} must be a valid date`, 400, "INVALID_ANSWER");
      }
      return { ...link, answerDate: parsed };
    }
    case "SINGLE_CHOICE":
    case "DROPDOWN": {
      requireValue(label, value);
      if (typeof value !== "string" || !optionIds.has(value)) {
        throw new AppError(`${label} must match one of the options`, 400, "INVALID_ANSWER");
      }
      return { ...link, option: { connect: { id: value } } };
    }
    case "MULTIPLE_CHOICE": {
      requireValue(label, value);
      if (!Array.isArray(value) || value.length === 0) {
        throw new AppError(`Select at least one option for ${label}`, 400, "INVALID_ANSWER");
      }
      value.forEach((optionId) => {
        if (typeof optionId !== "string" || !optionIds.has(optionId)) {
          throw new AppError(
            `${label} must match the available options`,
            400,
            "INVALID_ANSWER",
          );
        }
      });
      return value.map((optionId) => ({
        ...link,
        option: { connect: { id: optionId } },
      }));
    }
    default:
      throw new AppError("Unsupported question type", 400, "INVALID_ANSWER");
  }
}

export const getPublicSurveyBySlug = async (slug: string): Promise<PublicSurvey> => {
  const survey = await prisma.survey.findUnique({
    where: { slug },
    select: publicSurveySelect,
  });

  if (!survey || survey.status !== "PUBLISHED") {
    throw new AppError("Survey not found", 404);
  }

  return survey;
};

export const submitResponse = async (
  surveyId: string,
  input: SubmitResponseInput,
  userId?: string,
) => {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: publicSurveySelect,
  });

  if (!survey || survey.status !== "PUBLISHED") {
    throw new AppError("Survey not found", 404);
  }

  const submittedByQuestion = new Map<string, AnswerValue>();
  for (const answer of input.answers) {
    if (submittedByQuestion.has(answer.questionId)) {
      throw new AppError(
        "Each question can only have one answer",
        400,
        "INVALID_ANSWER",
      );
    }
    submittedByQuestion.set(answer.questionId, answer.value);
  }

  for (const question of survey.questions) {
    const value = submittedByQuestion.get(question.id);
    if (isBlankValue(value) && question.isRequired) {
      throw new AppError(
        `${question.questionText} is required`,
        400,
        "REQUIRED_FIELD_MISSING",
      );
    }
  }

  const answerCreates: Prisma.AnswerCreateWithoutResponseInput[] = [];
  for (const question of survey.questions) {
    if (!submittedByQuestion.has(question.id)) continue;
    const value = submittedByQuestion.get(question.id) as AnswerValue;
    if (isBlankValue(value)) continue;
    const created = buildAnswer(survey, question.id, value);
    if (Array.isArray(created)) {
      answerCreates.push(...created);
    } else {
      answerCreates.push(created);
    }
  }

  const response = await prisma.$transaction(async (tx) => {
    return tx.response.create({
      data: {
        surveyId,
        userId: userId ?? null,
        answers: {
          create: answerCreates,
        },
      },
      select: {
        id: true,
        surveyId: true,
        createdAt: true,
        _count: {
          select: { answers: true },
        },
      },
    });
  });

  return response;
};

export type { PublicSurvey };