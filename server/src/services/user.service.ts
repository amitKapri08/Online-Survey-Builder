import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} as const;

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: USER_SELECT,
  });

  if (!user || user.deletedAt) {
    throw new AppError("User not found", 404);
  }

  const { deletedAt, ...safeUser } = user;
  return safeUser;
};

export const updateProfile = async (userId: string, name: string) => {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { deletedAt: true },
  });

  if (!existing || existing.deletedAt) {
    throw new AppError("User not found", 404);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name },
    select: USER_SELECT,
  });

  const { deletedAt, ...safeUser } = user;
  return safeUser;
};
