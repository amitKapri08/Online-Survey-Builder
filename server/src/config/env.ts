import "dotenv/config";
import type { SignOptions } from "jsonwebtoken";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "1d") as NonNullable<
  SignOptions["expiresIn"]
>;

export const env = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET,
  JWT_EXPIRES_IN,
};
