import { describe, expect, it } from "vitest";
import {
  createSurveySchema,
  updateSurveySchema,
  surveyQuerySchema,
} from "../../validators/survey.validator.js";

describe("createSurveySchema", () => {
  it("parses valid input with all fields", () => {
    const result = createSurveySchema.parse({
      title: "My Survey",
      description: "A survey about things",
      slug: "my-survey",
      isAnonymous: true,
      allowMultipleResponses: false,
    });
    expect(result.title).toBe("My Survey");
    expect(result.slug).toBe("my-survey");
  });

  it("parses valid input with only required fields", () => {
    const result = createSurveySchema.parse({ title: "Survey" });
    expect(result.title).toBe("Survey");
    expect(result.description).toBeUndefined();
    expect(result.slug).toBeUndefined();
  });

  it("trims whitespace from title", () => {
    const result = createSurveySchema.parse({ title: "  Survey  " });
    expect(result.title).toBe("Survey");
  });

  it("rejects empty title", () => {
    expect(() => createSurveySchema.parse({ title: "" })).toThrow();
  });

  it("rejects title over 200 characters", () => {
    expect(() =>
      createSurveySchema.parse({ title: "X".repeat(201) }),
    ).toThrow();
  });

  it("rejects description over 2000 characters", () => {
    expect(() =>
      createSurveySchema.parse({
        title: "Survey",
        description: "X".repeat(2001),
      }),
    ).toThrow();
  });

  it("accepts valid slug format", () => {
    const result = createSurveySchema.parse({
      title: "Survey",
      slug: "my-survey-123",
    });
    expect(result.slug).toBe("my-survey-123");
  });

  it("rejects slug with uppercase letters", () => {
    expect(() =>
      createSurveySchema.parse({ title: "Survey", slug: "My-Survey" }),
    ).toThrow();
  });

  it("rejects slug with special characters", () => {
    expect(() =>
      createSurveySchema.parse({ title: "Survey", slug: "my_survey!" }),
    ).toThrow();
  });

  it("rejects slug over 100 characters", () => {
    expect(() =>
      createSurveySchema.parse({ title: "Survey", slug: "a".repeat(101) }),
    ).toThrow();
  });

  it("accepts boolean isAnonymous and allowMultipleResponses", () => {
    const result = createSurveySchema.parse({
      title: "Survey",
      isAnonymous: true,
      allowMultipleResponses: true,
    });
    expect(result.isAnonymous).toBe(true);
    expect(result.allowMultipleResponses).toBe(true);
  });
});

describe("updateSurveySchema", () => {
  it("parses valid partial update", () => {
    const result = updateSurveySchema.parse({ title: "Updated Title" });
    expect(result.title).toBe("Updated Title");
  });

  it("parses status update", () => {
    const result = updateSurveySchema.parse({ status: "PUBLISHED" });
    expect(result.status).toBe("PUBLISHED");
  });

  it("parses slug update", () => {
    const result = updateSurveySchema.parse({ slug: "new-slug" });
    expect(result.slug).toBe("new-slug");
  });

  it("rejects empty object", () => {
    expect(() => updateSurveySchema.parse({})).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() => updateSurveySchema.parse({ status: "INVALID" })).toThrow();
  });

  it("rejects slug with invalid format", () => {
    expect(() => updateSurveySchema.parse({ slug: "Bad_Slug" })).toThrow();
  });

  it("allows omission of optional fields", () => {
    const result = updateSurveySchema.parse({
      description: undefined,
    });
    expect(result.description).toBeUndefined();
  });
});

describe("surveyQuerySchema", () => {
  it("parses empty query with defaults", () => {
    const result = surveyQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.status).toBeUndefined();
    expect(result.search).toBeUndefined();
  });

  it("parses explicit page and limit", () => {
    const result = surveyQuerySchema.parse({ page: "3", limit: "20" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
  });

  it("parses status filter", () => {
    const result = surveyQuerySchema.parse({ status: "DRAFT" });
    expect(result.status).toBe("DRAFT");
  });

  it("parses search query", () => {
    const result = surveyQuerySchema.parse({ search: "feedback" });
    expect(result.search).toBe("feedback");
  });

  it("rejects page below 1", () => {
    expect(() => surveyQuerySchema.parse({ page: 0 })).toThrow();
  });

  it("rejects limit above 50", () => {
    expect(() => surveyQuerySchema.parse({ limit: 51 })).toThrow();
  });

  it("rejects invalid status", () => {
    expect(() => surveyQuerySchema.parse({ status: "ARCHIVED" })).toThrow();
  });

  it("rejects search over 100 characters", () => {
    expect(() =>
      surveyQuerySchema.parse({ search: "x".repeat(101) }),
    ).toThrow();
  });
});
