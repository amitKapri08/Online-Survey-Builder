import { describe, expect, it } from "vitest";
import bcrypt from "bcrypt";
import { registerUser, loginUser, changePassword } from "../../services/auth.service.js";
import { prisma } from "../../config/prisma.js";
import { createUser } from "../helpers.js";
import { AppError } from "../../utils/AppError.js";

describe("registerUser", () => {
  it("creates a new user and returns tokens", async () => {
    const result = await registerUser({
      name: "Test User",
      email: "test@example.com",
      password: "StrongPass@1",
    });

    expect(result.user).toBeDefined();
    expect(result.user.name).toBe("Test User");
    expect(result.user.email).toBe("test@example.com");
    expect(result.user.role).toBe("USER");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    const dbUser = await prisma.user.findUnique({
      where: { id: result.user.id },
    });
    expect(dbUser).not.toBeNull();
    expect(dbUser!.password).not.toBe("StrongPass@1");
  });

  it("creates a refresh session in the database", async () => {
    const result = await registerUser({
      name: "User",
      email: "session-test@example.com",
      password: "StrongPass@1",
    });

    const sessions = await prisma.refreshSession.findMany({
      where: { userId: result.user.id },
    });
    expect(sessions.length).toBe(1);
    expect(sessions[0].revokedAt).toBeNull();
  });

  it("throws 409 for duplicate email", async () => {
    await createUser({ email: "dup@example.com" });

    await expect(
      registerUser({
        name: "Dup User",
        email: "dup@example.com",
        password: "StrongPass@1",
      }),
    ).rejects.toThrow(AppError);

    try {
      await registerUser({
        name: "Dup User",
        email: "dup@example.com",
        password: "StrongPass@1",
      });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(409);
    }
  });
});

describe("loginUser", () => {
  it("returns user and tokens for valid credentials", async () => {
    await createUser({
      email: "login@example.com",
      name: "Login User",
    });

    const result = await loginUser({
      email: "login@example.com",
      password: "Password@123",
    });

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe("login@example.com");
    expect(result.user).not.toHaveProperty("password");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
  });

  it("creates a refresh session on login", async () => {
    const user = await createUser({ email: "session@example.com" });

    const result = await loginUser({
      email: "session@example.com",
      password: "Password@123",
    });

    const sessions = await prisma.refreshSession.findMany({
      where: { userId: user.id },
    });
    expect(sessions.length).toBe(1);
  });

  it("throws 401 for non-existent email", async () => {
    await expect(
      loginUser({ email: "nobody@example.com", password: "Password@123" }),
    ).rejects.toThrow(AppError);

    try {
      await loginUser({ email: "nobody@example.com", password: "Password@123" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401);
    }
  });

  it("throws 401 for wrong password", async () => {
    await createUser({ email: "wrong@example.com" });

    await expect(
      loginUser({ email: "wrong@example.com", password: "WrongPassword@1" }),
    ).rejects.toThrow(AppError);

    try {
      await loginUser({ email: "wrong@example.com", password: "WrongPassword@1" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401);
    }
  });

  it("throws 401 for soft-deleted user", async () => {
    await createUser({ email: "deleted@example.com", deletedAt: new Date() });

    await expect(
      loginUser({ email: "deleted@example.com", password: "Password@123" }),
    ).rejects.toThrow(AppError);

    try {
      await loginUser({ email: "deleted@example.com", password: "Password@123" });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(401);
    }
  });
});

describe("changePassword", () => {
  it("updates password and issues new tokens with a new session", async () => {
    const user = await createUser({ email: "changepw@example.com" });

    const result = await changePassword(user.id, {
      currentPassword: "Password@123",
      newPassword: "NewPassword@456",
    });

    expect(result.user).toBeDefined();
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();

    const activeSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id, revokedAt: null },
    });
    expect(activeSessions.length).toBe(1);
  });

  it("revokes previous sessions on password change", async () => {
    const user = await createUser({ email: "changepw2@example.com" });

    await changePassword(user.id, {
      currentPassword: "Password@123",
      newPassword: "NewPassword@456",
    });

    const result = await changePassword(user.id, {
      currentPassword: "NewPassword@456",
      newPassword: "NewPassword@789",
    });

    const activeSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id, revokedAt: null },
    });
    expect(activeSessions.length).toBe(1);

    const allSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id },
    });
    const revokedSessions = allSessions.filter((s) => s.revokedAt !== null);
    expect(revokedSessions.length).toBe(1);
  });

  it("issues new tokens after password change", async () => {
    const user = await createUser({ email: "newtokens@example.com" });

    const result = await changePassword(user.id, {
      currentPassword: "Password@123",
      newPassword: "NewPassword@789",
    });

    const newSessions = await prisma.refreshSession.findMany({
      where: { userId: user.id, revokedAt: null },
    });
    expect(newSessions.length).toBe(1);
  });

  it("throws 400 for wrong current password", async () => {
    const user = await createUser({ email: "wrongold@example.com" });

    await expect(
      changePassword(user.id, {
        currentPassword: "WrongOldPass@1",
        newPassword: "NewPassword@1",
      }),
    ).rejects.toThrow(AppError);

    try {
      await changePassword(user.id, {
        currentPassword: "WrongOldPass@1",
        newPassword: "NewPassword@1",
      });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(400);
    }
  });

  it("throws 404 for non-existent user", async () => {
    await expect(
      changePassword("00000000-0000-0000-0000-000000000000", {
        currentPassword: "Password@123",
        newPassword: "NewPassword@1",
      }),
    ).rejects.toThrow(AppError);

    try {
      await changePassword("00000000-0000-0000-0000-000000000000", {
        currentPassword: "Password@123",
        newPassword: "NewPassword@1",
      });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404);
    }
  });

  it("throws 404 for soft-deleted user", async () => {
    const user = await createUser({ email: "deletedpw@example.com", deletedAt: new Date() });

    await expect(
      changePassword(user.id, {
        currentPassword: "Password@123",
        newPassword: "NewPassword@1",
      }),
    ).rejects.toThrow(AppError);

    try {
      await changePassword(user.id, {
        currentPassword: "Password@123",
        newPassword: "NewPassword@1",
      });
    } catch (error) {
      expect((error as AppError).statusCode).toBe(404);
    }
  });
});
