import type { Request, Response, NextFunction } from "express";

import {
  changePassword as changePasswordService,
} from "../services/auth.service.js";
import { getUserById, updateProfile as updateProfileService } from "../services/user.service.js";
import { AppError } from "../utils/AppError.js";
import {
  setAuthCookie,
  setRefreshTokenCookie,
} from "../utils/cookies.js";
import {
  changePasswordSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const user = await getUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const input = updateProfileSchema.parse(req.body);
    const user = await updateProfileService(req.user.id, input.name);

    res.status(200).json({
      success: true,
      message: "Profile updated",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const input = changePasswordSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await changePasswordService(
      req.user.id,
      input,
    );

    setAuthCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};