import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma } from "../../config/prisma.js";
import {
  createAdmin,
  createUser,
  createSurvey,
  seedMediumDataset,
  authHeaders,
  authHeadersWithCsrf,
} from "../helpers.js";

describe("GET /api/admin/stats", () => {
  it("returns stats for an admin user", async () => {
    const { admin } = await seedMediumDataset();
    const res = await request(app)
      .get("/api/admin/stats")
      .set(authHeaders(admin));
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.totalUsers).toBe(100);
    expect(res.body.data.stats.totalSurveys).toBe(200);
    expect(res.body.data.stats.totalResponses).toBe(300);
  });

  it("returns 403 for a regular user", async () => {
    const user = await createUser();
    const res = await request(app)
      .get("/api/admin/stats")
      .set(authHeaders(user));
    expect(res.status).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/admin/stats");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("UNAUTHENTICATED");
  });
});

describe("GET /api/admin/users", () => {
  it("returns a paginated list of users", async () => {
    const { admin } = await seedMediumDataset();
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=10")
      .set(authHeaders(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(10);
    expect(res.body.data.total).toBe(100);
    expect(res.body.data.totalPages).toBe(10);
  });

  it("supports search query", async () => {
    const admin = await createAdmin();
    await createUser({ email: "searchme@test.com", name: "Search Me" });
    const res = await request(app)
      .get("/api/admin/users?search=searchme")
      .set(authHeaders(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.users).toHaveLength(1);
    expect(res.body.data.users[0].email).toBe("searchme@test.com");
  });

  it("returns 403 for a regular user", async () => {
    const user = await createUser();
    const res = await request(app)
      .get("/api/admin/users")
      .set(authHeaders(user));
    expect(res.status).toBe(403);
  });

  it("returns 401 when unauthenticated", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.status).toBe(401);
  });

  it("validates query params (invalid limit)", async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .get("/api/admin/users?limit=999")
      .set(authHeaders(admin));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/admin/surveys", () => {
  it("returns a paginated list of surveys", async () => {
    const { admin } = await seedMediumDataset();
    const res = await request(app)
      .get("/api/admin/surveys?page=1&limit=10")
      .set(authHeaders(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.surveys).toHaveLength(10);
    expect(res.body.data.total).toBe(200);
    expect(res.body.data.totalPages).toBe(20);
  });

  it("filters surveys by status", async () => {
    const admin = await createAdmin();
    await seedMediumDataset();
    const res = await request(app)
      .get("/api/admin/surveys?status=PUBLISHED&limit=50")
      .set(authHeaders(admin));
    expect(res.status).toBe(200);
    expect(res.body.data.surveys.length).toBeGreaterThan(0);
    for (const s of res.body.data.surveys) {
      expect(s.status).toBe("PUBLISHED");
    }
  });

  it("validates status query param", async () => {
    const admin = await createAdmin();
    const res = await request(app)
      .get("/api/admin/surveys?status=INVALID")
      .set(authHeaders(admin));
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/admin/users/:id/role", () => {
  it("promotes a user to admin for an admin actor", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const res = await request(app)
      .patch(`/api/admin/users/${target.id}/role`)
      .set(authHeadersWithCsrf(actor))
      .send({ role: "ADMIN" });
    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("ADMIN");
  });

  it("returns 400 when actor tries to change own role", async () => {
    const actor = await createAdmin();
    const res = await request(app)
      .patch(`/api/admin/users/${actor.id}/role`)
      .set(authHeadersWithCsrf(actor))
      .send({ role: "USER" });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("SELF_ROLE_CHANGE");
  });

  it("returns 400 for an invalid role value", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const res = await request(app)
      .patch(`/api/admin/users/${target.id}/role`)
      .set(authHeadersWithCsrf(actor))
      .send({ role: "SUPERUSER" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for a nonexistent target user", async () => {
    const actor = await createAdmin();
    const res = await request(app)
      .patch("/api/admin/users/nonexistent/role")
      .set(authHeadersWithCsrf(actor))
      .send({ role: "ADMIN" });
    expect(res.status).toBe(404);
  });

  it("returns 403 when a regular user attempts a role change", async () => {
    const actor = await createUser();
    const target = await createUser();
    const res = await request(app)
      .patch(`/api/admin/users/${target.id}/role`)
      .set(authHeadersWithCsrf(actor))
      .send({ role: "ADMIN" });
    expect(res.status).toBe(403);
  });

  it("returns 403 without a CSRF token", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const res = await request(app)
      .patch(`/api/admin/users/${target.id}/role`)
      .set(authHeaders(actor))
      .send({ role: "ADMIN" });
    expect(res.status).toBe(403);
  });
});

describe("DELETE /api/admin/users/:id", () => {
  it("soft-deletes a user for an admin actor", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const res = await request(app)
      .delete(`/api/admin/users/${target.id}`)
      .set(authHeadersWithCsrf(actor));
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("User deactivated");
    const dbUser = await prisma.user.findUnique({ where: { id: target.id } });
    expect(dbUser?.deletedAt).not.toBeNull();
  });

  it("returns 400 when actor tries to delete themselves", async () => {
    const actor = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/users/${actor.id}`)
      .set(authHeadersWithCsrf(actor));
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("SELF_DELETE");
  });

  it("returns 400 when trying to delete another admin", async () => {
    const actor = await createAdmin();
    const other = await createAdmin();
    const res = await request(app)
      .delete(`/api/admin/users/${other.id}`)
      .set(authHeadersWithCsrf(actor));
    expect(res.status).toBe(400);
  });

  it("returns 404 for a nonexistent user", async () => {
    const actor = await createAdmin();
    const res = await request(app)
      .delete("/api/admin/users/nonexistent")
      .set(authHeadersWithCsrf(actor));
    expect(res.status).toBe(404);
  });

  it("returns 403 for a regular user", async () => {
    const actor = await createUser();
    const target = await createUser();
    const res = await request(app)
      .delete(`/api/admin/users/${target.id}`)
      .set(authHeadersWithCsrf(actor));
    expect(res.status).toBe(403);
  });
});
