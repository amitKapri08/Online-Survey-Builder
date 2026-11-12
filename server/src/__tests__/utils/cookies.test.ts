import { describe, expect, it, vi } from "vitest";
import type { Response } from "express";
import {
  setAuthCookie,
  clearAuthCookie,
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
  setCsrfCookie,
  clearCsrfCookie,
  setVisitorCookie,
  getRefreshTokenExpiryDate,
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  VISITOR_COOKIE_NAME,
} from "../../utils/cookies.js";

function createMockResponse() {
  const cookies: Record<string, unknown> = {};
  const clearedCookies: string[] = [];
  const res = {
    cookie: vi.fn((name: string, _value: string, options: unknown) => {
      cookies[name] = options;
    }),
    clearCookie: vi.fn((name: string) => {
      clearedCookies.push(name);
    }),
  } as unknown as Response & {
    _cookies: Record<string, unknown>;
    _clearedCookies: string[];
  };
  (res as any)._cookies = cookies;
  (res as any)._clearedCookies = clearedCookies;
  return res;
}

describe("cookie name constants", () => {
  it("exports correct cookie names", () => {
    expect(AUTH_COOKIE_NAME).toBe("token");
    expect(CSRF_COOKIE_NAME).toBe("csrf-token");
    expect(REFRESH_COOKIE_NAME).toBe("refresh-token");
    expect(VISITOR_COOKIE_NAME).toBe("visitor-id");
  });
});

describe("setAuthCookie", () => {
  it("sets the auth cookie with correct options", () => {
    const res = createMockResponse();
    setAuthCookie(res, "jwt-token-123");
    expect(res.cookie).toHaveBeenCalledWith(
      "token",
      "jwt-token-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
  });
});

describe("clearAuthCookie", () => {
  it("clears the auth cookie", () => {
    const res = createMockResponse();
    clearAuthCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });
});

describe("setRefreshTokenCookie", () => {
  it("sets the refresh token cookie with correct options", () => {
    const res = createMockResponse();
    setRefreshTokenCookie(res, "refresh-123");
    expect(res.cookie).toHaveBeenCalledWith(
      "refresh-token",
      "refresh-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
  });
});

describe("clearRefreshTokenCookie", () => {
  it("clears the refresh token cookie", () => {
    const res = createMockResponse();
    clearRefreshTokenCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith(
      "refresh-token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });
});

describe("setCsrfCookie", () => {
  it("sets the CSRF cookie with correct options", () => {
    const res = createMockResponse();
    setCsrfCookie(res, "csrf-123");
    expect(res.cookie).toHaveBeenCalledWith(
      "csrf-token",
      "csrf-123",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
  });
});

describe("clearCsrfCookie", () => {
  it("clears the CSRF cookie", () => {
    const res = createMockResponse();
    clearCsrfCookie(res);
    expect(res.clearCookie).toHaveBeenCalledWith(
      "csrf-token",
      expect.objectContaining({ httpOnly: true, sameSite: "lax" }),
    );
  });
});

describe("setVisitorCookie", () => {
  it("sets the visitor cookie with 1-year maxAge", () => {
    const res = createMockResponse();
    setVisitorCookie(res, "visitor-abc");
    const oneYearMs = 365 * 24 * 60 * 60 * 1000;
    expect(res.cookie).toHaveBeenCalledWith(
      "visitor-id",
      "visitor-abc",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: oneYearMs,
      }),
    );
  });
});

describe("getRefreshTokenExpiryDate", () => {
  it("returns a Date in the future", () => {
    const before = Date.now();
    const expiry = getRefreshTokenExpiryDate();
    expect(expiry).toBeInstanceOf(Date);
    expect(expiry.getTime()).toBeGreaterThan(before);
  });
});
