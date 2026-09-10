import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import {
  createUser,
  createSurvey,
  createQuestion,
  generateCsrfToken,
} from "../helpers.js";
import { signToken } from "../../utils/jwt.js";
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from "../../utils/cookies.js";
import { prisma } from "../../config/prisma.js";

function authCookie(user: { id: string; role: string }) {
  return signToken({ userId: user.id, role: user.role as "USER" | "ADMIN" });
}

function csrfHeaders(user: { id: string; role: string }) {
  const token = authCookie(user);
  const csrfToken = generateCsrfToken();
  return {
    Cookie: `${AUTH_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    "X-CSRF-Token": csrfToken,
  };
}

describe("GET /api/surveys", () => {
  it("returns paginated surveys for authenticated user", async () => {
    const user = await createUser();
    await createSurvey({ userId: user.id, title: "Survey 1" });
    await createSurvey({ userId: user.id, title: "Survey 2" });

    const res = await request(app)
      .get("/api/surveys")
      .set("Cookie", `token=${authCookie(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.surveys).toHaveLength(2);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/surveys");
    expect(res.status).toBe(401);
  });
});

describe("POST /api/surveys", () => {
  it("creates a survey and returns 201", async () => {
    const user = await createUser();
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post("/api/surveys")
      .set(headers)
      .send({ title: "New Survey" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.survey.title).toBe("New Survey");
  });

  it("returns 400 for invalid input", async () => {
    const user = await createUser();
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post("/api/surveys")
      .set(headers)
      .send({ title: "" });

    expect(res.status).toBe(400);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app)
      .post("/api/surveys")
      .send({ title: "Unauth Survey" });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/surveys/:id", () => {
  it("returns survey by ID for owner", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}`)
      .set("Cookie", `token=${authCookie(user)}`);

    expect(res.status).toBe(200);
    expect(res.body.data.survey.id).toBe(survey.id);
  });

  it("returns 404 for non-owner", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurvey({ userId: user1.id });

    const res = await request(app)
      .get(`/api/surveys/${survey.id}`)
      .set("Cookie", `token=${authCookie(user2)}`);

    expect(res.status).toBe(404);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/surveys/some-id");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/surveys/slug/:slug", () => {
  it("returns published survey by slug without auth", async () => {
    const user = await createUser();
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    const res = await request(app).get(`/api/surveys/slug/${survey.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.survey.id).toBe(survey.id);
  });

  it("returns 404 for draft survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });

    const res = await request(app).get(`/api/surveys/slug/${survey.slug}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/surveys/:id", () => {
  it("updates survey title", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}`)
      .set(headers)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.survey.title).toBe("Updated Title");
  });

  it("returns 404 for non-owner", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurvey({ userId: user1.id, status: "DRAFT" });
    const headers = csrfHeaders(user2);

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}`)
      .set(headers)
      .send({ title: "Hacked" });

    expect(res.status).toBe(404);
  });

  it("returns 403 without CSRF token", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, status: "DRAFT" });

    const res = await request(app)
      .patch(`/api/surveys/${survey.id}`)
      .set("Cookie", `token=${authCookie(user)}`)
      .send({ title: "No CSRF" });

    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/surveys/:id", () => {
  it("deletes a survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .delete(`/api/surveys/${survey.id}`)
      .set(headers);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = await prisma.survey.findUnique({ where: { id: survey.id } });
    expect(found).toBeNull();
  });

  it("returns 404 for non-owner", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurvey({ userId: user1.id });
    const headers = csrfHeaders(user2);

    const res = await request(app)
      .delete(`/api/surveys/${survey.id}`)
      .set(headers);

    expect(res.status).toBe(404);
  });
});

describe("POST /api/surveys/:id/duplicate", () => {
  it("duplicates a survey", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, title: "Original" });
    const headers = csrfHeaders(user);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/duplicate`)
      .set(headers);

    expect(res.status).toBe(201);
    expect(res.body.data.survey.title).toBe("Original (Copy)");
    expect(res.body.data.survey.id).not.toBe(survey.id);
  });

  it("returns 404 for non-owner", async () => {
    const user1 = await createUser();
    const user2 = await createUser();
    const survey = await createSurvey({ userId: user1.id });
    const headers = csrfHeaders(user2);

    const res = await request(app)
      .post(`/api/surveys/${survey.id}/duplicate`)
      .set(headers);

    expect(res.status).toBe(404);
  });
});
