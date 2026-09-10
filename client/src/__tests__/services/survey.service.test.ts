import { beforeEach, describe, expect, it } from "vitest";
import {
  batchCreateQuestions,
  createQuestion,
  createSurvey,
  deleteQuestion,
  deleteSurvey,
  duplicateSurvey,
  exportResponsesCsv,
  getSurvey,
  getSurveyAnalytics,
  getSurveyBySlug,
  getSurveys,
  getSurveyResponses,
  reorderQuestions,
  submitResponse,
  updateQuestion,
  updateSurvey,
} from "@/services/survey.service";
import { setStoredCsrfToken } from "@/api/csrf";

beforeEach(() => {
  setStoredCsrfToken("mock-csrf-token");
});

describe("survey.service", () => {
  it("getSurveys returns a paginated list", async () => {
    const result = await getSurveys({ page: 1, limit: 10 });
    expect(result.surveys.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.page).toBe(1);
  });

  it("getSurveys filters by status", async () => {
    const result = await getSurveys({ status: "PUBLISHED" });
    expect(result.surveys.every((s) => s.status === "PUBLISHED")).toBe(true);
  });

  it("getSurveys filters by search", async () => {
    const result = await getSurveys({ search: "published" });
    expect(result.surveys.length).toBe(1);
    expect(result.surveys[0].title).toContain("Published");
  });

  it("createSurvey creates a survey", async () => {
    const survey = await createSurvey({ title: "Brand New Survey" });
    expect(survey.title).toBe("Brand New Survey");
    expect(survey.id).toBeDefined();
  });

  it("getSurvey returns a survey by id", async () => {
    const survey = await getSurvey("survey-1");
    expect(survey.id).toBe("survey-1");
    expect(survey.title).toBe("My Published Survey");
    expect(survey.questions?.length).toBeGreaterThan(0);
  });

  it("getSurveyBySlug returns a public survey", async () => {
    const survey = await getSurveyBySlug("my-published-survey");
    expect(survey.slug).toBe("my-published-survey");
    expect(survey.status).toBe("PUBLISHED");
  });

  it("updateSurvey updates a survey", async () => {
    const survey = await updateSurvey("survey-1", { title: "Updated Title" });
    expect(survey.title).toBe("Updated Title");
  });

  it("deleteSurvey resolves without error", async () => {
    await expect(deleteSurvey("survey-2")).resolves.toBeUndefined();
  });

  it("duplicateSurvey returns a copied survey", async () => {
    const survey = await duplicateSurvey("survey-1");
    expect(survey.title).toContain("Copy");
  });

  it("submitResponse records a response", async () => {
    const response = await submitResponse("survey-1", {
      answers: [{ questionId: "q-1", value: "Alice" }],
    });
    expect(response.id).toBeDefined();
  });

  it("getSurveyResponses returns responses", async () => {
    const result = await getSurveyResponses("survey-1", { page: 1, limit: 10 });
    expect(result.responses.length).toBe(1);
    expect(result.total).toBe(1);
  });

  it("getSurveyAnalytics returns analytics", async () => {
    const analytics = await getSurveyAnalytics("survey-1");
    expect(analytics.length).toBeGreaterThan(0);
    expect(analytics[0].type).toBeDefined();
  });

  it("exportResponsesCsv returns a CSV blob", async () => {
    const blob = await exportResponsesCsv("survey-1");
    expect(blob).toBeInstanceOf(Blob);
  });

  it("createQuestion creates a question", async () => {
    const question = await createQuestion("survey-1", {
      questionText: "New question",
      questionType: "SHORT_TEXT",
    });
    expect(question.questionText).toBe("New question");
  });

  it("batchCreateQuestions creates multiple questions", async () => {
    const questions = await batchCreateQuestions("survey-1", [
      { questionText: "Q1", questionType: "SHORT_TEXT" },
      { questionText: "Q2", questionType: "LONG_TEXT" },
    ]);
    expect(questions.length).toBe(2);
  });

  it("updateQuestion updates a question", async () => {
    const question = await updateQuestion("survey-1", "q-1", {
      questionText: "Renamed question",
    });
    expect(question.questionText).toBe("Renamed question");
  });

  it("deleteQuestion resolves without error", async () => {
    await expect(deleteQuestion("survey-1", "q-3")).resolves.toBeUndefined();
  });

  it("reorderQuestions resolves without error", async () => {
    await expect(reorderQuestions("survey-1", ["q-3", "q-2", "q-1"])).resolves.toBeUndefined();
  });
});