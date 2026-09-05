import type { Request, Response, NextFunction } from "express";

import {
  hashRefreshToken,
  generateRefreshToken,
  signToken,
} from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  setAuthCookie,
  setRefreshTokenCookie,
  getRefreshTokenExpiryDate,
} from "../utils/cookies.js";

export const refresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.["refresh-token"];

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401);
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const session = await prisma.refreshSession.findUnique({
      where: {
        tokenHash,
      },
    });

    if (!session) {
      throw new AppError("Invalid refresh token", 401);
    }

    if (session.revokedAt !== null) {
      await prisma.refreshSession.updateMany({
        where: { familyId: session.familyId },
        data: { revokedAt: new Date() },
      });
      throw new AppError("Refresh token has been revoked", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      throw new AppError("User not found", 401);
    }

    const [{ count }] = await prisma.$transaction([
      prisma.refreshSession.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
    ]);

    if (count === 0) {
      await prisma.refreshSession.updateMany({
        where: { familyId: session.familyId },
        data: { revokedAt: new Date() },
      });
      throw new AppError("Refresh token has been reused", 401);
    }

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    await prisma.refreshSession.create({
      data: {
        userId: session.userId,
        familyId: session.familyId,
        tokenHash: newTokenHash,
        expiresAt: getRefreshTokenExpiryDate(),
      },
    });

    const accessToken = signToken({
      userId: session.userId,
      role: user.role,
    });

    setAuthCookie(res, accessToken);
    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};
