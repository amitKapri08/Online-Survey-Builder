import type { Request, Response, NextFunction } from "express";

import { loginSchema, registerSchema } from "../validators/auth.validator.js";
import { loginUser, registerUser } from "../services/auth.service.js";
import {
  clearAuthCookie,
  clearRefreshTokenCookie,
  clearCsrfCookie,
  REFRESH_COOKIE_NAME,
  setAuthCookie,
  setRefreshTokenCookie,
} from "../utils/cookies.js";
import { hashRefreshToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = registerSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await registerUser(input);

    setAuthCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const input = loginSchema.parse(req.body);

    const { user, accessToken, refreshToken } = await loginUser(input);

    setAuthCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (refreshToken) {
    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshSession.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  clearAuthCookie(res);
  clearRefreshTokenCookie(res);
  clearCsrfCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
