import bcrypt from "bcrypt";

import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { signToken } from "../utils/jwt.js";
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

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return {
    user,
    token,
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

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return {
    user,
    token,
  };
};
