import type { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import type {
  CreateQuestionInput,
  UpdateQuestionInput,
} from "../validators/question.validator.js";

const CHOICE_TYPES: ReadonlyArray<string> = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
];

type OptionSyncInput = {
  id?: string | undefined;
  optionText: string;
  position?: number | undefined;
};

const questionSelect = {
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
} as const;

async function getEditableSurveyOrThrow(surveyId: string, userId: string) {
  const survey = await prisma.survey.findUnique({
    where: { id: surveyId },
    select: { id: true, userId: true, status: true },
  });

  if (!survey || survey.userId !== userId) {
    throw new AppError("Survey not found", 404);
  }

  if (survey.status !== "DRAFT") {
    throw new AppError(
      "Questions can only be edited while the survey is in draft",
      400,
      "SURVEY_LOCKED",
    );
  }

  return survey;
}

async function getQuestionOrThrow(surveyId: string, questionId: string) {
  const question = await prisma.question.findFirst({
    where: { id: questionId, surveyId },
    select: { id: true, questionType: true },
  });

  if (!question) {
    throw new AppError("Question not found", 404);
  }

  return question;
}

async function syncQuestionOptions(
  tx: Prisma.TransactionClient,
  questionId: string,
  options: OptionSyncInput[],
): Promise<void> {
  const existing = await tx.questionOption.findMany({
    where: { questionId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((option) => option.id));
  const retainedIds = options
    .map((option) => option.id)
    .filter((id): id is string => typeof id === "string" && existingIds.has(id));

  await tx.questionOption.deleteMany({
    where: { questionId, id: { notIn: retainedIds } },
  });

  for (const [index, option] of options.entries()) {
    const position = option.position ?? index + 1;

    if (option.id && existingIds.has(option.id)) {
      await tx.questionOption.update({
        where: { id: option.id },
        data: { optionText: option.optionText, position },
      });
    } else {
      await tx.questionOption.create({
        data: { questionId, optionText: option.optionText, position },
      });
    }
  }
}

export const createQuestion = async (
  surveyId: string,
  userId: string,
  input: CreateQuestionInput,
) => {
  await getEditableSurveyOrThrow(surveyId, userId);

  const lastQuestion = await prisma.question.findFirst({
    where: { surveyId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const position = (lastQuestion?.position ?? 0) + 1;

  const data: Prisma.QuestionUncheckedCreateInput = {
    surveyId,
    questionText: input.questionText,
    questionType: input.questionType,
    isRequired: input.isRequired ?? false,
    minValue: input.minValue ?? null,
    maxValue: input.maxValue ?? null,
    position,
  };

  if (input.options?.length) {
    data.options = {
      create: input.options.map((option, index) => ({
        optionText: option.optionText,
        position: option.position ?? index + 1,
      })),
    };
  }

  const question = await prisma.question.create({
    data,
    select: questionSelect,
  });

  return question;
};

export const updateQuestion = async (
  surveyId: string,
  questionId: string,
  userId: string,
  input: UpdateQuestionInput,
) => {
  await getEditableSurveyOrThrow(surveyId, userId);
  const existing = await getQuestionOrThrow(surveyId, questionId);

  const data: Prisma.QuestionUpdateInput = {
    ...(input.questionText !== undefined && {
      questionText: input.questionText,
    }),
    ...(input.questionType !== undefined && {
      questionType: input.questionType,
    }),
    ...(input.isRequired !== undefined && { isRequired: input.isRequired }),
  };

  if (input.minValue !== undefined) {
    data.minValue = input.minValue;
  }
  if (input.maxValue !== undefined) {
    data.maxValue = input.maxValue;
  }

  const nextType = input.questionType ?? existing.questionType;
  const isChoice = CHOICE_TYPES.includes(nextType);
  const nextOptions = input.options;

  if (!isChoice && (nextType !== existing.questionType || nextOptions !== undefined)) {
    const question = await prisma.$transaction(async (tx) => {
      const updated = await tx.question.update({
        where: { id: questionId },
        data,
        select: questionSelect,
      });
      await tx.questionOption.deleteMany({ where: { questionId } });
      return updated;
    });
    return { ...question, options: [] };
  }

  if (isChoice && nextOptions !== undefined) {
    return await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data,
      });

      await syncQuestionOptions(tx, questionId, nextOptions);

      return await tx.question.findUniqueOrThrow({
        where: { id: questionId },
        select: questionSelect,
      });
    });
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data,
    select: questionSelect,
  });

  return question;
};

export const deleteQuestion = async (
  surveyId: string,
  questionId: string,
  userId: string,
): Promise<void> => {
  await getEditableSurveyOrThrow(surveyId, userId);

  const existing = await prisma.question.findFirst({
    where: { id: questionId, surveyId },
    select: { id: true, position: true },
  });

  if (!existing) {
    throw new AppError("Question not found", 404);
  }

  await prisma.$transaction([
    prisma.question.delete({ where: { id: questionId } }),
    prisma.question.updateMany({
      where: { surveyId, position: { gt: existing.position } },
      data: { position: { decrement: 1 } },
    }),
  ]);
};

export const reorderQuestions = async (
  surveyId: string,
  userId: string,
  orderedIds: string[],
): Promise<void> => {
  await getEditableSurveyOrThrow(surveyId, userId);

  const questions = await prisma.question.findMany({
    where: { surveyId },
    select: { id: true },
  });

  const existingIds = new Set(questions.map((question) => question.id));

  if (
    orderedIds.length !== existingIds.size ||
    new Set(orderedIds).size !== orderedIds.length ||
    orderedIds.some((id) => !existingIds.has(id))
  ) {
    throw new AppError("Invalid question order", 400);
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.question.updateMany({
        where: { id, surveyId },
        data: { position: index + 1 },
      }),
    ),
  );
};

export const createOption = async (
  surveyId: string,
  questionId: string,
  userId: string,
  input: { optionText: string; position?: number | undefined },
) => {
  await getEditableSurveyOrThrow(surveyId, userId);
  const question = await getQuestionOrThrow(surveyId, questionId);

  if (!CHOICE_TYPES.includes(question.questionType)) {
    throw new AppError("This question type does not support options", 400);
  }

  const lastOption = await prisma.questionOption.findFirst({
    where: { questionId },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const position = input.position ?? (lastOption?.position ?? 0) + 1;

  return prisma.questionOption.create({
    data: {
      questionId,
      optionText: input.optionText,
      position,
    },
  });
};

export const updateOption = async (
  surveyId: string,
  questionId: string,
  optionId: string,
  userId: string,
  input: { optionText?: string | undefined; position?: number | undefined },
) => {
  await getEditableSurveyOrThrow(surveyId, userId);
  await getQuestionOrThrow(surveyId, questionId);

  const existing = await prisma.questionOption.findFirst({
    where: { id: optionId, questionId },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError("Option not found", 404);
  }

  const data: Prisma.QuestionOptionUpdateInput = {};
  if (input.optionText !== undefined) {
    data.optionText = input.optionText;
  }
  if (input.position !== undefined) {
    data.position = input.position;
  }

  return prisma.questionOption.update({
    where: { id: optionId },
    data,
  });
};

export const deleteOption = async (
  surveyId: string,
  questionId: string,
  optionId: string,
  userId: string,
): Promise<void> => {
  await getEditableSurveyOrThrow(surveyId, userId);
  await getQuestionOrThrow(surveyId, questionId);

  const existing = await prisma.questionOption.findFirst({
    where: { id: optionId, questionId },
    select: { id: true, position: true },
  });

  if (!existing) {
    throw new AppError("Option not found", 404);
  }

  await prisma.$transaction([
    prisma.questionOption.delete({ where: { id: optionId } }),
    prisma.questionOption.updateMany({
      where: { questionId, position: { gt: existing.position } },
      data: { position: { decrement: 1 } },
    }),
  ]);
};