import { describe, it, expect } from "vitest";
import { randomUUID } from "node:crypto";
import {
  submitResponseSchema,
  responseQuerySchema,
} from "../../validators/response.validator.js";

describe("submitResponseSchema", () => {
  const validId = randomUUID();

  it("accepts valid answers with submitAnonymously", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: "hello" }],
      submitAnonymously: true,
    });
    expect(result.success).toBe(true);
  });

  it("defaults submitAnonymously to false", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: "hello" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.submitAnonymously).toBe(false);
    }
  });

  it("accepts numeric answer values", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: 42 }],
    });
    expect(result.success).toBe(true);
  });

  it("accepts array answer values", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: ["opt1", "opt2"] }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid UUID in questionId", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: "not-a-uuid", value: "hello" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-UUID/non-number/non-string/non-array value", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: { bad: true } }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects answers array exceeding max length (500)", () => {
    const answers = Array.from({ length: 501 }, () => ({
      questionId: validId,
      value: "x",
    }));
    const result = submitResponseSchema.safeParse({ answers });
    expect(result.success).toBe(false);
  });

  it("rejects empty answers", () => {
    const result = submitResponseSchema.safeParse({ answers: [] });
    expect(result.success).toBe(true);
  });

  it("rejects missing answers field", () => {
    const result = submitResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts valid input with extra fields stripped", () => {
    const result = submitResponseSchema.safeParse({
      answers: [{ questionId: validId, value: "yes" }],
      extraField: true,
    });
    expect(result.success).toBe(true);
  });
});

describe("responseQuerySchema", () => {
  it("uses defaults when no query provided", () => {
    const result = responseQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({ page: 1, limit: 20, order: "newest" });
    }
  });

  it("parses string query params to numbers", () => {
    const result = responseQuerySchema.safeParse({ page: "2", limit: "10" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it("accepts oldest order", () => {
    const result = responseQuerySchema.safeParse({ order: "oldest" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid order value", () => {
    const result = responseQuerySchema.safeParse({ order: "random" });
    expect(result.success).toBe(false);
  });

  it("rejects page < 1", () => {
    const result = responseQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects limit > 100", () => {
    const result = responseQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer limit", () => {
    const result = responseQuerySchema.safeParse({ limit: 1.5 });
    expect(result.success).toBe(false);
  });
});
