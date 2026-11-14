import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import {
  createUser,
  createSurvey,
  createQuestion,
  createOption,
  generateCsrfToken,
} from "../helpers.js";
import { signToken } from "../../utils/jwt.js";
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from "../../utils/cookies.js";
import { prisma } from "../../config/prisma.js";

function csrfHeaders(user: { id: string; role: string }) {
  const token = signToken({ userId: user.id, role: user.role as "USER" | "ADMIN" });
  const csrfToken = generateCsrfToken();
  return {
    Cookie: `${AUTH_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    "X-CSRF-Token": csrfToken,
  };
}

describe("POST /api/surveys/:surveyId/questions", () => {
  it("creates a question and returns 201", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/questions`)
      .set(headers)
      .send({
        questionText: "What is your name?",
        questionType: "SHORT_TEXT",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.question.questionText).toBe("What is your name?");
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app)
      .post("/api/surveys/some-id/questions")
      .send({ questionText: "Q", questionType: "SHORT_TEXT" });

    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid input", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/questions`)
      .set(headers)
      .send({ questionText: "", questionType: "SHORT_TEXT" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/surveys/:surveyId/questions/batch", () => {
  it("creates multiple questions and returns 201", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/questions/batch`)
      .set(headers)
      .send({
        questions: [
          { questionText: "Q1", questionType: "SHORT_TEXT" },
          { questionText: "Q2", questionType: "YES_NO" },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.questions).toHaveLength(2);
  });
});

describe("PATCH /api/surveys/:surveyId/questions/:questionId", () => {
  it("updates a question and returns 200", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const question = await createQuestion({ surveyId: survey.id });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/${question.id}`)
      .set(headers)
      .send({ questionText: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.question.questionText).toBe("Updated");
  });
});

describe("DELETE /api/surveys/:surveyId/questions/:questionId", () => {
  it("deletes a question and returns 200", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const question = await createQuestion({ surveyId: survey.id });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .delete(`/api/surveys/${survey.id}/questions/${question.id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("PATCH /api/surveys/:surveyId/questions/reorder", () => {
  it("reorders questions and returns 200", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const q1 = await createQuestion({ surveyId: survey.id, position: 1 });
    const q2 = await createQuestion({ surveyId: survey.id, position: 2 });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/reorder`)
      .set(headers)
      .send({ questionIds: [q2.id, q1.id] });

    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/surveys/:surveyId/questions/required-all", () => {
  it("marks every question required and can clear all", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    await createQuestion({ surveyId: survey.id, position: 1 });
    await createQuestion({ surveyId: survey.id, position: 2 });
    const headers = csrfHeaders(user);

    const markRes = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/required-all`)
      .set(headers)
      .send({ isRequired: true });

    expect(markRes.status).toBe(200);
    expect(markRes.body.data.updatedCount).toBe(2);
    expect(
      await prisma.question.count({
        where: { surveyId: survey.id, isRequired: true },
      }),
    ).toBe(2);

    const clearRes = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/required-all`)
      .set(headers)
      .send({ isRequired: false });

    expect(clearRes.status).toBe(200);
    expect(clearRes.body.data.updatedCount).toBe(2);
    expect(
      await prisma.question.count({
        where: { surveyId: survey.id, isRequired: true },
      }),
    ).toBe(0);
  });

  it("rejects non-draft surveys", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/required-all`)
      .set(headers)
      .send({ isRequired: true });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("SURVEY_LOCKED");
  });

  it("returns 400 for an invalid payload", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}/questions/required-all`)
      .set(headers)
      .send({ isRequired: "yes" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/surveys/:surveyId/questions/:questionId/options", () => {
  it("creates an option and returns 201", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/questions/${question.id}/options`)
      .set(headers)
      .send({ optionText: "New Option" });

    expect(res.status).toBe(201);
    expect(res.body.data.option.optionText).toBe("New Option");
  });
});

describe("PATCH /api/surveys/:surveyId/questions/:questionId/options/:optionId", () => {
  it("updates an option and returns 200", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    const option = await createOption({ questionId: question.id, optionText: "Old" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(
        `/api/surveys/${survey.id}/questions/${question.id}/options/${option.id}`,
      )
      .set(headers)
      .send({ optionText: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.data.option.optionText).toBe("Updated");
  });
});

describe("DELETE /api/surveys/:surveyId/questions/:questionId/options/:optionId", () => {
  it("deletes an option and returns 200", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SINGLE_CHOICE",
    });
    const option = await createOption({ questionId: question.id });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .delete(
        `/api/surveys/${survey.id}/questions/${question.id}/options/${option.id}`,
      )
      .set(headers);

    expect(res.status).toBe(200);
  });
});
