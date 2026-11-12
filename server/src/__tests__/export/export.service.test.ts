import { describe, it, expect, beforeEach } from "vitest";
import { createUser, createSurvey, createQuestion, createOption, TestUser } from "../helpers.js";
import { submitResponse } from "../../services/response.service.js";
import { generateSurveyCsv } from "../../services/export.service.js";

let user: TestUser;

beforeEach(async () => {
  user = await createUser({ email: "exporter@test.com" });
});

describe("generateSurveyCsv", () => {
  it("generates a CSV with headers and a data row", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      questionText: "Your name",
      position: 1,
    });

    await submitResponse(
      survey.id,
      {
        answers: [{ questionId: question.id, value: "Alice" }],
        submitAnonymously: false,
      },
      user.id,
    );

    const { filename, csv } = await generateSurveyCsv(survey.id, user.id);

    expect(filename).toContain("survey-");
    expect(filename).toMatch(/\.csv$/);
    expect(csv).toContain("Response ID");
    expect(csv).toContain("Submitted At");
    expect(csv).toContain("Respondent Type");
    expect(csv).toContain("Your name");
    expect(csv).toContain("Alice");
  });

  it("generates CSV with multiple responses", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      position: 1,
    });

    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: "Alice" }], submitAnonymously: false },
      undefined,
      "v1",
    );
    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: "Bob" }], submitAnonymously: false },
      undefined,
      "v2",
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("Alice");
    expect(csv).toContain("Bob");
  });

  it("handles choice questions with option text", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
      position: 1,
    });
    const option = await createOption({ questionId: question.id, optionText: "Red" });

    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: option.id }], submitAnonymously: false },
      user.id,
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("Red");
  });

  it("handles multiple choice with semicolon separator", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
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
      { answers: [{ questionId: question.id, value: [opt1.id, opt2.id] }], submitAnonymously: false },
      user.id,
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    const dataLine = csv.trim().split("\r\n").slice(-1)[0];
    expect(dataLine).toContain("Red");
    expect(dataLine).toContain("Blue");
  });

  it("marks anonymous responses correctly", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });

    await submitResponse(
      survey.id,
      { answers: [], submitAnonymously: true },
      undefined,
      "anon-visitor",
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("Anonymous");
  });

  it("marks authenticated responses correctly", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });

    await submitResponse(
      survey.id,
      { answers: [], submitAnonymously: false },
      user.id,
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("Authenticated");
  });

  it("throws for non-owner", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const otherUser = await createUser({ email: "other@test.com" });

    await expect(generateSurveyCsv(survey.id, otherUser.id)).rejects.toThrow(
      "Survey not found",
    );
  });

  it("generates CSV with empty responses (headers only)", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      questionText: "Empty field",
      position: 1,
    });

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("Empty field");
    const lines = csv.trim().split("\r\n");
    expect(lines.length).toBe(1);
  });

  it("neutralizes CSV formula injection", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      position: 1,
    });

    await submitResponse(
      survey.id,
      { answers: [{ questionId: question.id, value: '=CMD("calc")' }], submitAnonymously: false },
      user.id,
    );

    const { csv } = await generateSurveyCsv(survey.id, user.id);
    expect(csv).toContain("'=CMD");
    const dataLine = csv.trim().split("\r\n")[1];
    expect(dataLine).not.toMatch(/^[=+\-@]/);
  });
});
