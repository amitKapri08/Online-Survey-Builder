import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";

const expectedOrigin = env.CORS_ORIGIN;

export const originCheck = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const origin = req.headers.origin;

  // When Origin is absent (e.g. same-site browser requests, server-to-server
  // calls), we deliberately pass through. This check is defense-in-depth
  // alongside CSRF token validation, not a standalone guard.
  if (origin) {
    if (origin !== expectedOrigin) {
      throw new AppError("Invalid origin", 403);
    }
  }

  next();
};
