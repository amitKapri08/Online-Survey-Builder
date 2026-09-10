import { describe, expect, it } from "vitest";
import { AppError } from "../../utils/AppError.js";

describe("AppError", () => {
  it("sets default statusCode to 500", () => {
    const error = new AppError("Something went wrong");
    expect(error.statusCode).toBe(500);
  });

  it("sets custom statusCode", () => {
    const error = new AppError("Not found", 404);
    expect(error.statusCode).toBe(404);
  });

  it("always sets isOperational to true", () => {
    const error = new AppError("Error", 500);
    expect(error.isOperational).toBe(true);
  });

  it("sets optional code field", () => {
    const error = new AppError("Forbidden", 403, "FORBIDDEN");
    expect(error.code).toBe("FORBIDDEN");
  });

  it("code is undefined when not provided", () => {
    const error = new AppError("Error");
    expect(error.code).toBeUndefined();
  });

  it("has name set to AppError", () => {
    const error = new AppError("Error");
    expect(error.name).toBe("AppError");
  });

  it("is an instance of Error", () => {
    const error = new AppError("Error");
    expect(error).toBeInstanceOf(Error);
  });

  it("captures stack trace", () => {
    const error = new AppError("Error");
    expect(error.stack).toBeDefined();
    expect(error.stack).toContain("AppError");
  });
});
