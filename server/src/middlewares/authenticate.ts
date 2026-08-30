import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError.js";
import { AUTH_COOKIE_NAME } from "../utils/cookies.js";
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      throw new AppError("Authentication required", 401);
    }

    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};
