import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { createUser, authHeadersWithCsrf, generateCsrfToken } from "../helpers.js";
import { prisma } from "../../config/prisma.js";
import { signToken } from "../../utils/jwt.js";
import { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME } from "../../utils/cookies.js";
import { hashRefreshToken } from "../../utils/jwt.js";

function csrfHeaders(user: { id: string; role: string }) {
  const token = signToken({ userId: user.id, role: user.role as "USER" | "ADMIN" });
  const csrfToken = generateCsrfToken();
  return {
    Cookie: `${AUTH_COOKIE_NAME}=${token}; ${CSRF_COOKIE_NAME}=${csrfToken}`,
    "X-CSRF-Token": csrfToken,
  };
}

describe("POST /api/auth/register", () => {
  it("registers a new user and returns 201", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "New User",
        email: "new@example.com",
        password: "StrongPass@1",
        termsAccepted: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe("New User");
    expect(res.body.data.user.email).toBe("new@example.com");
    expect(res.body.data.user.role).toBe("USER");
  });

  it("returns 400 when terms are not accepted", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "No Consent",
        email: "noconsent@example.com",
        password: "StrongPass@1",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("records when the user accepted the terms", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Consent User",
        email: "consent@example.com",
        password: "StrongPass@1",
        termsAccepted: true,
      });

    expect(res.status).toBe(201);

    const user = await prisma.user.findUnique({
      where: { email: "consent@example.com" },
      select: { termsAcceptedAt: true },
    });
    expect(user?.termsAcceptedAt).toBeInstanceOf(Date);
  });

  it("sets auth and refresh cookies", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Cookie User",
        email: "cookies@example.com",
        password: "StrongPass@1",
        termsAccepted: true,
      });

    expect(res.headers["set-cookie"]).toBeDefined();
    const cookies = res.headers["set-cookie"] as string[];
    expect(cookies.some((c) => c.startsWith("token="))).toBe(true);
    expect(cookies.some((c) => c.startsWith("refresh-token="))).toBe(true);
  });

  it("returns 409 for duplicate email", async () => {
    await createUser({ email: "dup@example.com" });
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "Dup User",
        email: "dup@example.com",
        password: "StrongPass@1",
        termsAccepted: true,
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 for invalid input", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        name: "",
        email: "invalid",
        password: "weak",
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 403 without CSRF token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "No CSRF",
        email: "nocsrf@example.com",
        password: "StrongPass@1",
        termsAccepted: true,
      });

    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials and returns 200", async () => {
    await createUser({ email: "login@example.com", name: "Login User" });
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: "login@example.com",
        password: "Password@123",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("login@example.com");
  });

  it("returns 401 for invalid credentials", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: "nobody@example.com",
        password: "WrongPass@1",
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for wrong password", async () => {
    await createUser({ email: "wrong@example.com" });
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send({
        email: "wrong@example.com",
        password: "WrongPassword@1",
      });

    expect(res.status).toBe(401);
  });
});

describe("POST /api/auth/logout", () => {
  it("clears cookies and returns 200", async () => {
    const user = await createUser({ email: "logout@example.com" });
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("revokes refresh token session", async () => {
    const user = await createUser({ email: "revoke@example.com" });
    const csrfToken = generateCsrfToken();
    await request(app)
      .post("/api/auth/logout")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send();
  });
});

describe("POST /api/auth/refresh", () => {
  it("returns 401 when refresh token is missing", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send();

    expect(res.status).toBe(401);
  });

  it("returns 401 for invalid refresh token", async () => {
    const csrfToken = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refresh-token=invalidtoken; ${CSRF_COOKIE_NAME}=${csrfToken}`)
      .set("X-CSRF-Token", csrfToken)
      .send();

    expect(res.status).toBe(401);
  });

  it("issues new tokens for a valid refresh token", async () => {
    const user = await createUser({ email: "refresh@example.com" });

    const loginCsrf = generateCsrfToken();
    const loginRes = await request(app)
      .post("/api/auth/login")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${loginCsrf}`)
      .set("X-CSRF-Token", loginCsrf)
      .send({ email: "refresh@example.com", password: "Password@123" });

    const refreshCookie = (loginRes.headers["set-cookie"] as string[]).find((c) =>
      c.startsWith("refresh-token="),
    );
    const refreshToken = refreshCookie!.split(";")[0].split("=")[1];

    const refreshCsrf = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refresh-token=${refreshToken}; ${CSRF_COOKIE_NAME}=${refreshCsrf}`)
      .set("X-CSRF-Token", refreshCsrf)
      .send();

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("revokes the entire family on reuse detection", async () => {
    const user = await createUser({ email: "reuse@example.com" });

    const loginCsrf1 = generateCsrfToken();
    const loginRes1 = await request(app)
      .post("/api/auth/login")
      .set("Cookie", `${CSRF_COOKIE_NAME}=${loginCsrf1}`)
      .set("X-CSRF-Token", loginCsrf1)
      .send({ email: "reuse@example.com", password: "Password@123" });

    const refreshCookie1 = (loginRes1.headers["set-cookie"] as string[]).find((c) =>
      c.startsWith("refresh-token="),
    );
    const oldRefreshToken = refreshCookie1!.split(";")[0].split("=")[1];

    const refreshCsrf1 = generateCsrfToken();
    await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refresh-token=${oldRefreshToken}; ${CSRF_COOKIE_NAME}=${refreshCsrf1}`)
      .set("X-CSRF-Token", refreshCsrf1)
      .send();

    const refreshCsrf2 = generateCsrfToken();
    const res = await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", `refresh-token=${oldRefreshToken}; ${CSRF_COOKIE_NAME}=${refreshCsrf2}`)
      .set("X-CSRF-Token", refreshCsrf2)
      .send();

    expect(res.status).toBe(401);

    const allSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id },
    });
    for (const session of allSessions) {
      expect(session.revokedAt).not.toBeNull();
    }
  });
});
