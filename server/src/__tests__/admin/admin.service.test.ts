import { describe, expect, it } from "vitest";
import { prisma } from "../../config/prisma.js";
import {
  getAllUsers,
  getAllSurveys,
  getStats,
  updateUserRole,
  softDeleteUser,
} from "../../services/admin.service.js";
import { AppError } from "../../utils/AppError.js";
import {
  createAdmin,
  createUser,
  createSurvey,
  createResponse,
  seedMediumDataset,
} from "../helpers.js";

describe("getAllUsers", () => {
  it("returns paginated users with default page and limit", async () => {
    await seedMediumDataset();
    const result = await getAllUsers({ page: 1, limit: 10 });
    expect(result.users).toHaveLength(10);
    expect(result.total).toBe(100);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(10);
  });

  it("returns correct slice for a later page", async () => {
    await seedMediumDataset();
    const result = await getAllUsers({ page: 10, limit: 10 });
    expect(result.users).toHaveLength(10);
    expect(result.totalPages).toBe(10);
  });

  it("orders users by createdAt descending", async () => {
    await createUser({ email: "first@test.com" });
    await createUser({ email: "second@test.com" });
    const result = await getAllUsers({ page: 1, limit: 10 });
    expect(result.users[0].email).toBe("second@test.com");
    expect(result.users[1].email).toBe("first@test.com");
  });

  it("filters users by name search", async () => {
    await createUser({ name: "Zed Target User" });
    await createUser({ name: "Other Person" });
    const result = await getAllUsers({ page: 1, limit: 10, search: "Target" });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].name).toBe("Zed Target User");
    expect(result.total).toBe(1);
  });

  it("filters users by email search case-insensitively", async () => {
    await createUser({ email: "UniqueCase@test.com" });
    const result = await getAllUsers({ page: 1, limit: 10, search: "uniquecase" });
    expect(result.users).toHaveLength(1);
    expect(result.users[0].email).toBe("UniqueCase@test.com");
  });

  it("excludes soft-deleted users from results and total", async () => {
    const user = await createUser();
    await softDeleteUser((await createAdmin()).id, user.id);
    const result = await getAllUsers({ page: 1, limit: 10 });
    expect(result.users.find((u: any) => u.id === user.id)).toBeUndefined();
  });

  it("includes survey and response counts", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id });
    await createResponse({ surveyId: survey.id, responderKey: "k1", userId: user.id });
    const result = await getAllUsers({ page: 1, limit: 10, search: user.email });
    const found = result.users[0] as any;
    expect(found._count.surveys).toBe(1);
    expect(found._count.responses).toBe(1);
  });
});

describe("getAllSurveys", () => {
  it("returns paginated surveys", async () => {
    await seedMediumDataset();
    const result = await getAllSurveys({ page: 1, limit: 10 });
    expect(result.surveys).toHaveLength(10);
    expect(result.total).toBe(200);
    expect(result.totalPages).toBe(20);
  });

  it("filters by status", async () => {
    await seedMediumDataset();
    const result = await getAllSurveys({ page: 1, limit: 50, status: "PUBLISHED" });
    expect(result.surveys.length).toBeGreaterThan(0);
    for (const s of result.surveys) {
      expect(s.status).toBe("PUBLISHED");
    }
  });

  it("filters by status CLOSED returns only closed surveys", async () => {
    await seedMediumDataset();
    const result = await getAllSurveys({ page: 1, limit: 50, status: "CLOSED" });
    expect(result.surveys.length).toBeGreaterThan(0);
    for (const s of result.surveys) {
      expect(s.status).toBe("CLOSED");
    }
  });

  it("filters by title search", async () => {
    const user = await createUser();
    await createSurvey({ userId: user.id, title: "Pizza Satisfaction Survey" });
    await createSurvey({ userId: user.id, title: "Sleep Habits Survey" });
    const result = await getAllSurveys({ page: 1, limit: 10, search: "Pizza" });
    expect(result.surveys).toHaveLength(1);
    expect(result.surveys[0].title).toContain("Pizza");
  });

  it("includes owner user and counts in response", async () => {
    const user = await createUser();
    const survey = await createSurvey({ userId: user.id, title: "Owner Check" });
    const result = await getAllSurveys({ page: 1, limit: 10, search: "Owner Check" });
    const found = result.surveys[0] as any;
    expect(found.user.id).toBe(user.id);
    expect(found.user.name).toBe(user.name);
    expect(typeof found._count.questions).toBe("number");
    expect(typeof found._count.responses).toBe("number");
  });
});

describe("getStats", () => {
  it("returns correct counts for users, surveys and responses", async () => {
    await seedMediumDataset();
    const stats = await getStats();
    expect(stats.totalUsers).toBe(100);
    expect(stats.totalSurveys).toBe(200);
    expect(stats.totalResponses).toBe(300);
  });

  it("excludes soft-deleted users from the user count", async () => {
    const user = await createUser();
    const admin = await createAdmin();
    await softDeleteUser(admin.id, user.id);
    const stats = await getStats();
    expect(stats.totalUsers).toBe(1);
  });

  it("returns zero counts on empty database", async () => {
    const stats = await getStats();
    expect(stats).toEqual({
      totalUsers: 0,
      totalSurveys: 0,
      totalResponses: 0,
      totalViews: 0,
      totalQuestions: 0,
      surveysByStatus: { draft: 0, published: 0, closed: 0 },
    });
  });
});

describe("updateUserRole", () => {
  it("promotes a regular user to admin", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const updated = await updateUserRole(actor.id, target.id, "ADMIN");
    expect(updated.role).toBe("ADMIN");
    const logged = await prisma.adminAuditLog.findFirst({
      where: { action: "USER_ROLE_CHANGED", targetId: target.id },
    });
    expect(logged).not.toBeNull();
    expect((logged?.details as any)?.from).toBe("USER");
    expect((logged?.details as any)?.to).toBe("ADMIN");
  });

  it("demotes an admin to user", async () => {
    const actor = await createAdmin();
    const target = await createAdmin();
    const updated = await updateUserRole(actor.id, target.id, "USER");
    expect(updated.role).toBe("USER");
  });

  it("throws when actor tries to change their own role", async () => {
    const actor = await createAdmin();
    await expect(updateUserRole(actor.id, actor.id, "USER")).rejects.toThrow(
      new AppError("You cannot change your own role", 400, "SELF_ROLE_CHANGE"),
    );
  });

  it("throws when the target already has the requested role", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    await expect(updateUserRole(actor.id, target.id, "USER")).rejects.toThrow(
      new AppError("User already has this role", 400),
    );
  });

  it("throws when the target user does not exist", async () => {
    const actor = await createAdmin();
    await expect(
      updateUserRole(actor.id, "nonexistent-id", "ADMIN"),
    ).rejects.toThrow(new AppError("User not found", 404));
  });

  it("throws when the target user is soft-deleted", async () => {
    const actor = await createAdmin();
    const target = await createUser({ deletedAt: new Date() });
    await expect(updateUserRole(actor.id, target.id, "ADMIN")).rejects.toThrow(
      new AppError("User not found", 404),
    );
  });
});

describe("softDeleteUser", () => {
  it("soft-deletes a user and sets deletedAt", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    const result = await softDeleteUser(actor.id, target.id);
    expect(result.deletedAt).toBeInstanceOf(Date);
    const dbUser = await prisma.user.findUnique({ where: { id: target.id } });
    expect(dbUser?.deletedAt).not.toBeNull();
  });

  it("revokes all active refresh sessions of the deleted user", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    await softDeleteUser(actor.id, target.id);
    const sessions = await prisma.refreshSession.findMany({
      where: { userId: target.id },
    });
    for (const s of sessions) {
      expect(s.revokedAt).not.toBeNull();
    }
  });

  it("throws when actor tries to delete their own account", async () => {
    const actor = await createAdmin();
    await expect(softDeleteUser(actor.id, actor.id)).rejects.toThrow(
      new AppError("You cannot delete your own account", 400, "SELF_DELETE"),
    );
  });

  it("throws when trying to delete another admin account", async () => {
    const actor = await createAdmin();
    const otherAdmin = await createAdmin();
    await expect(softDeleteUser(actor.id, otherAdmin.id)).rejects.toThrow(
      new AppError("Admin accounts cannot be deleted", 400),
    );
  });

  it("throws when the target user does not exist", async () => {
    const actor = await createAdmin();
    await expect(softDeleteUser(actor.id, "nonexistent-id")).rejects.toThrow(
      new AppError("User not found", 404),
    );
  });

  it("throws when target is already soft-deleted", async () => {
    const actor = await createAdmin();
    const target = await createUser({ deletedAt: new Date() });
    await expect(softDeleteUser(actor.id, target.id)).rejects.toThrow(
      new AppError("User not found", 404),
    );
  });

  it("writes a USER_DELETED audit log", async () => {
    const actor = await createAdmin();
    const target = await createUser();
    await softDeleteUser(actor.id, target.id);
    const logged = await prisma.adminAuditLog.findFirst({
      where: { action: "USER_DELETED", targetId: target.id },
    });
    expect(logged).not.toBeNull();
    expect((logged?.details as any)?.soft).toBe(true);
  });
});
