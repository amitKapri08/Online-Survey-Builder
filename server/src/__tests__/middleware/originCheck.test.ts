import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { originCheck } from "../../middlewares/originCheck.js";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

function createReqResNext(headers: Record<string, string> = {}) {
  const req = { headers } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("originCheck", () => {
  it("calls next when Origin header is absent", () => {
    const { req, res, next } = createReqResNext({});
    originCheck(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next when Origin matches expected origin", () => {
    const { req, res, next } = createReqResNext({ origin: env.CORS_ORIGIN });
    originCheck(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("throws 403 when Origin does not match", () => {
    const { req, res, next } = createReqResNext({
      origin: "https://evil.com",
    });

    expect(() => originCheck(req, res, next)).toThrow(AppError);
    try {
      originCheck(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(403);
    }
  });

  it("throws 403 for a different mismatched origin", () => {
    const { req, res, next } = createReqResNext({
      origin: "http://localhost:3000",
    });

    expect(() => originCheck(req, res, next)).toThrow(AppError);
  });
});
