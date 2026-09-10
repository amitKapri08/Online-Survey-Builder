import { describe, expect, it } from "vitest";
import jwt from "jsonwebtoken";
import {
  signToken,
  verifyToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../../utils/jwt.js";
import { env } from "../../config/env.js";

describe("signToken", () => {
  it("returns a valid JWT string", () => {
    const token = signToken({ userId: "user-1", role: "USER" });
    expect(typeof token).toBe("string");
    const parts = token.split(".");
    expect(parts).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  it("returns the original payload after sign and verify roundtrip", () => {
    const payload = { userId: "user-123", role: "ADMIN" as const };
    const token = signToken(payload);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("user-123");
    expect(decoded.role).toBe("ADMIN");
  });

  it("throws for an invalid token", () => {
    expect(() => verifyToken("invalid.token.here")).toThrow();
  });

  it("throws for a tampered token", () => {
    const token = signToken({ userId: "user-1", role: "USER" });
    const parts = token.split(".");
    parts[1] = "tampered";
    expect(() => verifyToken(parts.join("."))).toThrow();
  });

  it("throws for an expired token", () => {
    const token = jwt.sign(
      { userId: "user-1", role: "USER" },
      env.JWT_SECRET,
      { expiresIn: "-1s" },
    );
    expect(() => verifyToken(token)).toThrow(jwt.TokenExpiredError);
  });
});

describe("generateRefreshToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateRefreshToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("generates unique tokens on each call", () => {
    const t1 = generateRefreshToken();
    const t2 = generateRefreshToken();
    expect(t1).not.toBe(t2);
  });
});

describe("hashRefreshToken", () => {
  it("returns a 64-character hex string (SHA-256)", () => {
    const token = generateRefreshToken();
    const hash = hashRefreshToken(token);
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("is deterministic for the same input", () => {
    const token = "some-token-value";
    const hash1 = hashRefreshToken(token);
    const hash2 = hashRefreshToken(token);
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", () => {
    const hash1 = hashRefreshToken("token-a");
    const hash2 = hashRefreshToken("token-b");
    expect(hash1).not.toBe(hash2);
  });
});
