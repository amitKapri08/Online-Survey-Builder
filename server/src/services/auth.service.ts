import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signToken, generateRefreshToken, hashRefreshToken } from "../utils/jwt.js";
import type {
  LoginInput,
  RegisterInput,
} from "../validators/auth.validator.js";

const SALT_ROUNDS = 12;

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

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: passwordHash,
      role: "USER",
    },
  });

  const accessToken = signToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  const familyId = `family-${user.id}-${Date.now()}`;

  const refreshSession = await prisma.refreshSession.create({
    data: {
      userId: user.id,
      familyId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

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
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = signToken({
    userId: user.id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);

  const familyId = `family-${user.id}-${Date.now()}`;

  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      familyId,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
};
