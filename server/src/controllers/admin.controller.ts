import type { Request, Response, NextFunction } from "express";

import { getAllUsers, getAllSurveys, getStats } from "../services/admin.service.js";
import { adminQuerySchema } from "../validators/admin.validator.js";

export const handleListUsers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, search } = adminQuerySchema.parse(req.query);
    const result = await getAllUsers({ page, limit, ...(search !== undefined && { search }) });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleListSurveys = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, search, status } = adminQuerySchema.parse(req.query);
    const result = await getAllSurveys({
      page,
      limit,
      ...(status !== undefined && { status }),
      ...(search !== undefined && { search }),
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await getStats();

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};