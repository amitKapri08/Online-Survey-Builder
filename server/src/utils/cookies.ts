import type { Response } from "express";
import ms from "ms";

import { env } from "../config/env.js";

const AUTH_COOKIE_NAME = "token";
const CSRF_COOKIE_NAME = "csrf-token";
const REFRESH_COOKIE_NAME = "refresh-token";
const VISITOR_COOKIE_NAME = "visitor-id";

function parseDuration(duration: string | number): number {
  if (typeof duration === "number") {
    return duration * 1000;
  }

  const parsed = ms(duration as ms.StringValue);
  if (!parsed) {
    throw new Error(`Invalid duration value: ${duration}`);
  }
  return parsed;
}

export const getRefreshTokenExpiryDate = (): Date => {
  return new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_EXPIRES_IN));
};

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
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
  });
};

export const setVisitorCookie = (res: Response, visitorId: string): void => {
  res.cookie(VISITOR_COOKIE_NAME, visitorId, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
};

export { AUTH_COOKIE_NAME, CSRF_COOKIE_NAME, VISITOR_COOKIE_NAME };
