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
  totalViews: number;
  totalQuestions: number;
  surveysByStatus: {
    draft: number;
    published: number;
    closed: number;
  };
}

export interface AdminAuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminAuditLogsResponse {
  logs: AdminAuditLogEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}