import { createHash } from "node:crypto";
import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type {
  SubmitResponseInput,
  ResponseQueryInput,
} from "../validators/response.validator.js";

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
  allowMultipleResponses: true,
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
    throw new AppError(
      "Answer references an unknown question",
      400,
      "INVALID_ANSWER",
    );
  }

  const label = question.questionText;
  const optionIds = new Set(question.options.map((option) => option.id));
  const type = question.questionType;
  const link = { question: { connect: { id: questionId } } };
  const snapshots = (option?: { optionText: string }) => ({
    questionTextSnapshot: question.questionText,
    questionPositionSnapshot: question.position,
    optionTextSnapshot: option?.optionText ?? null,
  });

  switch (type) {
    case "SHORT_TEXT":
    case "LONG_TEXT": {
      requireValue(label, value);
      if (typeof value !== "string") {
        throw new AppError(`${label} must be text`, 400, "INVALID_ANSWER");
      }
      return { ...link, ...snapshots(), answerText: value };
    }
    case "YES_NO": {
      requireValue(label, value);
      if (typeof value !== "string" || !["yes", "no"].includes(value)) {
        throw new AppError(`${label} must be Yes or No`, 400, "INVALID_ANSWER");
      }
      return { ...link, ...snapshots(), answerText: value };
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
      return { ...link, ...snapshots(), answerNumber: value };
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
      return { ...link, ...snapshots(), answerNumber: value };
    }
    case "DATE": {
      requireValue(label, value);
      if (typeof value !== "string") {
        throw new AppError(`${label} must be a date`, 400, "INVALID_ANSWER");
      }
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) {
        throw new AppError(
          `${label} must be a valid date`,
          400,
          "INVALID_ANSWER",
        );
      }
      return { ...link, ...snapshots(), answerDate: parsed };
    }
    case "SINGLE_CHOICE":
    case "DROPDOWN": {
      requireValue(label, value);
      if (typeof value !== "string" || !optionIds.has(value)) {
        throw new AppError(
          `${label} must match one of the options`,
          400,
          "INVALID_ANSWER",
        );
      }
      const chosenOption = question.options.find(
        (option) => option.id === value,
      );
      return {
        ...link,
        ...snapshots(chosenOption),
        option: { connect: { id: value } },
      };
    }
    case "MULTIPLE_CHOICE": {
      requireValue(label, value);
      if (!Array.isArray(value) || value.length === 0) {
        throw new AppError(
          `Select at least one option for ${label}`,
          400,
          "INVALID_ANSWER",
        );
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
      return value.map((optionId) => {
        const chosenOption = question.options.find(
          (option) => option.id === optionId,
        );
        return {
          ...link,
          ...snapshots(chosenOption),
          option: { connect: { id: optionId } },
        };
      });
    }
    default:
      throw new AppError("Unsupported question type", 400, "INVALID_ANSWER");
  }
}

export const getPublicSurveyBySlug = async (
  slug: string,
): Promise<PublicSurvey> => {
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
  visitorId?: string,
) => {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: publicSurveySelect,
  });

  if (!survey || survey.status !== "PUBLISHED") {
    throw new AppError("Survey not found", 404);
  }

  const shouldBeAnonymous = Boolean(
    survey.isAnonymous && (input.submitAnonymously || !userId),
  );
  const storedUserId = shouldBeAnonymous ? null : (userId ?? null);

  const responderKey = (() => {
    if (survey.allowMultipleResponses) return null;
    if (userId) {
      // Deterministically tie authenticated responses to user and survey
      // so a user cannot submit twice under different anonymity options.
      return `user-auth:${createHash("sha256").update(`${userId}:${surveyId}`).digest("hex")}`;
    }
    if (visitorId) {
      return `anon:${createHash("sha256").update(visitorId).digest("hex")}`;
    }
    return null;
  })();

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

  const response = await prisma
    .$transaction(async (tx) => {
      return tx.response.create({
        data: {
          surveyId,
          userId: storedUserId,
          responderKey,
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
    })
    .catch((error: unknown) => {
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        throw new AppError(
          "You have already responded to this survey",
          409,
          "ALREADY_SUBMITTED",
        );
      }
      throw error;
    });

  return response;
};

export type { PublicSurvey };

/* ------------------------------------------------------------------ */
/* Response reads (owner-only): list + per-question analytics           */
/* ------------------------------------------------------------------ */

export type QuestionTypeName =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "RATING"
  | "YES_NO"
  | "NUMBER"
  | "DATE";

export type RespondentType = "authenticated" | "anonymous";

export interface SurveyResponseAnswer {
  questionId: string | null;
  questionText: string;
  questionType: QuestionTypeName | null;
  value: string | number | string[] | null;
}

export interface SurveyResponseDto {
  responseId: string;
  submittedAt: string;
  respondentType: RespondentType;
  answers: SurveyResponseAnswer[];
}

export interface ResponseListResult {
  responses: SurveyResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ResultsSurvey {
  id: string;
  userId: string;
  title: string;
  slug: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionType: QuestionTypeName;
    position: number;
    minValue: number | null;
    maxValue: number | null;
    options: Array<{ id: string; optionText: string; position: number }>;
  }>;
}

interface RawAnswer {
  responseId: string;
  responseCreatedAt: Date;
  id: string;
  questionId: string | null;
  optionId: string | null;
  answerText: string | null;
  answerNumber: number | null;
  answerDate: Date | null;
  questionTextSnapshot: string | null;
  optionTextSnapshot: string | null;
  questionPositionSnapshot: number | null;
}

interface RawResponseRow {
  id: string;
  userId: string | null;
  createdAt: Date;
  answers: RawAnswer[];
}

const responseAnswerSelect = {
  id: true,
  questionId: true,
  optionId: true,
  answerText: true,
  answerNumber: true,
  answerDate: true,
  questionTextSnapshot: true,
  optionTextSnapshot: true,
  questionPositionSnapshot: true,
} as const;

async function getOwnedSurveyForResults(
  surveyId: string,
  userId: string,
): Promise<ResultsSurvey> {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: {
      id: true,
      userId: true,
      title: true,
      slug: true,
      questions: {
        select: {
          id: true,
          questionText: true,
          questionType: true,
          position: true,
          minValue: true,
          maxValue: true,
          options: {
            select: { id: true, optionText: true, position: true },
            orderBy: { position: "asc" as const },
          },
        },
        orderBy: { position: "asc" as const },
      },
    },
  });

  if (!survey || survey.userId !== userId) {
    throw new AppError("Survey not found", 404);
  }

  return {
    ...survey,
    questions: survey.questions.map((question) => ({
      ...question,
      questionType: question.questionType as QuestionTypeName,
    })),
  };
}

async function loadResponseRows(surveyId: string): Promise<RawResponseRow[]> {
  const rows = await prisma.response.findMany({
    where: { surveyId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      answers: {
        select: responseAnswerSelect,
        orderBy: [
          { questionPositionSnapshot: "asc" as const },
          { createdAt: "asc" as const },
        ],
      },
    },
    orderBy: { createdAt: "asc" as const },
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    answers: row.answers.map((answer) => ({
      ...answer,
      responseId: row.id,
      responseCreatedAt: row.createdAt,
    })),
  }));
}

function liveOptionText(
  survey: ResultsSurvey,
  questionId: string | null,
  optionId: string | null,
): string | null {
  if (!questionId || !optionId) return null;
  const question = survey.questions.find(
    (candidate) => candidate.id === questionId,
  );
  return (
    question?.options.find((option) => option.id === optionId)?.optionText ??
    null
  );
}

function answerGroupValue(
  answers: RawAnswer[],
  survey: ResultsSurvey,
): string | number | string[] | null {
  if (answers.length === 1) {
    const answer = answers[0];
    if (!answer) return null;
    if (answer.answerNumber != null) return answer.answerNumber;
    if (answer.answerDate != null) return answer.answerDate.toISOString();
    if (answer.optionId != null) {
      return (
        answer.optionTextSnapshot ??
        liveOptionText(survey, answer.questionId, answer.optionId)
      );
    }
    if (answer.answerText != null) return answer.answerText;
    if (answer.questionId != null) return answer.answerText;
    return null;
  }

  const selected: string[] = [];
  for (const answer of answers) {
    const text =
      answer.optionTextSnapshot ??
      liveOptionText(survey, answer.questionId, answer.optionId);
    if (text != null) selected.push(text);
  }
  return selected;
}

function questionTypeForAnswer(
  survey: ResultsSurvey,
  questionId: string | null,
): QuestionTypeName | null {
  const question = survey.questions.find(
    (candidate) => candidate.id === questionId,
  );
  if (question) return question.questionType;
  return null;
}

async function loadPaginatedResponseRows(
  surveyId: string,
  skip: number,
  take: number,
  order: "newest" | "oldest",
): Promise<RawResponseRow[]> {
  const rows = await prisma.response.findMany({
    where: { surveyId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      answers: {
        select: responseAnswerSelect,
        orderBy: [
          { questionPositionSnapshot: "asc" as const },
          { createdAt: "asc" as const },
        ],
      },
    },
    orderBy: {
      createdAt: order === "oldest" ? ("asc" as const) : ("desc" as const),
    },
    skip,
    take,
  });

  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    createdAt: row.createdAt,
    answers: row.answers.map((answer) => ({
      ...answer,
      responseId: row.id,
      responseCreatedAt: row.createdAt,
    })),
  }));
}

export const getSurveyResponses = async (
  surveyId: string,
  userId: string,
  query: ResponseQueryInput,
): Promise<ResponseListResult> => {
  const survey = await getOwnedSurveyForResults(surveyId, userId);
  const { page, limit, order } = query;
  const skip = (page - 1) * limit;

  const [pageRows, total] = await Promise.all([
    loadPaginatedResponseRows(surveyId, skip, limit, order),
    prisma.response.count({ where: { surveyId } }),
  ]);

  const responses: SurveyResponseDto[] = pageRows.map((row) => {
    const grouped = new Map<string, RawAnswer[]>();
    for (const answer of row.answers) {
      const key = answer.questionId ?? answer.questionTextSnapshot ?? answer.id;
      const existing = grouped.get(key);
      if (existing) existing.push(answer);
      else grouped.set(key, [answer]);
    }

    const answers: SurveyResponseAnswer[] = [];
    for (const group of grouped.values()) {
      const first = group[0];
      if (!first) continue;
      answers.push({
        questionId: first.questionId,
        questionText:
          first.questionTextSnapshot ??
          survey.questions.find((q) => q.id === first.questionId)
            ?.questionText ??
          "Deleted question",
        questionType: questionTypeForAnswer(survey, first.questionId),
        value: answerGroupValue(group, survey),
      });
    }

    return {
      responseId: row.id,
      submittedAt: row.createdAt.toISOString(),
      respondentType: row.userId ? "authenticated" : "anonymous",
      answers,
    };
  });

  return {
    responses,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export type QuestionAnalytics =
  | {
      type: "CHOICE";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      options: Array<{ optionId: string; optionText: string; count: number }>;
    }
  | {
      type: "YES_NO";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      yes: number;
      no: number;
    }
  | {
      type: "RATING";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      min: number;
      max: number;
      average: number;
      distribution: Array<{ value: number; count: number }>;
    }
  | {
      type: "NUMBER";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      min: number;
      max: number;
      average: number;
    }
  | {
      type: "TEXT";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      samples: Array<{ responseId: string; text: string; submittedAt: string }>;
    }
  | {
      type: "DATE";
      questionId: string;
      questionText: string;
      position: number;
      total: number;
      earliest: string | null;
      latest: string | null;
    };

export const getSurveyAnalytics = async (
  surveyId: string,
  userId: string,
): Promise<QuestionAnalytics[]> => {
  const survey = await getOwnedSurveyForResults(surveyId, userId);
  const rows = await loadResponseRows(surveyId);

  const answerGroups = new Map<string, RawAnswer[]>();
  for (const row of rows) {
    for (const answer of row.answers) {
      const questionId = answer.questionId;
      const key = questionId ?? answer.questionTextSnapshot ?? answer.id;
      const existing = answerGroups.get(key);
      if (existing) existing.push(answer);
      else answerGroups.set(key, [answer]);
    }
  }

  const result: QuestionAnalytics[] = [];
  for (const question of survey.questions) {
    const answers = answerGroups.get(question.id) ?? [];
    const respondents = new Set(answers.map((answer) => answer.responseId));
    const total = respondents.size;
    const base = {
      questionId: question.id,
      questionText: question.questionText,
      position: question.position,
      total,
    };

    switch (question.questionType) {
      case "SINGLE_CHOICE":
      case "MULTIPLE_CHOICE":
      case "DROPDOWN": {
        const counts = new Map<string, number>();
        for (const answer of answers)
          counts.set(
            answer.optionId ?? "",
            (counts.get(answer.optionId ?? "") ?? 0) + 1,
          );
        result.push({
          type: "CHOICE",
          ...base,
          options: question.options.map((option) => ({
            optionId: option.id,
            optionText: option.optionText,
            count: counts.get(option.id) ?? 0,
          })),
        });
        break;
      }
      case "YES_NO": {
        let yes = 0;
        let no = 0;
        for (const answer of answers) {
          if (answer.answerText === "yes") yes += 1;
          else if (answer.answerText === "no") no += 1;
        }
        result.push({ type: "YES_NO", ...base, yes, no });
        break;
      }
      case "RATING": {
        const values = answers
          .map((answer) => answer.answerNumber)
          .filter((value): value is number => typeof value === "number");
        const min = question.minValue ?? 1;
        const max = question.maxValue ?? 5;
        const distribution = Array.from(
          { length: max - min + 1 },
          (_, offset) => {
            const value = min + offset;
            return { value, count: values.filter((v) => v === value).length };
          },
        );
        const average =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0;
        result.push({
          type: "RATING",
          ...base,
          min,
          max,
          average,
          distribution,
        });
        break;
      }
      case "NUMBER": {
        const values = answers
          .map((answer) => answer.answerNumber)
          .filter((value): value is number => typeof value === "number");
        const min = values.length > 0 ? Math.min(...values) : null;
        const max = values.length > 0 ? Math.max(...values) : null;
        const average =
          values.length > 0
            ? values.reduce((sum, value) => sum + value, 0) / values.length
            : 0;
        result.push({
          type: "NUMBER",
          ...base,
          min: min ?? 0,
          max: max ?? 0,
          average,
        });
        break;
      }
      case "SHORT_TEXT":
      case "LONG_TEXT": {
        const samples = [...answers]
          .sort(
            (a, b) =>
              b.responseCreatedAt.getTime() - a.responseCreatedAt.getTime(),
          )
          .slice(0, 5)
          .map((answer) => ({
            responseId: answer.responseId,
            text: answer.answerText ?? "",
            submittedAt: answer.responseCreatedAt.toISOString(),
          }));
        result.push({ type: "TEXT", ...base, samples });
        break;
      }
      case "DATE": {
        const dates = answers
          .map((answer) => answer.answerDate)
          .filter((value): value is Date => value instanceof Date);
        const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
        result.push({
          type: "DATE",
          ...base,
          earliest: sorted[0]?.toISOString() ?? null,
          latest: sorted[sorted.length - 1]?.toISOString() ?? null,
        });
        break;
      }
      default:
        break;
    }
  }

  return result;
};

export type { RawAnswer, ResultsSurvey };
export {
  answerGroupValue,
  questionTypeForAnswer,
  loadResponseRows,
  getOwnedSurveyForResults,
};
