import { beforeEach, describe, expect, it } from "vitest";
import {
  getAdminStats,
  getAdminSurveys,
  getAdminUsers,
  getAdminAuditLogs,
  updateAdminUserRole,
  deleteAdminUser,
} from "@/services/admin.service";
import { setStoredCsrfToken } from "@/api/csrf";

beforeEach(() => {
  setStoredCsrfToken("mock-csrf-token");
});

describe("admin.service", () => {
  it("getAdminStats returns stats", async () => {
    const stats = await getAdminStats();
    expect(stats.totalUsers).toBe(100);
    expect(stats.totalSurveys).toBe(200);
    expect(stats.totalResponses).toBe(300);
  });

  it("getAdminUsers returns paginated users", async () => {
    const result = await getAdminUsers({ page: 1, limit: 10 });
    expect(result.users.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("getAdminUsers filters by search", async () => {
    const result = await getAdminUsers({ search: "Alice" });
    expect(result.users.length).toBe(1);
    expect(result.users[0].name).toBe("Alice Admin");
  });

  it("getAdminSurveys returns paginated surveys", async () => {
    const result = await getAdminSurveys({ page: 1, limit: 10 });
    expect(result.surveys.length).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);
  });

  it("getAdminSurveys filters by status", async () => {
    const result = await getAdminSurveys({ status: "PUBLISHED" });
    expect(result.surveys.every((s) => s.status === "PUBLISHED")).toBe(true);
  });

  it("getAdminAuditLogs returns audit logs", async () => {
    const result = await getAdminAuditLogs({ page: 1, limit: 10 });
    expect(Array.isArray(result.logs)).toBe(true);
  });

  it("updateAdminUserRole updates a user's role", async () => {
    const user = await updateAdminUserRole("user-2", "ADMIN");
    expect(user.role).toBe("ADMIN");
  });

  it("deleteAdminUser resolves without error", async () => {
    await expect(deleteAdminUser("user-4")).resolves.toBeUndefined();
  });
});