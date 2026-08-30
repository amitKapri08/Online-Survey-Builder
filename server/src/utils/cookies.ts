import type { Response } from "express";

import { env } from "../config/env.js";

const AUTH_COOKIE_NAME = "token";
const CSRF_COOKIE_NAME = "csrf-token";
const REFRESH_COOKIE_NAME = "refresh-token";

function parseDuration(duration: string | number): number {
  const num = typeof duration === "number" ? duration : parseInt(String(duration), 10);
  const match = String(num).match(/^(\d+)(d|h|m|s)$/);
  if (!match || !match[1]) {
    return 24 * 60 * 60 * 1000;
  }
  const value = parseInt(match[1], 10);
  const unit = match![2];
  switch (unit) {
    case "d":
      return value * 24 * 60 * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "m":
      return value * 60 * 1000;
    case "s":
      return value * 1000;
    default:
      return 24 * 60 * 60 * 1000;
  }
}

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: parseDuration(env.JWT_EXPIRES_IN),
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: parseDuration(env.REFRESH_TOKEN_EXPIRES_IN),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: false,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME };
