import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodIssue } from "zod";
import { errorHandler } from "../../middlewares/errorHandler.js";
import { AppError } from "../../utils/AppError.js";

function createMockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _json: json, _status: status };
}

function createReqResNext() {
  return {
    req: {} as Request,
    res: createMockRes() as unknown as Response,
    next: vi.fn() as NextFunction,
  };
}

describe("errorHandler", () => {
  it("formats ZodError as 400 with field-level errors", () => {
    const { req, res, next } = createReqResNext();
    const zodError = new ZodError([
      {
        code: "too_small",
        minimum: 1,
        type: "string",
        inclusive: true,
        path: ["email"],
        message: "Invalid email",
      },
    ] as ZodIssue[]);

    errorHandler(zodError, req, res, next);

    expect(res._status).toHaveBeenCalledWith(400);
    expect(res._json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email", message: "Invalid email" }],
    });
  });

  it("formats ZodError with nested paths", () => {
    const { req, res, next } = createReqResNext();
    const zodError = new ZodError([
      {
        code: "invalid_type",
        expected: "string",
        received: "number",
        path: ["data", "name"],
        message: "Expected string",
      },
    ] as ZodIssue[]);

    errorHandler(zodError, req, res, next);

    expect(res._json).toHaveBeenCalledWith(
      expect.objectContaining({
        errors: [{ field: "data.name", message: "Expected string" }],
      }),
    );
  });

  it("formats AppError with statusCode and code", () => {
    const { req, res, next } = createReqResNext();
    const error = new AppError("Not found", 404, "NOT_FOUND");

    errorHandler(error, req, res, next);

    expect(res._status).toHaveBeenCalledWith(404);
    expect(res._json).toHaveBeenCalledWith({
      success: false,
      message: "Not found",
      code: "NOT_FOUND",
    });
  });

  it("formats AppError without code", () => {
    const { req, res, next } = createReqResNext();
    const error = new AppError("Server error", 500);

    errorHandler(error, req, res, next);

    expect(res._status).toHaveBeenCalledWith(500);
    expect(res._json).toHaveBeenCalledWith({
      success: false,
      message: "Server error",
    });
  });

  it("returns 500 for unknown errors", () => {
    const { req, res, next } = createReqResNext();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    errorHandler(new Error("Unexpected"), req, res, next);

    expect(res._status).toHaveBeenCalledWith(500);
    expect(res._json).toHaveBeenCalledWith({
      success: false,
      message: "Internal server error",
    });
    consoleSpy.mockRestore();
  });

  it("logs unknown errors to console", () => {
    const { req, res, next } = createReqResNext();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Something weird");

    errorHandler(error, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});
