import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { requireAdmin } from "../../middlewares/requireAdmin.js";
import { AppError } from "../../utils/AppError.js";

function createReqResNext(user?: { id: string; role: string }) {
  const req = { user } as unknown as Request;
  const res = {} as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe("requireAdmin", () => {
  it("calls next when user is ADMIN", () => {
    const { req, res, next } = createReqResNext({
      id: "user-1",
      role: "ADMIN",
    });
    requireAdmin(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("throws 403 when user is not ADMIN", () => {
    const { req, res, next } = createReqResNext({
      id: "user-1",
      role: "USER",
    });

    expect(() => requireAdmin(req, res, next)).toThrow(AppError);
    try {
      requireAdmin(req, res, next);
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(403);
      expect((error as AppError).code).toBe("FORBIDDEN");
    }
  });

  it("throws 403 when user is not set", () => {
    const { req, res, next } = createReqResNext(undefined);

    expect(() => requireAdmin(req, res, next)).toThrow(AppError);
  });
});
