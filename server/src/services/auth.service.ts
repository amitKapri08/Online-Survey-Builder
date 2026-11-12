import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import {
  signToken,
  generateRefreshToken,
  hashRefreshToken,
} from "../utils/jwt.js";
import { getRefreshTokenExpiryDate } from "../utils/cookies.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

const SALT_ROUNDS = 12;

async function issueTokens(user: { id: string; role: "USER" | "ADMIN" }) {
  const accessToken = signToken({ userId: user.id, role: user.role });

  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const familyId = `family-${user.id}-${randomUUID()}`;

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      familyId,
      tokenHash,
      expiresAt: getRefreshTokenExpiryDate(),
    },
  });

  return { accessToken, refreshToken };
}

export const registerUser = async (input: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
  });

  if (existingUser) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      throw new AppError("Email already registered", 409);
    }
    throw error;
  }

  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (input: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: input.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  const { password: _, ...userWithoutPassword } = user;
  const { accessToken, refreshToken } = await issueTokens(user);

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};
