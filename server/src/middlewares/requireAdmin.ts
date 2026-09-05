import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const requireAdmin = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  if (!req.user || req.user.role !== "ADMIN") {
    throw new AppError("Admin access required", 403, "FORBIDDEN");
  }
  next();
};
