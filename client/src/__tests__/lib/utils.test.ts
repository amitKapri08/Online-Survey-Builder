import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/routes";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("handles conditional values", () => {
    expect(cn("base", false, undefined, null, "extra")).toBe("base extra");
  });

  it("merges conflicting tailwind classes with tailwind-merge", () => {
    expect(cn("p-4", "p-8")).toBe("p-8");
  });
});

describe("ROUTES", () => {
  it("exposes public route constants", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.REGISTER).toBe("/register");
    expect(ROUTES.SURVEY_PUBLIC).toBe("/s/:slug");
    expect(ROUTES.PRIVACY_POLICY).toBe("/privacy");
    expect(ROUTES.TERMS_OF_USE).toBe("/terms");
  });

  it("exposes protected route constants", () => {
    expect(ROUTES.DASHBOARD).toBe("/dashboard");
    expect(ROUTES.SURVEYS).toBe("/surveys");
    expect(ROUTES.SURVEY_CREATE).toBe("/surveys/new");
    expect(ROUTES.SURVEY_EDIT).toBe("/surveys/:id/edit");
    expect(ROUTES.PROFILE).toBe("/account");
    expect(ROUTES.ADMIN).toBe("/admin");
    expect(ROUTES.ADMIN_USERS).toBe("/admin/users");
    expect(ROUTES.ADMIN_SURVEYS).toBe("/admin/surveys");
    expect(ROUTES.ADMIN_AUDIT).toBe("/admin/audit-logs");
  });
});