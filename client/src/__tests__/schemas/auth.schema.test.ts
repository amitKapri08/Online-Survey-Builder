import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  profileSchema,
  changePasswordSchema,
} from "@/schemas/auth.schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "Me@Example.com",
      password: "secret",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("me@example.com");
    }
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "me@example.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("trims whitespace around the email", () => {
    const result = loginSchema.safeParse({
      email: "  me@example.com  ",
      password: "x",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("me@example.com");
    }
  });
});

describe("registerSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "Password@123",
    confirmPassword: "Password@123",
    termsAccepted: true,
  };

  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({ ...valid, name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = registerSchema.safeParse({
      ...valid,
      name: "J".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short password", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "Ab1!",
      confirmPassword: "Ab1!",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a lowercase letter", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "PASSWORD@123",
      confirmPassword: "PASSWORD@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without an uppercase letter", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "password@123",
      confirmPassword: "password@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a number", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "Password@abc",
      confirmPassword: "Password@abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password without a special character", () => {
    const result = registerSchema.safeParse({
      ...valid,
      password: "Password123",
      confirmPassword: "Password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when terms are not accepted", () => {
    const result = registerSchema.safeParse({ ...valid, termsAccepted: false });
    expect(result.success).toBe(false);
  });

  it("rejects when passwords do not match", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "Different@123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues.map((issue) => issue.path.join("."));
      expect(issues).toContain("confirmPassword");
    }
  });

  it("converts email to lowercase", () => {
    const result = registerSchema.safeParse({ ...valid, email: "Jane@Example.com" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("jane@example.com");
    }
  });
});

describe("profileSchema", () => {
  it("accepts a valid name", () => {
    const result = profileSchema.safeParse({ name: "Jane Doe" });
    expect(result.success).toBe(true);
  });

  it("rejects a short name", () => {
    const result = profileSchema.safeParse({ name: "J" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = profileSchema.safeParse({ name: "J".repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const valid = {
    currentPassword: "Current@123",
    newPassword: "NewPass@123",
    confirmNewPassword: "NewPass@123",
  };

  it("accepts valid passwords", () => {
    const result = changePasswordSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects when new password equals current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "SamePass@123",
      newPassword: "SamePass@123",
      confirmNewPassword: "SamePass@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects when confirmation does not match", () => {
    const result = changePasswordSchema.safeParse({
      ...valid,
      confirmNewPassword: "Different@123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a weak new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "Current@123",
      newPassword: "weak",
      confirmNewPassword: "weak",
    });
    expect(result.success).toBe(false);
  });
});