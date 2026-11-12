import type { SurveyCounts, SurveyStatus } from "./survey";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    surveys: number;
    responses: number;
  };
}

export interface AdminSurvey {
  id: string;
  title: string;
  slug: string;
  status: SurveyStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string; email: string };
  _count: SurveyCounts;
}

export interface AdminStats {
  totalUsers: number;
  totalSurveys: number;
  totalResponses: number;
}