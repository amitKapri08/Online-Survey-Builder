import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/AppError.js";
import { verifyCsrfToken } from "../utils/csrf.js";

export const csrf = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const headerToken = req.headers["x-csrf-token"] as string | undefined;
  const cookieToken = req.cookies?.["csrf-token"];

  if (!verifyCsrfToken(headerToken, cookieToken)) {
    throw new AppError("Invalid CSRF token", 403);
  }

  next();
};
