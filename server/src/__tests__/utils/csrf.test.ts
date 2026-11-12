import { describe, expect, it } from "vitest";
import {
  generateCsrfToken,
  verifyCsrfToken,
} from "../../utils/csrf.js";

describe("generateCsrfToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateCsrfToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("generates unique tokens on each call", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(token1).not.toBe(token2);
  });
});

describe("verifyCsrfToken", () => {
  it("returns true for matching tokens", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, token)).toBe(true);
  });

  it("returns false for different tokens of same length", () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();
    expect(verifyCsrfToken(token1, token2)).toBe(false);
  });

  it("returns false when header token is undefined", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(undefined, token)).toBe(false);
  });

  it("returns false when cookie token is undefined", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken(token, undefined)).toBe(false);
  });

  it("returns false when both tokens are undefined", () => {
    expect(verifyCsrfToken(undefined, undefined)).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(verifyCsrfToken("", "")).toBe(false);
  });

  it("returns false when header token is empty string", () => {
    const token = generateCsrfToken();
    expect(verifyCsrfToken("", token)).toBe(false);
  });

  it("returns false for tokens of different lengths", () => {
    expect(verifyCsrfToken("abc", "abcdef")).toBe(false);
  });

  it("returns false for non-string types", () => {
    expect(verifyCsrfToken(null as unknown as string, "token")).toBe(false);
    expect(verifyCsrfToken("token", null as unknown as string)).toBe(false);
  });
});
