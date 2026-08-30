import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

const expectedOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

export const originCheck = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const origin = req.headers.origin;

  if (origin) {
    if (origin !== expectedOrigin) {
      throw new AppError("Invalid origin", 403);
    }
  }

  next();
};