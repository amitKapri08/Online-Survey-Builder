import { describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { authenticate, optionalAuthenticate } from "../../middlewares/authenticate.js";
import { signToken } from "../../utils/jwt.js";
import { AUTH_COOKIE_NAME } from "../../utils/cookies.js";
import { AppError } from "../../utils/AppError.js";

function createReqResNext(cookies: Record<string, string> = {}) {
  const req = { cookies } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("authenticate", () => {
  it("sets req.user and calls next for a valid token", () => {
    const user = { userId: "user-1", role: "USER" as const };
    const token = signToken(user);
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: token,
    });

    authenticate(req, res, next);

    expect(req.user).toEqual({ id: "user-1", role: "USER" });
    expect(next).toHaveBeenCalledWith();
  });

  it("throws UNAUTHENTICATED when no token is present", () => {
    const { req, res, next } = createReqResNext({});

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: "UNAUTHENTICATED",
      }),
    );
  });

  it("throws ACCESS_TOKEN_EXPIRED for an expired token", () => {
    const token = jwt.sign(
      { userId: "user-1", role: "USER" },
      process.env.JWT_SECRET!,
      { expiresIn: "-1s" },
    );
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: token,
    });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: "ACCESS_TOKEN_EXPIRED",
      }),
    );
  });

  it("throws ACCESS_TOKEN_INVALID for a malformed token", () => {
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: "not.a.valid.jwt",
    });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: "ACCESS_TOKEN_INVALID",
      }),
    );
  });
});

describe("optionalAuthenticate", () => {
  it("sets req.user for a valid token", () => {
    const token = signToken({ userId: "user-1", role: "ADMIN" });
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: token,
    });

    optionalAuthenticate(req, res, next);

    expect(req.user).toEqual({ id: "user-1", role: "ADMIN" });
    expect(next).toHaveBeenCalledWith();
  });

  it("does not set req.user when token is missing", () => {
    const { req, res, next } = createReqResNext({});

    optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it("does not throw for an invalid token", () => {
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: "garbage",
    });

    optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });

  it("does not throw for an expired token", () => {
    const token = jwt.sign(
      { userId: "user-1", role: "USER" },
      process.env.JWT_SECRET!,
      { expiresIn: "-1s" },
    );
    const { req, res, next } = createReqResNext({
      [AUTH_COOKIE_NAME]: token,
    });

    optionalAuthenticate(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledWith();
  });
});
