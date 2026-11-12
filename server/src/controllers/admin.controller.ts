import type { Request, Response, NextFunction } from "express";

import {
  getAllUsers,
  getAllSurveys,
  getStats,
  softDeleteUser,
  updateUserRole,
} from "../services/admin.service.js";
import { AppError } from "../utils/AppError.js";
import {
  adminQuerySchema,
  updateUserRoleSchema,
} from "../validators/admin.validator.js";

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

export const handleUpdateUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const targetUserId = req.params.id as string;
    const input = updateUserRoleSchema.parse(req.body);
    const user = await updateUserRole(req.user.id, targetUserId, input.role);

    res.status(200).json({
      success: true,
      message: "User role updated",
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const targetUserId = req.params.id as string;
    await softDeleteUser(req.user.id, targetUserId);

    res.status(200).json({
      success: true,
      message: "User deactivated",
    });
  } catch (error) {
    next(error);
  }
};