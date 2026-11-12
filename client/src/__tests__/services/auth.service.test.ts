import { beforeEach, describe, expect, it } from "vitest";
import {
  changePassword,
  getCsrfToken,
  getMe,
  login,
  logout,
  register,
  updateProfile,
} from "@/services/auth.service";
import { setStoredCsrfToken } from "@/api/csrf";
import { mockAuthUser } from "@/__tests__/mocks/handlers";

beforeEach(() => {
  setStoredCsrfToken("mock-csrf-token");
});

describe("auth.service", () => {
  it("getCsrfToken returns a token and stores it", async () => {
    const token = await getCsrfToken();
    expect(token).toBe("mock-csrf-token-12345678901234567890123456789012");
  });

  it("register creates a user", async () => {
    const payload = { name: "Jane Doe", email: "jane@example.com", password: "Password@123" };
    const result = await register(payload);
    expect(result.success).toBe(true);
    expect(result.data.user.name).toBe("Jane Doe");
    expect(result.data.user.email).toBe("jane@example.com");
  });

  it("login returns the authenticated user", async () => {
    const result = await login({ email: "me@test.com", password: "Password@123" });
    expect(result.success).toBe(true);
    expect(result.data.user.id).toBe(mockAuthUser.id);
  });

  it("login rejects invalid credentials", async () => {
    await expect(
      login({ email: "wrong@test.com", password: "Password@123" }),
    ).rejects.toThrow();
  });

  it("getMe returns the current user", async () => {
    const user = await getMe();
    expect(user.id).toBe(mockAuthUser.id);
    expect(user.name).toBe("Me User");
  });

  it("logout resolves without error", async () => {
    await expect(logout()).resolves.toBeUndefined();
  });

  it("updateProfile returns the updated user", async () => {
    const user = await updateProfile({ name: "New Name" });
    expect(user.name).toBe("New Name");
    expect(user.id).toBe(mockAuthUser.id);
  });

  it("changePassword resolves without error", async () => {
    await expect(
      changePassword({
        currentPassword: "Current@123",
        newPassword: "NewPass@123",
      }),
    ).resolves.toBeUndefined();
  });
});