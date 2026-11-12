import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, authHeaders, authHeadersWithCsrf, TestUser } from "../helpers.js";

let user: TestUser;

beforeEach(async () => {
  user = await createUser({ email: "me@test.com", name: "Me User" });
});

describe("GET /api/users/me", () => {
  it("returns current user data", async () => {
    const res = await request(app)
      .get("/api/users/me")
      .set(authHeaders(user));

    expect(res.status).toBe(200);
    expect(res.body.data.user.id).toBe(user.id);
    expect(res.body.data.user.name).toBe("Me User");
    expect(res.body.data.user.email).toBe("me@test.com");
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/users/dashboard", () => {
  it("returns dashboard data", async () => {
    const res = await request(app)
      .get("/api/users/dashboard")
      .set(authHeaders(user));

    expect(res.status).toBe(200);
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.recentSurveys).toBeDefined();
    expect(res.body.data.recentResponses).toBeDefined();
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app).get("/api/users/dashboard");
    expect(res.status).toBe(401);
  });
});

describe("PATCH /api/users/profile", () => {
  it("updates profile with valid CSRF", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .patch("/api/users/profile")
      .set(headers)
      .send({ name: "Updated Name" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.name).toBe("Updated Name");
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app)
      .patch("/api/users/profile")
      .send({ name: "Updated" });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid name", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .patch("/api/users/profile")
      .set(headers)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/users/password", () => {
  it("changes password with valid CSRF", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .post("/api/users/password")
      .set(headers)
      .send({
        currentPassword: "Password@123",
        newPassword: "NewPassword@123",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Password changed");
  });

  it("returns 401 without authentication", async () => {
    const res = await request(app)
      .post("/api/users/password")
      .send({
        currentPassword: "Password@123",
        newPassword: "NewPassword@123",
      });
    expect(res.status).toBe(401);
  });

  it("returns 400 for wrong current password", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .post("/api/users/password")
      .set(headers)
      .send({
        currentPassword: "WrongPassword@1",
        newPassword: "NewPassword@123",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 for weak new password", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .post("/api/users/password")
      .set(headers)
      .send({
        currentPassword: "Password@123",
        newPassword: "weak",
      });

    expect(res.status).toBe(400);
  });

  it("returns 400 when new password same as current", async () => {
    const headers = authHeadersWithCsrf(user);
    const res = await request(app)
      .post("/api/users/password")
      .set(headers)
      .send({
        currentPassword: "Password@123",
        newPassword: "Password@123",
      });

    expect(res.status).toBe(400);
  });
});
