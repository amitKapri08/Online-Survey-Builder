import { describe, expect, it } from "vitest";
import { getUserDashboard } from "@/services/user.service";

describe("user.service", () => {
  it("getUserDashboard returns stats and recent activity", async () => {
    const data = await getUserDashboard();
    expect(data.stats.totalSurveys).toBe(3);
    expect(data.stats.publishedSurveys).toBe(1);
    expect(data.stats.completionRate).toBe(20);
    expect(data.recentSurveys.length).toBeGreaterThan(0);
    expect(data.recentResponses.length).toBeGreaterThan(0);
  });
});