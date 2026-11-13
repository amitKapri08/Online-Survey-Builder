import "dotenv/config";
import ms from "ms";
import type { SignOptions } from "jsonwebtoken";

const NODE_ENV = process.env.NODE_ENV || "development";
const isProduction = NODE_ENV === "production";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

if (isProduction && JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production");
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

const DEFAULT_CORS_ORIGIN = "http://localhost:5173";

// Accepts a comma-separated list and normalizes away trailing slashes so a
// value like "https://app.example.com/" still matches the browser's
// "Origin: https://app.example.com" header.
const CORS_ORIGINS = (process.env.CORS_ORIGIN || DEFAULT_CORS_ORIGIN)
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const [PRIMARY_CORS_ORIGIN] = CORS_ORIGINS;

if (!PRIMARY_CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN must contain at least one origin");
}

if (
  isProduction &&
  CORS_ORIGINS.some((origin) => /localhost|127\.0\.0\.1/.test(origin))
) {
  throw new Error(
    "CORS_ORIGIN must be set to the deployed frontend origin in production (localhost is not allowed)",
  );
}

const SAME_SITE_VALUES = ["lax", "strict", "none"] as const;
type SameSite = (typeof SAME_SITE_VALUES)[number];

const rawSameSite =
  process.env.COOKIE_SAME_SITE || (isProduction ? "none" : "lax");

if (!SAME_SITE_VALUES.includes(rawSameSite as SameSite)) {
  throw new Error(
    `COOKIE_SAME_SITE must be one of: ${SAME_SITE_VALUES.join(", ")}`,
  );
}

const COOKIE_SAME_SITE = rawSameSite as SameSite;

// Browsers reject SameSite=None cookies that are not also Secure, and Secure
// requires HTTPS, which is why this combination is only valid in production.
if (COOKIE_SAME_SITE === "none" && !isProduction) {
  throw new Error(
    "COOKIE_SAME_SITE=none requires HTTPS. Leave it unset outside production.",
  );
}

export const env = {
  PORT: Number(process.env.PORT) || 8000,
  NODE_ENV,
  isProduction,
  CORS_ORIGIN: PRIMARY_CORS_ORIGIN,
  CORS_ORIGINS,
  COOKIE_SAME_SITE,
  COOKIE_SECURE: isProduction,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
};
