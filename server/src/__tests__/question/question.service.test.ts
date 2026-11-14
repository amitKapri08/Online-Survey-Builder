import { describe, expect, it } from "vitest";
import {
  createQuestion,
  batchCreateQuestions,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  createOption,
  updateOption,
  deleteOption,
} from "../../services/question.service.js";
import { prisma } from "../../config/prisma.js";
import {
  createUser,
  createSurvey,
  createQuestion as createQuestionHelper,
  createOption as createOptionHelper,
} from "../helpers.js";
import { AppError } from "../../utils/AppError.js";

async function draftSurvey() {
  const user = await createUser();
  const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
  return { user, survey };
}

describe("createQuestion", () => {
  it("creates a SHORT_TEXT question at position 1", async () => {
    const { user, survey } = await draftSurvey();

    const result = await createQuestion(survey.id, user.id, {
      questionText: "What is your name?",
      questionType: "SHORT_TEXT",
    });

    expect(result.questionText).toBe("What is your name?");
    expect(result.questionType).toBe("SHORT_TEXT");
    expect(result.position).toBe(1);
    expect(result.options).toHaveLength(0);
  });

  it("creates a SINGLE_CHOICE question with options", async () => {
    const { user, survey } = await draftSurvey();

    const result = await createQuestion(survey.id, user.id, {
      questionText: "Pick one",
      questionType: "SINGLE_CHOICE",
      options: [
        { optionText: "Option A" },
        { optionText: "Option B" },
      ],
    });

    expect(result.options).toHaveLength(2);
    expect(result.options[0].optionText).toBe("Option A");
    expect(result.options[1].optionText).toBe("Option B");
  });

  it("creates a RATING question with min/max", async () => {
    const { user, survey } = await draftSurvey();

    const result = await createQuestion(survey.id, user.id, {
      questionText: "Rate us",
      questionType: "RATING",
      minValue: 1,
      maxValue: 5,
      ratingLabels: [
        "Very dissatisfied",
        "Dissatisfied",
        "Neutral",
        "Satisfied",
        "Very satisfied",
      ],
    });

    expect(result.minValue).toBe(1);
    expect(result.maxValue).toBe(5);
    expect(result.ratingLabels).toHaveLength(5);
    expect(result.ratingLabels[0]).toBe("Very dissatisfied");
    expect(result.ratingLabels[4]).toBe("Very satisfied");
  });

  it("appends at next position", async () => {
    const { user, survey } = await draftSurvey();
    await createQuestion(survey.id, user.id, {
      questionText: "Q1",
      questionType: "SHORT_TEXT",
    });
    const q2 = await createQuestion(survey.id, user.id, {
      questionText: "Q2",
      questionType: "SHORT_TEXT",
    });

    expect(q2.position).toBe(2);
  });

  it("throws 404 for non-existent survey", async () => {
    const user = await createUser();
    await expect(
      createQuestion("00000000-0000-0000-0000-000000000000", user.id, {
        questionText: "Q",
        questionType: "SHORT_TEXT",
      }),
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when user does not own survey", async () => {
    const { survey } = await draftSurvey();
    const otherUser = await createUser();

    await expect(
      createQuestion(survey.id, otherUser.id, {
        questionText: "Q",
        questionType: "SHORT_TEXT",
      }),
    ).rejects.toThrow(AppError);
  });

  it("throws SURVEY_LOCKED for non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await expect(
      createQuestion(survey.id, user.id, {
        questionText: "Q",
        questionType: "SHORT_TEXT",
      }),
    ).rejects.toThrow(AppError);

    try {
      await createQuestion(survey.id, user.id, {
        questionText: "Q",
        questionType: "SHORT_TEXT",
      });
    } catch (error) {
      expect((error as AppError).code).toBe("SURVEY_LOCKED");
    }
  });
});

describe("batchCreateQuestions", () => {
  it("creates multiple questions in a transaction", async () => {
    const { user, survey } = await draftSurvey();

    const result = await batchCreateQuestions(survey.id, user.id, {
      questions: [
        { questionText: "Q1", questionType: "SHORT_TEXT" },
        { questionText: "Q2", questionType: "YES_NO" },
        { questionText: "Q3", questionType: "NUMBER" },
      ],
    });

    expect(result).toHaveLength(3);
    expect(result[0].position).toBe(1);
    expect(result[1].position).toBe(2);
    expect(result[2].position).toBe(3);
  });

  it("appends after existing questions", async () => {
    const { user, survey } = await draftSurvey();
    await createQuestion(survey.id, user.id, {
      questionText: "Existing",
      questionType: "SHORT_TEXT",
    });

    const result = await batchCreateQuestions(survey.id, user.id, {
      questions: [
        { questionText: "New1", questionType: "SHORT_TEXT" },
        { questionText: "New2", questionType: "SHORT_TEXT" },
      ],
    });

    expect(result[0].position).toBe(2);
    expect(result[1].position).toBe(3);
  });

  it("throws SURVEY_LOCKED for non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await expect(
      batchCreateQuestions(survey.id, user.id, {
        questions: [{ questionText: "Q", questionType: "SHORT_TEXT" }],
      }),
    ).rejects.toThrow(AppError);
  });
});

describe("updateQuestion", () => {
  it("updates question text", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionText: "Old text",
    });

    const result = await updateQuestion(survey.id, question.id, user.id, {
      questionText: "New text",
    });

    expect(result.questionText).toBe("New text");
  });

  it("updates isRequired", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      isRequired: false,
    });

    const result = await updateQuestion(survey.id, question.id, user.id, {
      isRequired: true,
    });

    expect(result.isRequired).toBe(true);
  });

  it("syncs options for choice type questions", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    await createOptionHelper({ questionId: question.id, optionText: "Old A" });
    await createOptionHelper({ questionId: question.id, optionText: "Old B" });

    const result = await updateQuestion(survey.id, question.id, user.id, {
      questionType: "SINGLE_CHOICE",
      options: [
        { optionText: "New A" },
        { optionText: "New B" },
        { optionText: "New C" },
      ],
    });

    expect(result.options).toHaveLength(3);
  });

  it("deletes options when switching away from choice type", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    await createOptionHelper({ questionId: question.id });

    const result = await updateQuestion(survey.id, question.id, user.id, {
      questionType: "SHORT_TEXT",
    });

    expect(result.options).toHaveLength(0);
  });

  it("throws 404 for non-existent question", async () => {
    const { user, survey } = await draftSurvey();

    await expect(
      updateQuestion(survey.id, "00000000-0000-0000-0000-000000000000", user.id, {
        questionText: "Q",
      }),
    ).rejects.toThrow(AppError);
  });

  it("throws SURVEY_LOCKED for non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestionHelper({ surveyId: survey.id });

    await expect(
      updateQuestion(survey.id, question.id, user.id, {
        questionText: "Updated",
      }),
    ).rejects.toThrow(AppError);
  });
});

describe("deleteQuestion", () => {
  it("deletes a question and decrements positions", async () => {
    const { user, survey } = await draftSurvey();
    const q1 = await createQuestionHelper({ surveyId: survey.id, position: 1 });
    const q2 = await createQuestionHelper({ surveyId: survey.id, position: 2 });
    const q3 = await createQuestionHelper({ surveyId: survey.id, position: 3 });

    await deleteQuestion(survey.id, q2.id, user.id);

    const remaining = await prisma.question.findMany({
      where: { surveyId: survey.id },
      orderBy: { position: "asc" },
    });
    expect(remaining).toHaveLength(2);
    expect(remaining[0].position).toBe(1);
    expect(remaining[1].position).toBe(2);
  });

  it("throws 404 for non-existent question", async () => {
    const { user, survey } = await draftSurvey();

    await expect(
      deleteQuestion(survey.id, "00000000-0000-0000-0000-000000000000", user.id),
    ).rejects.toThrow(AppError);
  });

  it("throws SURVEY_LOCKED for non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestionHelper({ surveyId: survey.id });

    await expect(
      deleteQuestion(survey.id, question.id, user.id),
    ).rejects.toThrow(AppError);
  });
});

describe("reorderQuestions", () => {
  it("reorders questions to the given order", async () => {
    const { user, survey } = await draftSurvey();
    const q1 = await createQuestionHelper({ surveyId: survey.id, position: 1 });
    const q2 = await createQuestionHelper({ surveyId: survey.id, position: 2 });
    const q3 = await createQuestionHelper({ surveyId: survey.id, position: 3 });

    await reorderQuestions(survey.id, user.id, [q3.id, q1.id, q2.id]);

    const questions = await prisma.question.findMany({
      where: { surveyId: survey.id },
      orderBy: { position: "asc" },
    });
    expect(questions[0].id).toBe(q3.id);
    expect(questions[1].id).toBe(q1.id);
    expect(questions[2].id).toBe(q2.id);
  });

  it("throws 400 when IDs are incomplete", async () => {
    const { user, survey } = await draftSurvey();
    const q1 = await createQuestionHelper({ surveyId: survey.id, position: 1 });
    const q2 = await createQuestionHelper({ surveyId: survey.id, position: 2 });

    await expect(
      reorderQuestions(survey.id, user.id, [q1.id]),
    ).rejects.toThrow(AppError);
  });

  it("throws 400 when IDs contain duplicates", async () => {
    const { user, survey } = await draftSurvey();
    const q1 = await createQuestionHelper({ surveyId: survey.id, position: 1 });
    const q2 = await createQuestionHelper({ surveyId: survey.id, position: 2 });

    await expect(
      reorderQuestions(survey.id, user.id, [q1.id, q1.id]),
    ).rejects.toThrow(AppError);
  });

  it("throws 400 when an ID does not belong to the survey", async () => {
    const { user, survey } = await draftSurvey();
    const q1 = await createQuestionHelper({ surveyId: survey.id, position: 1 });

    await expect(
      reorderQuestions(survey.id, user.id, [
        q1.id,
        "00000000-0000-0000-0000-000000000000",
      ]),
    ).rejects.toThrow(AppError);
  });
});

describe("createOption", () => {
  it("creates an option for a choice question", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });

    const result = await createOption(survey.id, question.id, user.id, {
      optionText: "New Option",
    });

    expect(result.optionText).toBe("New Option");
    expect(result.position).toBe(1);
  });

  it("appends at next position", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "MULTIPLE_CHOICE",
    });
    await createOptionHelper({ questionId: question.id, position: 1 });

    const result = await createOption(survey.id, question.id, user.id, {
      optionText: "Second Option",
    });

    expect(result.position).toBe(2);
  });

  it("throws 400 for non-choice question type", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    await expect(
      createOption(survey.id, question.id, user.id, { optionText: "Opt" }),
    ).rejects.toThrow(AppError);

    try {
      await createOption(survey.id, question.id, user.id, { optionText: "Opt" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(400);
    }
  });
});

describe("updateOption", () => {
  it("updates option text", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    const option = await createOptionHelper({
      questionId: question.id,
      optionText: "Old",
    });

    const result = await updateOption(survey.id, question.id, option.id, user.id, {
      optionText: "New",
    });

    expect(result.optionText).toBe("New");
  });

  it("throws 404 for non-existent option", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });

    await expect(
      updateOption(
        survey.id,
        question.id,
        "00000000-0000-0000-0000-000000000000",
        user.id,
        { optionText: "New" },
      ),
    ).rejects.toThrow(AppError);
  });
});

describe("deleteOption", () => {
  it("deletes an option and decrements positions", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    const opt1 = await createOptionHelper({ questionId: question.id, position: 1 });
    const opt2 = await createOptionHelper({ questionId: question.id, position: 2 });
    const opt3 = await createOptionHelper({ questionId: question.id, position: 3 });

    await deleteOption(survey.id, question.id, opt2.id, user.id);

    const remaining = await prisma.questionOption.findMany({
      where: { questionId: question.id },
      orderBy: { position: "asc" },
    });
    expect(remaining).toHaveLength(2);
    expect(remaining[0].position).toBe(1);
    expect(remaining[1].position).toBe(2);
  });

  it("throws 404 for non-existent option", async () => {
    const { user, survey } = await draftSurvey();
    const question = await createQuestionHelper({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });

    await expect(
      deleteOption(
        survey.id,
        question.id,
        "00000000-0000-0000-0000-000000000000",
        user.id,
      ),
    ).rejects.toThrow(AppError);
  });
});
