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

export const getUserDashboardData = async (userId: string) => {
  const [
    totalSurveys,
    publishedSurveys,
    draftSurveys,
    closedSurveys,
    totalResponses,
    viewsAggregate,
    recentSurveys,
    recentResponses,
  ] = await Promise.all([
    prisma.survey.count({ where: { userId } }),
    prisma.survey.count({ where: { userId, status: "PUBLISHED" } }),
    prisma.survey.count({ where: { userId, status: "DRAFT" } }),
    prisma.survey.count({ where: { userId, status: "CLOSED" } }),
    prisma.response.count({ where: { survey: { userId } } }),
    prisma.survey.aggregate({
      where: { userId },
      _sum: { viewCount: true },
    }),
    prisma.survey.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            questions: true,
            responses: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.response.findMany({
      where: { survey: { userId } },
      select: {
        id: true,
        createdAt: true,
        responderKey: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        survey: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalViews = viewsAggregate._sum.viewCount ?? 0;
  const completionRate =
    totalViews > 0
      ? Math.min(100, Math.round((totalResponses / totalViews) * 100))
      : 0;

  return {
    stats: {
      totalSurveys,
      publishedSurveys,
      draftSurveys,
      closedSurveys,
      totalResponses,
      totalViews,
      completionRate,
    },
    recentSurveys,
    recentResponses,
  };
};
