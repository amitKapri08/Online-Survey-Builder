import type { CookieOptions, Response } from "express";
import ms from "ms";

import { env } from "../config/env.js";

const AUTH_COOKIE_NAME = "token";
const CSRF_COOKIE_NAME = "csrf-token";
const REFRESH_COOKIE_NAME = "refresh-token";
const VISITOR_COOKIE_NAME = "visitor-id";

// Every cookie set by the API shares these attributes. Keeping them in one
// place guarantees that clearCookie() uses exactly the same attributes as the
// original Set-Cookie header, otherwise the browser keeps the stale cookie.
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE,
  path: "/",
};

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
    ...baseCookieOptions,
    maxAge: parseDuration(env.JWT_EXPIRES_IN),
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(AUTH_COOKIE_NAME, baseCookieOptions);
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...baseCookieOptions,
    maxAge: parseDuration(env.REFRESH_TOKEN_EXPIRES_IN),
  });
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
};

export const setCsrfCookie = (res: Response, token: string): void => {
  res.cookie(CSRF_COOKIE_NAME, token, baseCookieOptions);
};

export const clearCsrfCookie = (res: Response): void => {
  res.clearCookie(CSRF_COOKIE_NAME, baseCookieOptions);
};

export const setVisitorCookie = (res: Response, visitorId: string): void => {
  res.cookie(VISITOR_COOKIE_NAME, visitorId, {
    ...baseCookieOptions,
    maxAge: 365 * 24 * 60 * 60 * 1000,
  });
};

export {
  AUTH_COOKIE_NAME,
  CSRF_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  VISITOR_COOKIE_NAME,
};
