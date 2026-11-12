import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import {
  createUser,
  createSurvey,
  createQuestion,
  authHeaders,
  TestUser,
} from "../helpers.js";
import { submitResponse } from "../../services/response.service.js";

let user: TestUser;

beforeEach(async () => {
  user = await createUser({ email: "exporter@test.com" });
});

describe("GET /api/surveys/:id/export", () => {
  it("returns CSV for survey owner", async () => {
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
      { answers: [{ questionId: question.id, value: "Test" }], submitAnonymously: false },
      user.id,
    );

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/export`)
      .set(authHeaders(user));

    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toContain("text/csv");
    expect(res.headers["content-disposition"]).toContain("attachment");
    expect(res.text).toContain("Test");
  });

  it("returns 401 without authentication", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const res = await request(app).get(`/api/surveys/${survey.id}/export`);
    expect(res.status).toBe(401);
  });

  it("returns 404 for non-owner", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const otherUser = await createUser({ email: "other@test.com" });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/export`)
      .set(authHeaders(otherUser));

    expect(res.status).toBe(404);
  });

  it("returns 400 for unsupported format", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/export?format=json`)
      .set(authHeaders(user));

    expect(res.status).toBe(400);
  });

  it("defaults to csv format when format param is omitted", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/export`)
      .set(authHeaders(user));

    expect(res.status).toBe(200);
  });
});
