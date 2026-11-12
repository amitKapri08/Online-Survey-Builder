import type { Request, Response, NextFunction } from "express";

import { hashRefreshToken, generateRefreshToken, signToken } from "../utils/jwt.js";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { setAuthCookie, setRefreshTokenCookie } from "../utils/cookies.js";

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

    if (!session || session.revokedAt !== null) {
      throw new AppError("Invalid or revoked refresh token", 401);
    }

    if (session.expiresAt < new Date()) {
      throw new AppError("Refresh token expired", 401);
    }

    await prisma.refreshSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const familyId = session.familyId;

    await prisma.refreshSession.create({
      data: {
        userId: session.userId,
        familyId,
        tokenHash: newTokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = signToken({
      userId: session.userId,
      role: "USER",
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