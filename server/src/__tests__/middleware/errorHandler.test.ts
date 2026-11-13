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

function createReqResNext(overrides: Partial<Request> = {}) {
  return {
    req: { method: "POST", originalUrl: "/api/test", ...overrides } as Request,
    res: createMockRes() as unknown as Response,
    next: vi.fn() as NextFunction,
  };
}

/**
 * Mirrors the shape body-parser throws for malformed/oversized request bodies.
 * `body` holds the raw payload, which is exactly what must never be logged.
 */
function createBodyParserError(
  type: string,
  statusCode: number,
  body: string,
): SyntaxError & { status: number; statusCode: number; type: string; expose: boolean; body: string } {
  return Object.assign(new SyntaxError("Unexpected token in JSON"), {
    status: statusCode,
    statusCode,
    type,
    expose: true,
    body,
  });
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

  describe("body-parser errors", () => {
    it("maps malformed JSON to 400 instead of 500", () => {
      const { req, res, next } = createReqResNext();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      errorHandler(
        createBodyParserError(
          "entity.parse.failed",
          400,
          '{"email":"user@example.com","password":"SuperSecret@123"',
        ),
        req,
        res,
        next,
      );

      expect(res._status).toHaveBeenCalledWith(400);
      expect(res._json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid JSON body",
      });
      expect(errorSpy).not.toHaveBeenCalled();

      warnSpy.mockRestore();
      errorSpy.mockRestore();
    });

    it("never logs the raw request body", () => {
      const { req, res, next } = createReqResNext();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      errorHandler(
        createBodyParserError(
          "entity.parse.failed",
          400,
          '{"email":"user@example.com","password":"SuperSecret@123"',
        ),
        req,
        res,
        next,
      );

      const logged = JSON.stringify(warnSpy.mock.calls);

      expect(logged).not.toContain("SuperSecret@123");
      expect(logged).not.toContain("user@example.com");
      expect(logged).toContain("/api/test");

      warnSpy.mockRestore();
    });

    it("maps oversized bodies to 413", () => {
      const { req, res, next } = createReqResNext();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      errorHandler(
        createBodyParserError("entity.too.large", 413, "x".repeat(10)),
        req,
        res,
        next,
      );

      expect(res._status).toHaveBeenCalledWith(413);
      expect(res._json).toHaveBeenCalledWith({
        success: false,
        message: "Request body too large",
      });

      warnSpy.mockRestore();
    });

    it("maps unsupported content encoding to 415", () => {
      const { req, res, next } = createReqResNext();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      errorHandler(
        createBodyParserError("encoding.unsupported", 415, ""),
        req,
        res,
        next,
      );

      expect(res._status).toHaveBeenCalledWith(415);
      expect(res._json).toHaveBeenCalledWith({
        success: false,
        message: "Unsupported content encoding",
      });

      warnSpy.mockRestore();
    });

    it("does not echo the original error message to the client", () => {
      const { req, res, next } = createReqResNext();
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const error = createBodyParserError("entity.parse.failed", 400, "secret");

      errorHandler(error, req, res, next);

      expect(res._json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid JSON body",
      });
      expect(res._json).not.toHaveBeenCalledWith(
        expect.objectContaining({ body: "secret" }),
      );

      warnSpy.mockRestore();
    });
  });

  it("honours a 4xx status on other middleware errors", () => {
    const { req, res, next } = createReqResNext();
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = Object.assign(new Error("Unauthorized"), {
      status: 401,
      expose: true,
    });

    errorHandler(error, req, res, next);

    expect(res._status).toHaveBeenCalledWith(401);
    expect(res._json).toHaveBeenCalledWith({
      success: false,
      message: "Authentication required",
    });

    warnSpy.mockRestore();
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

  it("logs unknown errors without the error object", () => {
    const { req, res, next } = createReqResNext();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("Something weird");

    errorHandler(error, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(
      "[error] POST /api/test",
      expect.stringContaining("Something weird"),
    );
    expect(consoleSpy).not.toHaveBeenCalledWith(error);
    consoleSpy.mockRestore();
  });
});
