import { describe, expect, it } from "vitest";
import {
  validateNumberAnswer,
  isValidNumberAnswer,
} from "../../utils/numberValidation.js";

describe("validateNumberAnswer", () => {
  it("rejects non-number values", () => {
    expect(validateNumberAnswer("123")).toEqual({
      valid: false,
      code: "INVALID_NUMBER",
    });
    expect(validateNumberAnswer(NaN)).toEqual({
      valid: false,
      code: "INVALID_NUMBER",
    });
    expect(validateNumberAnswer(null)).toEqual({
      valid: false,
      code: "INVALID_NUMBER",
    });
    expect(validateNumberAnswer(undefined)).toEqual({
      valid: false,
      code: "INVALID_NUMBER",
    });
    expect(validateNumberAnswer({})).toEqual({
      valid: false,
      code: "INVALID_NUMBER",
    });
  });

  it("rejects decimals when no min/max are set", () => {
    expect(validateNumberAnswer(3.7)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
    expect(validateNumberAnswer(0.1)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
    expect(validateNumberAnswer(-2.5)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
  });

  it("rejects decimals with NOT_AN_INTEGER even when min and/or max are set", () => {
    expect(validateNumberAnswer(15.5, 10, null)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
    expect(validateNumberAnswer(3.7, 1, 10)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
    expect(validateNumberAnswer(0.5, 1, 10)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
    expect(validateNumberAnswer(12.5, null, 10)).toEqual({
      valid: false,
      code: "NOT_AN_INTEGER",
    });
  });

  it("enforces minValue for valid integers", () => {
    expect(validateNumberAnswer(9, 10, null)).toEqual({
      valid: false,
      code: "LESS_THAN_MIN",
    });
    expect(validateNumberAnswer(10, 10, null)).toEqual({ valid: true });
    expect(validateNumberAnswer(11, 10, null)).toEqual({ valid: true });
  });

  it("enforces maxValue for valid integers", () => {
    expect(validateNumberAnswer(11, null, 10)).toEqual({
      valid: false,
      code: "GREATER_THAN_MAX",
    });
    expect(validateNumberAnswer(10, null, 10)).toEqual({ valid: true });
    expect(validateNumberAnswer(9, null, 10)).toEqual({ valid: true });
  });

  it("accepts valid integers within min and max bounds", () => {
    expect(validateNumberAnswer(5, 1, 10)).toEqual({ valid: true });
    expect(validateNumberAnswer(1, 1, 10)).toEqual({ valid: true });
    expect(validateNumberAnswer(10, 1, 10)).toEqual({ valid: true });
    expect(validateNumberAnswer(0, 0, 100)).toEqual({ valid: true });
    expect(validateNumberAnswer(-5, -10, 0)).toEqual({ valid: true });
  });

  it("accepts valid integers when no bounds are specified", () => {
    expect(validateNumberAnswer(0)).toEqual({ valid: true });
    expect(validateNumberAnswer(42)).toEqual({ valid: true });
    expect(validateNumberAnswer(-100)).toEqual({ valid: true });
  });
});

describe("isValidNumberAnswer", () => {
  it("returns true for valid integers", () => {
    expect(isValidNumberAnswer(5)).toBe(true);
    expect(isValidNumberAnswer(5, 1, 10)).toBe(true);
  });

  it("returns false for invalid numbers, decimals, or out of bounds", () => {
    expect(isValidNumberAnswer("5")).toBe(false);
    expect(isValidNumberAnswer(3.7)).toBe(false);
    expect(isValidNumberAnswer(0, 1, 10)).toBe(false);
    expect(isValidNumberAnswer(15, 1, 10)).toBe(false);
  });
});
