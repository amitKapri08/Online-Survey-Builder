import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import {
  createUser,
  createSurvey,
  createQuestion,
  authHeaders,
  generateCsrfToken,
  TestUser,
} from "../helpers.js";

let user: TestUser;
let survey: Awaited<ReturnType<typeof createSurvey>>;

beforeEach(async () => {
  user = await createUser({ email: "owner@test.com" });
  survey = await createSurvey({
    userId: user.id,
    status: "PUBLISHED",
    publishedAt: new Date(),
    allowMultipleResponses: true,
  });
});

function csrfHeaders() {
  const csrfToken = generateCsrfToken();
  return {
    "X-CSRF-Token": csrfToken,
    Cookie: `csrf-token=${csrfToken}`,
  };
}

describe("POST /api/surveys/:id/responses", () => {
  it("records a response to a published survey", async () => {
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
      isRequired: true,
    });

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/responses`)
      .set(csrfHeaders())
      .send({
        answers: [{ questionId: question.id, value: "Hello" }],
        submitAnonymously: false,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.response.id).toBeDefined();
  });

  it("returns 404 for a draft survey", async () => {
    const draft = await createSurvey({ userId: user.id, status: "DRAFT" });

    const res = await request(app)
      .post(`/api/surveys/${draft.id}/responses`)
      .set(csrfHeaders())
      .send({ answers: [], submitAnonymously: false });

    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid answers", async () => {
    const res = await request(app)
      .post(`/api/surveys/${survey.id}/responses`)
      .set(csrfHeaders())
      .send({
        answers: [{ questionId: "not-a-uuid", value: "test" }],
        submitAnonymously: false,
      });

    expect(res.status).toBe(400);
  });

  it("returns 409 for duplicate submission when disallowed", async () => {
    const singleSurvey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: false,
    });

    const agent = request.agent(app);

    const first = await agent
      .post(`/api/surveys/${singleSurvey.id}/responses`)
      .set(csrfHeaders())
      .send({ answers: [], submitAnonymously: false });
    expect(first.status).toBe(201);

    const second = await agent
      .post(`/api/surveys/${singleSurvey.id}/responses`)
      .set(csrfHeaders())
      .send({ answers: [], submitAnonymously: false });

    expect(second.status).toBe(409);
  });
});

describe("GET /api/surveys/:id/responses", () => {
  it("returns paginated responses for survey owner", async () => {
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    for (let i = 0; i < 3; i++) {
      await request(app)
        .post(`/api/surveys/${survey.id}/responses`)
        .set(csrfHeaders())
        .send({
          answers: [{ questionId: question.id, value: `Answer ${i}` }],
          submitAnonymously: false,
        });
    }

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/responses?page=1&limit=2`)
      .set(authHeaders(user));

    expect(res.status).toBe(200);
    expect(res.body.data.responses.length).toBe(2);
    expect(res.body.data.total).toBe(3);
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app).get(`/api/surveys/${survey.id}/responses`);
    expect(res.status).toBe(401);
  });

  it("returns 404 for non-owner", async () => {
    const otherUser = await createUser({ email: "other@test.com" });
    const res = await request(app)
      .get(`/api/surveys/${survey.id}/responses`)
      .set(authHeaders(otherUser));
    expect(res.status).toBe(404);
  });
});

describe("GET /api/surveys/:id/analytics", () => {
  it("returns analytics for survey owner", async () => {
    const question = await createQuestion({
      surveyId: survey.id,
      questionType: "SHORT_TEXT",
    });

    await request(app)
      .post(`/api/surveys/${survey.id}/responses`)
      .set(csrfHeaders())
      .send({
        answers: [{ questionId: question.id, value: "Test" }],
        submitAnonymously: false,
      });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}/analytics`)
      .set(authHeaders(user));

    expect(res.status).toBe(200);
    expect(res.body.data.analytics).toBeDefined();
    expect(Array.isArray(res.body.data.analytics)).toBe(true);
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app).get(`/api/surveys/${survey.id}/analytics`);
    expect(res.status).toBe(401);
  });

  it("returns 404 for non-owner", async () => {
    const otherUser = await createUser({ email: "other@test.com" });
    const res = await request(app)
      .get(`/api/surveys/${survey.id}/analytics`)
      .set(authHeaders(otherUser));
    expect(res.status).toBe(404);
  });
});