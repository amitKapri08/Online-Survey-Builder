import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

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
      throw new AppError("Authentication required", 401, "UNAUTHENTICATED");
    }

    const payload = verifyToken(token);

    req.user = {
      id: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(
        new AppError("Access token has expired", 401, "ACCESS_TOKEN_EXPIRED"),
      );
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError("Invalid access token", 401, "ACCESS_TOKEN_INVALID"));
      return;
    }

    next(error);
  }
};
