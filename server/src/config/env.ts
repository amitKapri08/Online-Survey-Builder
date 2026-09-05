import "dotenv/config";
import ms from "ms";
import type { SignOptions } from "jsonwebtoken";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "15m") as NonNullable<
  SignOptions["expiresIn"]
>;

const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN
  ? (process.env.REFRESH_TOKEN_EXPIRES_IN as NonNullable<
      SignOptions["expiresIn"]
    >)
  : ("30d" as NonNullable<SignOptions["expiresIn"]>);

if (
  (typeof JWT_EXPIRES_IN === "string" &&
    !ms(JWT_EXPIRES_IN as ms.StringValue)) ||
  (typeof REFRESH_TOKEN_EXPIRES_IN === "string" &&
    !ms(REFRESH_TOKEN_EXPIRES_IN as ms.StringValue))
) {
  throw new Error(
    "JWT_EXPIRES_IN and REFRESH_TOKEN_EXPIRES_IN must be valid duration strings (e.g. 15m, 30d)",
  );
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

export const env = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  CORS_ORIGIN,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
};