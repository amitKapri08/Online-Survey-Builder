import type { SurveyStatus } from "./survey";

export interface UserDashboardStats {
  totalSurveys: number;
  publishedSurveys: number;
  draftSurveys: number;
  closedSurveys: number;
  totalResponses: number;
  totalViews: number;
  completionRate: number;
}

export interface RecentSurvey {
  id: string;
  title: string;
  slug: string;
  status: SurveyStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
    responses: number;
  };
}

export interface RecentResponseActivity {
  id: string;
  createdAt: string;
  responderKey: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  survey: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface UserDashboardData {
  stats: UserDashboardStats;
  recentSurveys: RecentSurvey[];
  recentResponses: RecentResponseActivity[];
}
