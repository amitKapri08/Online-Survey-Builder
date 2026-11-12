import { describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import {
  createSurvey,
  getSurveys,
  getSurveyById,
  getSurveyBySlug,
  recordSurveyView,
  updateSurvey,
  deleteSurvey,
  duplicateSurvey,
} from "../../services/survey.service.js";
import { prisma } from "../../config/prisma.js";
import { createUser, createSurvey as createSurveyHelper, createQuestion, createOption } from "../helpers.js";
import { AppError } from "../../utils/AppError.js";

describe("createSurvey", () => {
  it("creates a survey with auto-generated slug", async () => {
    const user = await createUser();
    const result = await createSurvey(user.id, {
      title: "My Survey",
    });

    expect(result.title).toBe("My Survey");
    expect(result.slug).toBeDefined();
    expect(result.status).toBe("DRAFT");
    expect(result._count.questions).toBe(0);
    expect(result._count.responses).toBe(0);
  });

  it("creates a survey with custom slug", async () => {
    const user = await createUser();
    const result = await createSurvey(user.id, {
      title: "Custom Slug Survey",
      slug: "my-custom-slug",
    });

    expect(result.slug).toBe("my-custom-slug");
  });

  it("throws 409 for duplicate slug", async () => {
    const user = await createUser();
    await createSurvey(user.id, { title: "First", slug: "taken-slug" });

    await expect(
      createSurvey(user.id, { title: "Second", slug: "taken-slug" }),
    ).rejects.toThrow(AppError);

    try {
      await createSurvey(user.id, { title: "Second", slug: "taken-slug" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(409);
    }
  });

  it("sets description and boolean fields", async () => {
    const user = await createUser();
    const result = await createSurvey(user.id, {
      title: "With Options",
      description: "A description",
      isAnonymous: true,
      allowMultipleResponses: true,
    });

    expect(result.description).toBe("A description");
    expect(result.isAnonymous).toBe(true);
    expect(result.allowMultipleResponses).toBe(true);
  });
});

describe("getSurveys", () => {
  it("returns paginated surveys for a user", async () => {
    const user = await createUser();
    for (let i = 0; i < 5; i++) {
      await createSurveyHelper({ userId: user.id });
    }

    const result = await getSurveys(user.id, { page: 1, limit: 3 });
    expect(result.surveys).toHaveLength(3);
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(2);
  });

  it("filters by status", async () => {
    const user = await createUser();
    await createSurveyHelper({ userId: user.id, status: "DRAFT" });
    await createSurveyHelper({ userId: user.id, status: "PUBLISHED", publishedAt: new Date() });
    await createSurveyHelper({ userId: user.id, status: "CLOSED" });

    const result = await getSurveys(user.id, {
      page: 1,
      limit: 10,
      status: "DRAFT",
    });
    expect(result.surveys).toHaveLength(1);
    expect(result.surveys[0].status).toBe("DRAFT");
  });

  it("searches by title", async () => {
    const user = await createUser();
    await createSurveyHelper({ userId: user.id, title: "Customer Feedback" });
    await createSurveyHelper({ userId: user.id, title: "Employee Survey" });

    const result = await getSurveys(user.id, {
      page: 1,
      limit: 10,
      search: "Feedback",
    });
    expect(result.surveys).toHaveLength(1);
    expect(result.surveys[0].title).toBe("Customer Feedback");
  });

  it("does not return surveys from other users", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    await createSurveyHelper({ userId: user1.id });
    await createSurveyHelper({ userId: user2.id });

    const result = await getSurveys(user1.id, { page: 1, limit: 10 });
    expect(result.total).toBe(1);
  });

  it("orders by updatedAt descending", async () => {
    const user = await createUser();
    const s1 = await createSurveyHelper({ userId: user.id, title: "First" });
    const s2 = await createSurveyHelper({ userId: user.id, title: "Second" });

    const result = await getSurveys(user.id, { page: 1, limit: 10 });
    expect(result.surveys[0].title).toBe("Second");
    expect(result.surveys[1].title).toBe("First");
  });
});

describe("getSurveyById", () => {
  it("returns survey with questions for owner", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id });

    const result = await getSurveyById(survey.id, user.id);
    expect(result.id).toBe(survey.id);
    expect(result.questions).toBeDefined();
  });

  it("throws 404 for non-existent survey", async () => {
    await expect(
      getSurveyById("00000000-0000-0000-0000-000000000000", "user-1"),
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when userId does not match owner", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurveyHelper({ userId: user1.id });

    await expect(getSurveyById(survey.id, user2.id)).rejects.toThrow(AppError);
  });

  it("returns survey without userId check when userId is omitted", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id });

    const result = await getSurveyById(survey.id);
    expect(result.id).toBe(survey.id);
  });
});

describe("getSurveyBySlug", () => {
  it("returns published survey by slug", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const result = await getSurveyBySlug(survey.slug);
    expect(result.id).toBe(survey.id);
    expect(result.status).toBe("PUBLISHED");
  });

  it("throws 404 for non-existent slug", async () => {
    await expect(getSurveyBySlug("non-existent-slug")).rejects.toThrow(AppError);
  });

  it("throws 404 for draft survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id, status: "DRAFT" });

    await expect(getSurveyBySlug(survey.slug)).rejects.toThrow(AppError);
  });
});

describe("recordSurveyView", () => {
  it("increments viewCount for a published survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await recordSurveyView(survey.id, "visitor-1");

    const updated = await prisma.survey.findUnique({ where: { id: survey.id } });
    expect(updated!.viewCount).toBe(1);
  });

  it("ignores duplicate views from same visitor", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await recordSurveyView(survey.id, "visitor-1");
    await recordSurveyView(survey.id, "visitor-1");

    const updated = await prisma.survey.findUnique({ where: { id: survey.id } });
    expect(updated!.viewCount).toBe(1);
  });

  it("counts different visitors separately", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await recordSurveyView(survey.id, "visitor-1");
    await recordSurveyView(survey.id, "visitor-2");

    const updated = await prisma.survey.findUnique({ where: { id: survey.id } });
    expect(updated!.viewCount).toBe(2);
  });

  it("throws 404 for non-published survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id, status: "DRAFT" });

    await expect(recordSurveyView(survey.id, "visitor-1")).rejects.toThrow(AppError);
  });
});

describe("updateSurvey", () => {
  it("updates title of a draft survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id, status: "DRAFT" });

    const result = await updateSurvey(survey.id, user.id, {
      title: "Updated Title",
    });
    expect(result.title).toBe("Updated Title");
  });

  it("transitions DRAFT to PUBLISHED and sets publishedAt", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id, status: "DRAFT" });

    const result = await updateSurvey(survey.id, user.id, {
      status: "PUBLISHED",
    });
    expect(result.status).toBe("PUBLISHED");
    expect(result.publishedAt).not.toBeNull();
  });

  it("transitions PUBLISHED to CLOSED", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const result = await updateSurvey(survey.id, user.id, {
      status: "CLOSED",
    });
    expect(result.status).toBe("CLOSED");
  });

  it("rejects invalid status transition DRAFT -> CLOSED", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id, status: "DRAFT" });

    await expect(
      updateSurvey(survey.id, user.id, { status: "CLOSED" }),
    ).rejects.toThrow(AppError);

    try {
      await updateSurvey(survey.id, user.id, { status: "CLOSED" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(400);
      expect((error as AppError).code).toBe("INVALID_STATUS_TRANSITION");
    }
  });

  it("rejects editing fields on non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    await expect(
      updateSurvey(survey.id, user.id, { title: "New Title" }),
    ).rejects.toThrow(AppError);

    try {
      await updateSurvey(survey.id, user.id, { title: "New Title" });
    } catch (error) {
      expect((error as AppError).code).toBe("SURVEY_LOCKED");
    }
  });

  it("allows status change on non-draft survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const result = await updateSurvey(survey.id, user.id, {
      status: "CLOSED",
    });
    expect(result.status).toBe("CLOSED");
  });

  it("throws 404 for non-existent survey", async () => {
    await expect(
      updateSurvey("00000000-0000-0000-0000-000000000000", "user-1", {
        title: "New",
      }),
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when user does not own survey", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurveyHelper({ userId: user1.id });

    await expect(
      updateSurvey(survey.id, user2.id, { title: "Hacked" }),
    ).rejects.toThrow(AppError);
  });

  it("rejects duplicate slug", async () => {
    const user = await createUser();
    const survey1 = await createSurvey(user.id, { title: "First", slug: "slug-one" });
    const survey2 = await createSurvey(user.id, { title: "Second", slug: "slug-two" });

    await expect(
      updateSurvey(survey2.id, user.id, { slug: "slug-one" }),
    ).rejects.toThrow(AppError);
  });
});

describe("deleteSurvey", () => {
  it("hard-deletes a survey", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id });

    await deleteSurvey(survey.id, user.id);

    const found = await prisma.survey.findUnique({ where: { id: survey.id } });
    expect(found).toBeNull();
  });

  it("throws 404 for non-existent survey", async () => {
    await expect(
      deleteSurvey("00000000-0000-0000-0000-000000000000", "user-1"),
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when user does not own survey", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurveyHelper({ userId: user1.id });

    await expect(deleteSurvey(survey.id, user2.id)).rejects.toThrow(AppError);
  });
});

describe("duplicateSurvey", () => {
  it("creates a copy with (Copy) suffix", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      title: "Original Survey",
    });

    const result = await duplicateSurvey(survey.id, user.id);
    expect(result.title).toBe("Original Survey (Copy)");
    expect(result.id).not.toBe(survey.id);
  });

  it("copies questions and options", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({ userId: user.id });
    const question = await createQuestion({
      surveyId: survey.id,
      questionText: "Pick one",
      questionType: "SINGLE_CHOICE",
    });
    await createOption({ questionId: question.id, optionText: "Option A" });
    await createOption({ questionId: question.id, optionText: "Option B" });

    const result = await duplicateSurvey(survey.id, user.id);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options).toHaveLength(2);
  });

  it("increments suffix for multiple copies", async () => {
    const user = await createUser();
    const survey = await createSurveyHelper({
      userId: user.id,
      title: "Survey",
    });

    const copy1 = await duplicateSurvey(survey.id, user.id);
    expect(copy1.title).toBe("Survey (Copy)");

    const copy2 = await duplicateSurvey(survey.id, user.id);
    expect(copy2.title).toBe("Survey (Copy 2)");
  });

  it("throws 404 for non-existent survey", async () => {
    await expect(
      duplicateSurvey("00000000-0000-0000-0000-000000000000", "user-1"),
    ).rejects.toThrow(AppError);
  });

  it("throws 404 when user does not own survey", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurveyHelper({ userId: user1.id });

    await expect(duplicateSurvey(survey.id, user2.id)).rejects.toThrow(AppError);
  });
});
