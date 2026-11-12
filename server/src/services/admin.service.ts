import { prisma } from "../config/prisma.js";
import type { Prisma } from "../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";

const ACTIVE_USER_WHERE = { deletedAt: null } as const;

async function writeAuditLog(input: {
  actorId: string;
  action: string;
  targetId?: string;
  details?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      targetId: input.targetId ?? null,
      ...(input.details ? { details: input.details } : {}),
    },
  });
}

export { writeAuditLog };

export const getAllUsers = async (query: { page: number; limit: number; search?: string }) => {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...ACTIVE_USER_WHERE,
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            surveys: true,
            responses: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getAllSurveys = async (query: { page: number; limit: number; status?: string; search?: string }) => {
  const { page, limit, status, search } = query;
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status: status as "DRAFT" | "PUBLISHED" | "CLOSED" }),
    ...(search && {
      title: { contains: search, mode: "insensitive" as const },
    }),
  };

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.survey.count({ where }),
  ]);

  return {
    surveys,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getStats = async () => {
  const [totalUsers, totalSurveys, totalResponses] = await Promise.all([
    prisma.user.count({ where: ACTIVE_USER_WHERE }),
    prisma.survey.count(),
    prisma.response.count(),
  ]);

  return {
    totalUsers,
    totalSurveys,
    totalResponses,
  };
};

export const updateUserRole = async (
  actorId: string,
  targetUserId: string,
  role: "USER" | "ADMIN",
) => {
  if (targetUserId === actorId) {
    throw new AppError(
      "You cannot change your own role",
      400,
      "SELF_ROLE_CHANGE",
    );
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, deletedAt: true },
  });

  if (!target || target.deletedAt) {
    throw new AppError("User not found", 404);
  }

  if (target.role === role) {
    throw new AppError("User already has this role", 400);
  }

  const user = await prisma.user.update({
    where: { id: targetUserId },
    data: { role },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  await writeAuditLog({
    actorId,
    action: "USER_ROLE_CHANGED",
    targetId: targetUserId,
    details: { from: target.role, to: role },
  });

  return user;
};

export const softDeleteUser = async (actorId: string, targetUserId: string) => {
  if (targetUserId === actorId) {
    throw new AppError("You cannot delete your own account", 400, "SELF_DELETE");
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true, deletedAt: true },
  });

  if (!target || target.deletedAt) {
    throw new AppError("User not found", 404);
  }

  if (target.role === "ADMIN") {
    throw new AppError("Admin accounts cannot be deleted", 400);
  }

  const deletedAt = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: targetUserId },
      data: { deletedAt },
    }),
    prisma.refreshSession.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: deletedAt },
    }),
  ]);

  await writeAuditLog({
    actorId,
    action: "USER_DELETED",
    targetId: targetUserId,
    details: { soft: true },
  });

  return { id: targetUserId, deletedAt };
};
