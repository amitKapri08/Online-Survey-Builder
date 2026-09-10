import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../../config/prisma.js";
import {
  createUser,
  createSurvey,
  createQuestion,
  createOption,
  createResponse,
  TestUser,
} from "../helpers.js";
import {
  getPublicSurveyBySlug,
  submitResponse,
  getSurveyResponses,
  getSurveyAnalytics,
} from "../../services/response.service.js";

let user: TestUser;

beforeEach(async () => {
  user = await createUser({ email: "owner@test.com" });
});

describe("getPublicSurveyBySlug", () => {
  it("returns a published survey by slug", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      title: "Public Survey",
    });
    const result = await getPublicSurveyBySlug(survey.slug!);
    expect(result.id).toBe(survey.id);
    expect(result.title).toBe("Public Survey");
    expect(result.status).toBe("PUBLISHED");
  });

  it("throws for a draft survey", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "DRAFT",
      title: "Draft Survey",
    });
    await expect(getPublicSurveyBySlug(survey.slug!)).rejects.toThrow(
      "Survey not found",
    );
  });

  it("throws for a nonexistent slug", async () => {
    await expect(getPublicSurveyBySlug("nonexistent-slug")).rejects.toThrow(
      "Survey not found",
    );
  });
});

describe("submitResponse", () => {
  it("submits a response with text answer to a published survey", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      isRequired: true,
    });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: "My answer" }],
      submitAnonymously: false,
    });

    expect(result.id).toBeDefined();
    expect(result.surveyId).toBe(survey.id);
    expect(result._count.answers).toBe(1);
  });

  it("submits a yes/no answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "YES_NO",
      isRequired: true,
    });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: "yes" }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("submits a number answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "NUMBER",
      isRequired: true,
      minValue: 1,
      maxValue: 100,
    });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: 42 }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("submits a rating answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "RATING",
      isRequired: true,
      minValue: 1,
      maxValue: 5,
    });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: 4 }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("submits a date answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "DATE",
      isRequired: true,
    });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: "2026-01-15" }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("submits a single choice answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
      isRequired: true,
    });
    const option = await createOption({ questionId: question.id, optionText: "Option A" });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: option.id }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("submits a multiple choice answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "MULTIPLE_CHOICE",
      isRequired: true,
    });
    const opt1 = await createOption({ questionId: question.id, optionText: "A", position: 1 });
    const opt2 = await createOption({ questionId: question.id, optionText: "B", position: 2 });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: [opt1.id, opt2.id] }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(2);
  });

  it("submits a dropdown answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "DROPDOWN",
      isRequired: true,
    });
    const option = await createOption({ questionId: question.id, optionText: "Choice" });

    const result = await submitResponse(survey.id, {
      answers: [{ questionId: question.id, value: option.id }],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(1);
  });

  it("throws for a draft survey", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "DRAFT",
    });
    await expect(
      submitResponse(survey.id, {
        answers: [],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("Survey not found");
  });

  it("throws for a nonexistent survey", async () => {
    await expect(
      submitResponse("00000000-0000-0000-0000-000000000000", {
        answers: [],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("Survey not found");
  });

  it("throws for missing required question answer", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      isRequired: true,
      questionText: "Your name",
    });

    await expect(
      submitResponse(survey.id, {
        answers: [],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("Your name is required");
  });

  it("allows skipping non-required questions", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      isRequired: false,
    });

    const result = await submitResponse(survey.id, {
      answers: [],
      submitAnonymously: false,
    });

    expect(result._count.answers).toBe(0);
  });

  it("throws for duplicate question answers", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      isRequired: false,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [
          { questionId: question.id, value: "a" },
          { questionId: question.id, value: "b" },
        ],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("Each question can only have one answer");
  });

  it("throws for invalid option in single choice", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
      isRequired: true,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: "invalid-option-id" }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must match one of the options");
  });

  it("throws for invalid option in multiple choice", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "MULTIPLE_CHOICE",
      isRequired: true,
    });
    const option = await createOption({ questionId: question.id });

    await expect(
      submitResponse(survey.id, {
        answers: [
          {
            questionId: question.id,
            value: [option.id, "invalid-option-id"],
          },
        ],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must match the available options");
  });

  it("throws for rating out of range", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "RATING",
      isRequired: true,
      minValue: 1,
      maxValue: 5,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: 10 }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be between");
  });

  it("throws for non-integer rating", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "RATING",
      isRequired: true,
      minValue: 1,
      maxValue: 5,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: 3.5 }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be between");
  });

  it("throws for invalid date", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "DATE",
      isRequired: true,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: "not-a-date" }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be a valid date");
  });

  it("throws for number out of min range", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "NUMBER",
      isRequired: true,
      minValue: 10,
      maxValue: 100,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: 5 }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be at least 10");
  });

  it("throws for number out of max range", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "NUMBER",
      isRequired: true,
      minValue: 1,
      maxValue: 10,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: 20 }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be at most 10");
  });

  it("throws for non-integer number", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "NUMBER",
      isRequired: true,
    });

    await expect(
      submitResponse(survey.id, {
        answers: [{ questionId: question.id, value: 3.14 }],
        submitAnonymously: false,
      }),
    ).rejects.toThrow("must be a whole number");
  });

  it("stores userId when user is authenticated and survey is not anonymous", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });

    const result = await submitResponse(
      survey.id,
      {
        answers: [],
        submitAnonymously: false,
      },
      user.id,
    );

    const response = await prisma.response.findUnique({
      where: { id: result.id },
      select: { userId: true },
    });
    expect(response?.userId).toBe(user.id);
  });

  it("stores null userId when submitAnonymously is true", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
      isAnonymous: true,
    });

    const result = await submitResponse(
      survey.id,
      {
        answers: [],
        submitAnonymously: true,
      },
      user.id,
    );

    const response = await prisma.response.findUnique({
      where: { id: result.id },
      select: { userId: true },
    });
    expect(response?.userId).toBeNull();
  });

  it("prevents duplicate submissions when allowMultipleResponses is false", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: false,
    });

    await submitResponse(
      survey.id,
      { answers: [], submitAnonymously: false },
      user.id,
    );

    await expect(
      submitResponse(
        survey.id,
        { answers: [], submitAnonymously: false },
        user.id,
      ),
    ).rejects.toThrow("already responded");
  });

  it("allows duplicate submissions when allowMultipleResponses is true", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });

    const r1 = await submitResponse(
      survey.id,
      { answers: [], submitAnonymously: false },
      undefined,
      "visitor-1",
    );
    const r2 = await submitResponse(
      survey.id,
      { answers: [], submitAnonymously: false },
      undefined,
      "visitor-2",
    );

    expect(r1.id).not.toBe(r2.id);
  });
});

describe("getSurveyResponses", () => {
  it("returns paginated responses for survey owner", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    for (let i = 0; i < 3; i++) {
      await submitResponse(
        survey.id,
        {
          answers: [{ questionId: question.id, value: `Answer ${i}` }],
          submitAnonymously: false,
        },
        undefined,
        `visitor-${i}`,
      );
    }

    const result = await getSurveyResponses(survey.id, user.id, {
      page: 1,
      limit: 2,
      order: "newest",
    });

    expect(result.responses.length).toBe(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  it("throws when non-owner requests responses", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const otherUser = await createUser({ email: "other@test.com" });

    await expect(
      getSurveyResponses(survey.id, otherUser.id, {
        page: 1,
        limit: 20,
        order: "newest",
      }),
    ).rejects.toThrow("Survey not found");
  });

  it("returns empty array for survey with no responses", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const result = await getSurveyResponses(survey.id, user.id, {
      page: 1,
      limit: 20,
      order: "newest",
    });

    expect(result.responses).toEqual([]);
    expect(result.total).toBe(0);
  });

  it("supports oldest order", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: "first" }], submitAnonymously: false },
      undefined,
      "v1",
    );
    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: "second" }], submitAnonymously: false },
      undefined,
      "v2",
    );

    const result = await getSurveyResponses(survey.id, user.id, {
      page: 1,
      limit: 10,
      order: "oldest",
    });

    expect(result.responses.length).toBe(2);
    expect(result.responses[0].answers[0].value).toBe("first");
  });
});

describe("getSurveyAnalytics", () => {
  it("returns analytics for a survey with responses", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });
    const textQ = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      questionText: "Name",
      position: 1,
    });
    const yesNoQ = await createQuestion({
      surveyId: survey.id,
      questionType: "YES_NO",
      questionText: "Like it?",
      position: 2,
    });
    const ratingQ = await createQuestion({
      surveyId: survey.id,
      questionType: "RATING",
      questionText: "Rate",
      position: 3,
      minValue: 1,
      maxValue: 5,
    });
    const numQ = await createQuestion({
      surveyId: survey.id,
      questionType: "NUMBER",
      questionText: "Age",
      position: 4,
    });
    const dateQ = await createQuestion({
      surveyId: survey.id,
      questionType: "DATE",
      questionText: "Birthday",
      position: 5,
    });

    await submitResponse(
      survey.id,
      {
        answers: [
          { questionId: textQ.id, value: "Alice" },
          { questionId: yesNoQ.id, value: "yes" },
          { questionId: ratingQ.id, value: 4 },
          { questionId: numQ.id, value: 25 },
          { questionId: dateQ.id, value: "2000-06-15" },
        ],
        submitAnonymously: false,
      },
      undefined,
      "v1",
    );
    await submitResponse(
      survey.id,
      {
        answers: [
          { questionId: textQ.id, value: "Bob" },
          { questionId: yesNoQ.id, value: "no" },
          { questionId: ratingQ.id, value: 2 },
          { questionId: numQ.id, value: 30 },
          { questionId: dateQ.id, value: "1995-03-20" },
        ],
        submitAnonymously: false,
      },
      undefined,
      "v2",
    );

    const analytics = await getSurveyAnalytics(survey.id, user.id);

    expect(analytics).toHaveLength(5);

    const textAnalytics = analytics.find((a) => a.type === "TEXT");
    expect(textAnalytics).toBeDefined();
    expect(textAnalytics!.total).toBe(2);

    const yesNoAnalytics = analytics.find((a) => a.type === "YES_NO");
    expect(yesNoAnalytics).toBeDefined();
    expect(yesNoAnalytics!.yes).toBe(1);
    expect(yesNoAnalytics!.no).toBe(1);

    const ratingAnalytics = analytics.find((a) => a.type === "RATING");
    expect(ratingAnalytics).toBeDefined();
    expect(ratingAnalytics!.average).toBe(3);

    const numAnalytics = analytics.find((a) => a.type === "NUMBER");
    expect(numAnalytics).toBeDefined();
    expect(numAnalytics!.min).toBe(25);
    expect(numAnalytics!.max).toBe(30);
    expect(numAnalytics!.average).toBe(27.5);

    const dateAnalytics = analytics.find((a) => a.type === "DATE");
    expect(dateAnalytics).toBeDefined();
    expect(dateAnalytics!.earliest).toBeDefined();
    expect(dateAnalytics!.latest).toBeDefined();
  });

  it("returns empty analytics for survey with no responses", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    const analytics = await getSurveyAnalytics(survey.id, user.id);
    expect(analytics).toHaveLength(1);
    expect(analytics[0].total).toBe(0);
  });

  it("throws when non-owner requests analytics", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const otherUser = await createUser({ email: "other@test.com" });

    await expect(getSurveyAnalytics(survey.id, otherUser.id)).rejects.toThrow(
      "Survey not found",
    );
  });

  it("handles choice analytics with multiple choice", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "MULTIPLE_CHOICE",
      position: 1,
    });
    const opt1 = await createOption({ questionId: question.id, optionText: "Red", position: 1 });
    const opt2 = await createOption({ questionId: question.id, optionText: "Blue", position: 2 });

    await submitResponse(
      survey.id,
      {
        answers: [{ questionId: question.id, value: [opt1.id] }],
        submitAnonymously: false,
      },
      undefined,
      "v1",
    );
    await submitResponse(
      survey.id,
      {
        answers: [{ questionId: question.id, value: [opt1.id, opt2.id] }],
        submitAnonymously: false,
      },
      undefined,
      "v2",
    );

    const analytics = await getSurveyAnalytics(survey.id, user.id);
    const choiceAnalytics = analytics.find((a) => a.type === "CHOICE");
    expect(choiceAnalytics).toBeDefined();
    expect(choiceAnalytics!.total).toBe(2);
    const redOpt = choiceAnalytics!.options.find((o) => o.optionId === opt1.id);
    const blueOpt = choiceAnalytics!.options.find((o) => o.optionId === opt2.id);
    expect(redOpt!.count).toBe(2);
    expect(blueOpt!.count).toBe(1);
  });
});
