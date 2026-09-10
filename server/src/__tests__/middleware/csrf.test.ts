import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { csrf } from "../../middlewares/csrf.js";
import { generateCsrfToken } from "../../utils/csrf.js";
import { CSRF_COOKIE_NAME } from "../../utils/cookies.js";
import { AppError } from "../../utils/AppError.js";

function createReqResNext(
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {},
) {
  const req = { headers, cookies } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("csrf middleware", () => {
  it("calls next when CSRF tokens match", () => {
    const token = generateCsrfToken();
    const { req, res, next } = createReqResNext(
      { "x-csrf-token": token },
      { [CSRF_COOKIE_NAME]: token },
    );

    csrf(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("throws 403 when tokens do not match", () => {
    const { req, res, next } = createReqResNext(
      { "x-csrf-token": "token-a" },
      { [CSRF_COOKIE_NAME]: "token-b" },
    );

    expect(() => csrf(req, res, next)).toThrow(AppError);
    try {
      csrf(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(403);
    }
  });

  it("throws 403 when header token is missing", () => {
    const token = generateCsrfToken();
    const { req, res, next } = createReqResNext(
      {},
      { [CSRF_COOKIE_NAME]: token },
    );

    expect(() => csrf(req, res, next)).toThrow(AppError);
  });

  it("throws 403 when cookie token is missing", () => {
    const token = generateCsrfToken();
    const { req, res, next } = createReqResNext(
      { "x-csrf-token": token },
      {},
    );

    expect(() => csrf(req, res, next)).toThrow(AppError);
  });

  it("throws 403 when both tokens are missing", () => {
    const { req, res, next } = createReqResNext({}, {});

    expect(() => csrf(req, res, next)).toThrow(AppError);
  });
});
