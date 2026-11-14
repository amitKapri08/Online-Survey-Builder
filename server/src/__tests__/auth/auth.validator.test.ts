import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from "../../validators/auth.validator.js";

describe("registerSchema", () => {
  it("parses valid input", () => {
    const result = registerSchema.parse({
      name: "John Doe",
      email: "JOHN@example.com",
      password: "Password@123",
      termsAccepted: true,
    });
    expect(result.name).toBe("John Doe");
    expect(result.email).toBe("john@example.com");
    expect(result.password).toBe("Password@123");
    expect(result.termsAccepted).toBe(true);
  });

  it("rejects registration without consent", () => {
    expect(() =>
      registerSchema.parse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password@123",
      }),
    ).toThrow();

    expect(() =>
      registerSchema.parse({
        name: "John Doe",
        email: "john@example.com",
        password: "Password@123",
        termsAccepted: false,
      }),
    ).toThrow();
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() =>
      registerSchema.parse({ name: "A", email: "a@b.com", password: "Password@1" }),
    ).toThrow();
  });

  it("rejects name longer than 100 characters", () => {
    expect(() =>
      registerSchema.parse({
        name: "X".repeat(101),
        email: "a@b.com",
        password: "Password@1",
      }),
    ).toThrow();
  });

  it("rejects invalid email", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "not-an-email", password: "Password@1" }),
    ).toThrow();
  });

  it("lowercases the email", () => {
    const result = registerSchema.parse({
      name: "John",
      email: "UPPER@EXAMPLE.COM",
      password: "Password@123",
      termsAccepted: true,
    });
    expect(result.email).toBe("upper@example.com");
  });

  it("rejects password shorter than 8 characters", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "a@b.com", password: "P@1a" }),
    ).toThrow();
  });

  it("rejects password missing uppercase", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "a@b.com", password: "lowercase@1" }),
    ).toThrow();
  });

  it("rejects password missing lowercase", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "a@b.com", password: "UPPERCASE@1" }),
    ).toThrow();
  });

  it("rejects password missing digit", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "a@b.com", password: "NoDigitHere@" }),
    ).toThrow();
  });

  it("rejects password missing special character", () => {
    expect(() =>
      registerSchema.parse({ name: "John", email: "a@b.com", password: "NoSpecial1a" }),
    ).toThrow();
  });

  it("rejects missing required fields", () => {
    expect(() => registerSchema.parse({})).toThrow();
    expect(() => registerSchema.parse({ name: "John" })).toThrow();
  });
});

describe("loginSchema", () => {
  it("parses valid input", () => {
    const result = loginSchema.parse({
      email: "USER@EXAMPLE.COM",
      password: "password",
    });
    expect(result.email).toBe("user@example.com");
    expect(result.password).toBe("password");
  });

  it("rejects invalid email", () => {
    expect(() => loginSchema.parse({ email: "bad", password: "pass" })).toThrow();
  });

  it("rejects empty password", () => {
    expect(() =>
      loginSchema.parse({ email: "a@b.com", password: "" }),
    ).toThrow();
  });
});

describe("updateProfileSchema", () => {
  it("parses valid name", () => {
    expect(updateProfileSchema.parse({ name: "Jane Doe" })).toEqual({
      name: "Jane Doe",
    });
  });

  it("rejects name shorter than 2 characters", () => {
    expect(() => updateProfileSchema.parse({ name: "J" })).toThrow();
  });

  it("rejects name longer than 100 characters", () => {
    expect(() => updateProfileSchema.parse({ name: "X".repeat(101) })).toThrow();
  });
});

describe("changePasswordSchema", () => {
  it("parses valid input", () => {
    const result = changePasswordSchema.parse({
      currentPassword: "OldPassword@1",
      newPassword: "NewPassword@2",
    });
    expect(result.currentPassword).toBe("OldPassword@1");
    expect(result.newPassword).toBe("NewPassword@2");
  });

  it("rejects when new password equals current password", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "Password@123",
        newPassword: "Password@123",
      }),
    ).toThrow();
  });

  it("rejects empty current password", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "",
        newPassword: "NewPassword@1",
      }),
    ).toThrow();
  });

  it("rejects weak new password", () => {
    expect(() =>
      changePasswordSchema.parse({
        currentPassword: "OldPassword@1",
        newPassword: "weak",
      }),
    ).toThrow();
  });
});
