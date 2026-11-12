import { prisma } from "../config/prisma.js";

export const getAllUsers = async (query: { page: number; limit: number; search?: string }) => {
  const { page, limit, search } = query;
  const skip = (page - 1) * limit;

  const where = {
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
    prisma.user.count(),
    prisma.survey.count(),
    prisma.response.count(),
  ]);

  return {
    totalUsers,
    totalSurveys,
    totalResponses,
  };
};
