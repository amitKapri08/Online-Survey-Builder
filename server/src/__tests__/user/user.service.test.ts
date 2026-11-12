import { describe, it, expect, beforeEach } from "vitest";
import {
  createUser,
  createSurvey,
  createResponse,
  createQuestion,
  TestUser,
} from "../helpers.js";
import {
  getUserById,
  updateProfile,
  getUserDashboardData,
} from "../../services/user.service.js";

let user: TestUser;

beforeEach(async () => {
  user = await createUser({ email: "profile@test.com", name: "Profile User" });
});

describe("getUserById", () => {
  it("returns user data without deletedAt", async () => {
    const result = await getUserById(user.id);
    expect(result.id).toBe(user.id);
    expect(result.name).toBe("Profile User");
    expect(result.email).toBe("profile@test.com");
    expect(result.role).toBe("USER");
    expect(result).not.toHaveProperty("deletedAt");
  });

  it("throws for nonexistent user", async () => {
    await expect(
      getUserById("00000000-0000-0000-0000-000000000000"),
    ).rejects.toThrow("User not found");
  });

  it("throws for soft-deleted user", async () => {
    const deleted = await createUser({
      email: "deleted@test.com",
      deletedAt: new Date(),
    });
    await expect(getUserById(deleted.id)).rejects.toThrow("User not found");
  });
});

describe("updateProfile", () => {
  it("updates user name", async () => {
    const result = await updateProfile(user.id, "New Name");
    expect(result.name).toBe("New Name");
    expect(result.id).toBe(user.id);
  });

  it("throws for nonexistent user", async () => {
    await expect(
      updateProfile("00000000-0000-0000-0000-000000000000", "Name"),
    ).rejects.toThrow("User not found");
  });

  it("throws for soft-deleted user", async () => {
    const deleted = await createUser({
      email: "deleted-update@test.com",
      deletedAt: new Date(),
    });
    await expect(updateProfile(deleted.id, "Name")).rejects.toThrow(
      "User not found",
    );
  });
});

describe("getUserDashboardData", () => {
  it("returns stats for user with surveys and responses", async () => {
    const survey1 = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const survey2 = await createSurvey({ userId: user.id, status: "DRAFT" });
    const survey3 = await createSurvey({
      userId: user.id,
      status: "CLOSED",
    });

    const question = await createQuestion({
      surveyId: survey1.id,
      questionType: "SHORT_TEXT",
    });
    await createResponse({
      surveyId: survey1.id,
      userId: user.id,
      responderKey: "resp-1",
    });
    await createResponse({
      surveyId: survey1.id,
      responderKey: "resp-2",
    });

    const data = await getUserDashboardData(user.id);

    expect(data.stats.totalSurveys).toBe(3);
    expect(data.stats.publishedSurveys).toBe(1);
    expect(data.stats.draftSurveys).toBe(1);
    expect(data.stats.closedSurveys).toBe(1);
    expect(data.stats.totalResponses).toBe(2);
    expect(data.stats.totalViews).toBe(0);
    expect(typeof data.stats.completionRate).toBe("number");
    expect(data.recentSurveys.length).toBe(3);
    expect(data.recentResponses.length).toBe(2);
  });

  it("returns zero stats for user with no surveys", async () => {
    const data = await getUserDashboardData(user.id);

    expect(data.stats.totalSurveys).toBe(0);
    expect(data.stats.publishedSurveys).toBe(0);
    expect(data.stats.draftSurveys).toBe(0);
    expect(data.stats.closedSurveys).toBe(0);
    expect(data.stats.totalResponses).toBe(0);
    expect(data.stats.totalViews).toBe(0);
    expect(data.stats.completionRate).toBe(0);
    expect(data.recentSurveys).toEqual([]);
    expect(data.recentResponses).toEqual([]);
  });

  it("limits recent surveys to 5", async () => {
    for (let i = 0; i < 7; i++) {
      await createSurvey({ userId: user.id, status: "DRAFT" });
    }

    const data = await getUserDashboardData(user.id);
    expect(data.recentSurveys.length).toBe(5);
  });

  it("limits recent responses to 5", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      allowMultipleResponses: true,
    });

    for (let i = 0; i < 7; i++) {
      await createResponse({
        surveyId: survey.id,
        responderKey: `resp-${i}`,
      });
    }

    const data = await getUserDashboardData(user.id);
    expect(data.recentResponses.length).toBe(5);
  });

  it("calculates completion rate correctly", async () => {
    const survey = await createSurvey({
      userId: user.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });

    // Manually set viewCount via prisma
    const { prisma } = await import("../../config/prisma.js");
    await prisma.survey.update({
      where: { id: survey.id },
      data: { viewCount: 100 },
    });

    for (let i = 0; i < 25; i++) {
      await createResponse({
        surveyId: survey.id,
        responderKey: `resp-${i}`,
      });
    }

    const data = await getUserDashboardData(user.id);
    expect(data.stats.totalViews).toBe(100);
    expect(data.stats.completionRate).toBe(25);
  });
});
