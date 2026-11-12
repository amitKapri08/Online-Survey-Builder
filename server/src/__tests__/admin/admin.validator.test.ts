import { describe, expect, it } from "vitest";
import {
  adminQuerySchema,
  updateUserRoleSchema,
} from "../../validators/admin.validator.js";

describe("adminQuerySchema", () => {
  it("parses valid query with defaults", () => {
    const result = adminQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
    expect(result.status).toBeUndefined();
    expect(result.search).toBeUndefined();
  });

  it("parses explicit page and limit", () => {
    const result = adminQuerySchema.parse({ page: "3", limit: "15" });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(15);
  });

  it("parses status and search", () => {
    const result = adminQuerySchema.parse({
      page: 2,
      limit: 20,
      status: "PUBLISHED",
      search: "foo",
    });
    expect(result.status).toBe("PUBLISHED");
    expect(result.search).toBe("foo");
  });

  it("rejects an invalid status", () => {
    expect(() => adminQuerySchema.parse({ status: "BOGUS" })).toThrow();
  });

  it("rejects page below minimum", () => {
    expect(() => adminQuerySchema.parse({ page: 0 })).toThrow();
  });

  it("rejects limit above the maximum", () => {
    expect(() => adminQuerySchema.parse({ limit: 51 })).toThrow();
  });

  it("rejects non-integer limit", () => {
    expect(() => adminQuerySchema.parse({ limit: 10.5 })).toThrow();
  });

  it("trims search and rejects over max length", () => {
    expect(() =>
      adminQuerySchema.parse({ search: "x".repeat(101) }),
    ).toThrow();
  });
});

describe("updateUserRoleSchema", () => {
  it("accepts USER and ADMIN roles", () => {
    expect(updateUserRoleSchema.parse({ role: "USER" })).toEqual({ role: "USER" });
    expect(updateUserRoleSchema.parse({ role: "ADMIN" })).toEqual({ role: "ADMIN" });
  });

  it("rejects an invalid role", () => {
    expect(() => updateUserRoleSchema.parse({ role: "MANAGER" })).toThrow();
  });

  it("rejects a missing role", () => {
    expect(() => updateUserRoleSchema.parse({})).toThrow();
  });
});
