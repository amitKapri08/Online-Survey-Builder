import { http, HttpResponse } from "msw";

import type { PublicSurvey, SurveyDetail, SurveyListItem, SurveyQuestion } from "@/types/survey";
import type { UserDashboardData } from "@/types/dashboard";
import type { AdminStats, AdminSurvey, AdminUser } from "@/types/admin";

const base = "http://localhost:8000/api";

export const mockAuthUser = {
  id: "user-1",
  name: "Me User",
  email: "me@test.com",
  role: "USER",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
} as const;

export const mockCsrfToken = "mock-csrf-token-12345678901234567890123456789012";

export const mockDashboardData: UserDashboardData = {
  stats: {
    totalSurveys: 3,
    publishedSurveys: 1,
    draftSurveys: 1,
    closedSurveys: 1,
    totalResponses: 12,
    totalViews: 60,
    completionRate: 20,
  },
  recentSurveys: [
    {
      id: "survey-1",
      title: "My Published Survey",
      slug: "my-published-survey",
      status: "PUBLISHED",
      viewCount: 60,
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-02-10T00:00:00.000Z",
      _count: { questions: 5, responses: 12 },
    },
  ],
  recentResponses: [
    {
      id: "resp-1",
      createdAt: "2026-02-10T00:00:00.000Z",
      responderKey: null,
      user: { id: "user-9", name: "Responder One", email: "responder@test.com" },
      survey: { id: "survey-1", title: "My Published Survey", slug: "my-published-survey" },
    },
  ],
};

export const mockSurveyList: SurveyListItem[] = [
  {
    id: "survey-1",
    title: "My Published Survey",
    description: "A published survey",
    slug: "my-published-survey",
    status: "PUBLISHED",
    isAnonymous: false,
    allowMultipleResponses: false,
    viewCount: 60,
    publishedAt: "2026-02-10T00:00:00.000Z",
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
    _count: { questions: 5, responses: 12 },
  },
  {
    id: "survey-2",
    title: "Draft Survey",
    description: null,
    slug: "draft-survey",
    status: "DRAFT",
    isAnonymous: false,
    allowMultipleResponses: true,
    viewCount: 0,
    publishedAt: null,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    _count: { questions: 3, responses: 0 },
  },
];

export const mockQuestions: SurveyQuestion[] = [
  {
    id: "q-1",
    questionText: "What is your name?",
    questionType: "SHORT_TEXT",
    isRequired: true,
    position: 1,
    minValue: null,
    maxValue: null,
    options: [],
  },
  {
    id: "q-2",
    questionText: "Rate your experience",
    questionType: "RATING",
    isRequired: false,
    position: 2,
    minValue: 1,
    maxValue: 5,
    options: [],
  },
  {
    id: "q-3",
    questionText: "Pick an option",
    questionType: "SINGLE_CHOICE",
    isRequired: false,
    position: 3,
    minValue: null,
    maxValue: null,
    options: [
      { id: "opt-1", optionText: "Option A", position: 1 },
      { id: "opt-2", optionText: "Option B", position: 2 },
    ],
  },
];

const defaultQuestions = structuredClone(mockQuestions);

export function buildSurveyDetail(
  overrides: Partial<SurveyDetail> = {},
): SurveyDetail {
  return {
    ...mockSurveyList[0],
    ...overrides,
    user: { id: "user-1", name: "Me User", email: "me@test.com" },
    questions: structuredClone(mockQuestions),
  } as SurveyDetail;
}

export const mockPublicSurvey: PublicSurvey = {
  id: "survey-1",
  title: "My Published Survey",
  description: "A published survey",
  slug: "my-published-survey",
  status: "PUBLISHED",
  isAnonymous: false,
  allowMultipleResponses: false,
  questions: structuredClone(mockQuestions),
};

export const mockResponses = {
  responses: [
    {
      responseId: "resp-1",
      submittedAt: "2026-02-10T00:00:00.000Z",
      respondentType: "anonymous" as const,
      answers: [
        { questionId: "q-1", questionText: "What is your name?", questionType: "SHORT_TEXT", value: "Alice" },
        { questionId: "q-2", questionText: "Rate your experience", questionType: "RATING", value: 4 },
      ],
    },
  ],
  total: 1,
  page: 1,
  limit: 20,
  totalPages: 1,
};

export const mockAnalytics = [
  {
    type: "TEXT" as const,
    questionId: "q-1",
    questionText: "What is your name?",
    position: 1,
    total: 1,
    samples: [{ responseId: "resp-1", text: "Alice", submittedAt: "2026-02-10T00:00:00.000Z" }],
  },
  {
    type: "RATING" as const,
    questionId: "q-2",
    questionText: "Rate your experience",
    position: 2,
    total: 1,
    min: 1,
    max: 5,
    average: 4,
    distribution: [
      { value: 1, count: 0 },
      { value: 2, count: 0 },
      { value: 3, count: 0 },
      { value: 4, count: 1 },
      { value: 5, count: 0 },
    ],
  },
];

export const mockAdminUsers: AdminUser[] = [
  {
    id: "user-1",
    name: "Alice Admin",
    email: "alice@test.com",
    role: "ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
    _count: { surveys: 3, responses: 5 },
  },
  {
    id: "user-2",
    name: "Bob Builder",
    email: "bob@test.com",
    role: "USER",
    createdAt: "2026-02-01T00:00:00.000Z",
    _count: { surveys: 1, responses: 0 },
  },
  {
    id: "user-3",
    name: "Carol Creator",
    email: "carol@test.com",
    role: "USER",
    createdAt: "2026-03-01T00:00:00.000Z",
    _count: { surveys: 2, responses: 7 },
  },
  {
    id: "user-4",
    name: "Dave Designer",
    email: "dave@test.com",
    role: "USER",
    createdAt: "2026-04-01T00:00:00.000Z",
    _count: { surveys: 0, responses: 1 },
  },
  {
    id: "user-5",
    name: "Eve Evaluator",
    email: "eve@test.com",
    role: "USER",
    createdAt: "2026-05-01T00:00:00.000Z",
    _count: { surveys: 1, responses: 2 },
  },
];

export const mockAdminSurveys: AdminSurvey[] = [
  {
    id: "survey-1",
    title: "Customer Satisfaction Survey",
    slug: "customer-satisfaction-survey",
    status: "PUBLISHED",
    viewCount: 120,
    createdAt: "2026-01-10T00:00:00.000Z",
    updatedAt: "2026-02-10T00:00:00.000Z",
    user: { id: "user-1", name: "Alice Admin", email: "alice@test.com" },
    _count: { questions: 5, responses: 50 },
  },
  {
    id: "survey-2",
    title: "Employee Engagement Survey",
    slug: "employee-engagement-survey",
    status: "DRAFT",
    viewCount: 0,
    createdAt: "2026-02-05T00:00:00.000Z",
    updatedAt: "2026-02-05T00:00:00.000Z",
    user: { id: "user-2", name: "Bob Builder", email: "bob@test.com" },
    _count: { questions: 3, responses: 0 },
  },
  {
    id: "survey-3",
    title: "Product Feedback Survey",
    slug: "product-feedback-survey",
    status: "CLOSED",
    viewCount: 45,
    createdAt: "2026-03-15T00:00:00.000Z",
    updatedAt: "2026-03-20T00:00:00.000Z",
    user: { id: "user-3", name: "Carol Creator", email: "carol@test.com" },
    _count: { questions: 8, responses: 32 },
  },
];

export const mockAdminStats: AdminStats = {
  totalUsers: 100,
  totalSurveys: 200,
  totalResponses: 300,
  totalViews: 500,
  totalQuestions: 1000,
  surveysByStatus: {
    draft: 50,
    published: 100,
    closed: 50,
  },
};

export const mockFaults = {
  statsError: false,
};

const defaultAdminUsers = structuredClone(mockAdminUsers);
const defaultAdminSurveys = structuredClone(mockAdminSurveys);
const defaultPublicSurvey = structuredClone(mockPublicSurvey);

let currentSurveyDetail = buildSurveyDetail();
let surveyListState = structuredClone(mockSurveyList);

export function resetMockData() {
  mockAdminUsers.length = 0;
  mockAdminSurveys.length = 0;
  mockAdminUsers.push(...structuredClone(defaultAdminUsers));
  mockAdminSurveys.push(...structuredClone(defaultAdminSurveys));
  mockFaults.statsError = false;
  currentSurveyDetail = buildSurveyDetail();
  surveyListState = structuredClone(mockSurveyList);
  mockQuestions.length = 0;
  mockQuestions.push(...structuredClone(defaultQuestions));
  mockPublicSurvey.title = defaultPublicSurvey.title;
  mockPublicSurvey.description = defaultPublicSurvey.description;
  mockPublicSurvey.slug = defaultPublicSurvey.slug;
  mockPublicSurvey.status = defaultPublicSurvey.status;
  mockPublicSurvey.isAnonymous = defaultPublicSurvey.isAnonymous;
  mockPublicSurvey.allowMultipleResponses =
    defaultPublicSurvey.allowMultipleResponses;
  mockPublicSurvey.questions.length = 0;
  mockPublicSurvey.questions.push(...structuredClone(defaultPublicSurvey.questions));
}

type UsersResponse = {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type SurveysResponse = {
  surveys: AdminSurvey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const handlers = [
  http.get(`${base}/admin/stats`, () => {
    if (mockFaults.statsError) {
      return HttpResponse.json(
        { success: false, message: "Internal server error" },
        { status: 500 },
      );
    }
    return HttpResponse.json({ success: true, data: { stats: mockAdminStats } });
  }),

  http.get(`${base}/admin/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let filtered = mockAdminUsers;
    if (search) {
      filtered = mockAdminUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search),
      );
    }

    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    const data: UsersResponse = {
      users: slice,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
    return HttpResponse.json({ success: true, data });
  }),

  http.get(`${base}/admin/surveys`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    const status = url.searchParams.get("status");

    let filtered = mockAdminSurveys;
    if (status) {
      filtered = mockAdminSurveys.filter((s) => s.status === status);
    }

    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    const data: SurveysResponse = {
      surveys: slice,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
    return HttpResponse.json({ success: true, data });
  }),

  http.patch(`${base}/admin/users/:id/role`, async ({ params, request }) => {
    const body = (await request.json()) as { role?: string };
    const id = params.id as string;
    const user = mockAdminUsers.find((u) => u.id === id);
    if (!user) {
      return HttpResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    const updated: AdminUser = {
      ...user,
      role: (body.role ?? user.role) as AdminUser["role"],
    };
    if (body.role) {
      const idx = mockAdminUsers.findIndex((u) => u.id === id);
      mockAdminUsers[idx] = updated;
    }
    return HttpResponse.json({ success: true, data: { user: updated } });
  }),

  http.delete(`${base}/admin/users/:id`, ({ params }) => {
    const id = params.id as string;
    const idx = mockAdminUsers.findIndex((u) => u.id === id);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }
    mockAdminUsers.splice(idx, 1);
    return HttpResponse.json({ success: true, message: "User deactivated" });
  }),

  http.get(`${base}/admin/audit-logs`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "10");
    return HttpResponse.json({
      success: true,
      data: {
        logs: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      },
    });
  }),

  // ------------------------------------------------------------------
  // Auth + user
  // ------------------------------------------------------------------
  http.get(`${base}/auth/csrf`, () => {
    return HttpResponse.json({
      success: true,
      data: { csrfToken: mockCsrfToken },
    });
  }),

  http.post(`${base}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json(
        { success: false, message: "Invalid registration payload" },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        message: "Registered successfully",
        data: {
          user: {
            id: "new-user-1",
            name: body.name,
            email: body.email.toLowerCase(),
            role: "USER",
            createdAt: "2026-09-01T00:00:00.000Z",
            updatedAt: "2026-09-01T00:00:00.000Z",
          },
        },
      },
      { status: 201 },
    );
  }),

  http.post(`${base}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (!body.email || body.email !== "me@test.com") {
      return HttpResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      success: true,
      message: "Logged in",
      data: { user: { ...mockAuthUser } },
    });
  }),

  http.post(`${base}/auth/logout`, () => {
    return HttpResponse.json({ success: true, message: "Logged out" });
  }),

  http.post(`${base}/auth/refresh`, () => {
    return HttpResponse.json({ success: true, message: "Refreshed" });
  }),

  http.get(`${base}/users/me`, () => {
    return HttpResponse.json({ success: true, data: { user: { ...mockAuthUser } } });
  }),

  http.patch(`${base}/users/profile`, async ({ request }) => {
    const body = (await request.json()) as { name?: string };
    return HttpResponse.json({
      success: true,
      message: "Profile updated",
      data: {
        user: { ...mockAuthUser, name: body.name ?? mockAuthUser.name },
      },
    });
  }),

  http.post(`${base}/users/password`, () => {
    return HttpResponse.json({ success: true, message: "Password changed" });
  }),

  http.get(`${base}/users/dashboard`, () => {
    return HttpResponse.json({ success: true, data: mockDashboardData });
  }),

  // ------------------------------------------------------------------
  // Surveys CRUD
  // ------------------------------------------------------------------
  http.get(`${base}/surveys`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? "1");
    const limit = Number(url.searchParams.get("limit") ?? "20");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search")?.toLowerCase() ?? "";

    let filtered = surveyListState;
    if (status) filtered = surveyListState.filter((s) => s.status === status);
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(search) ||
          s.description?.toLowerCase().includes(search),
      );
    }

    const start = (page - 1) * limit;
    const slice = filtered.slice(start, start + limit);

    return HttpResponse.json({
      success: true,
      data: {
        surveys: slice,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  }),

  http.post(`${base}/surveys`, async ({ request }) => {
    const body = (await request.json()) as { title?: string };
    const newSurvey = buildSurveyDetail({
      id: "survey-new-1",
      title: body.title ?? "New Survey",
      status: "DRAFT",
      publishedAt: null,
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    });
    surveyListState.unshift(structuredClone(newSurvey));
    return HttpResponse.json(
      { success: true, data: { survey: newSurvey } },
      { status: 201 },
    );
  }),

  http.get(`${base}/surveys/slug/:slug`, ({ params }) => {
    const slug = params.slug as string;
    if (!mockPublicSurvey || mockPublicSurvey.slug !== slug) {
      return HttpResponse.json(
        { success: false, message: "Survey not found" },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: { survey: mockPublicSurvey } });
  }),

  http.get(`${base}/surveys/:id`, ({ params }) => {
    const id = params.id as string;
    if (!currentSurveyDetail || id !== currentSurveyDetail.id) {
      return HttpResponse.json(
        { success: false, message: "Survey not found" },
        { status: 404 },
      );
    }
    const detail: SurveyDetail = {
      ...currentSurveyDetail,
      user: { id: mockAuthUser.id, name: mockAuthUser.name, email: mockAuthUser.email },
      questions: structuredClone(mockQuestions) as unknown as SurveyQuestion[],
    };
    return HttpResponse.json({ success: true, data: { survey: detail } });
  }),

  http.patch(`${base}/surveys/:id`, async ({ params, request }) => {
    const id = params.id as string;
    const body = (await request.json()) as Record<string, unknown>;
    const updated = buildSurveyDetail({
      id,
      title: (body.title as string) ?? currentSurveyDetail.title,
      status: (body.status as SurveyDetail["status"]) ?? currentSurveyDetail.status,
    });
    currentSurveyDetail = updated;
    return HttpResponse.json({ success: true, data: { survey: updated } });
  }),

  http.delete(`${base}/surveys/:id`, ({ params }) => {
    const id = params.id as string;
    surveyListState = surveyListState.filter((s) => s.id !== id);
    return HttpResponse.json({ success: true, message: "Survey deleted" });
  }),

  http.post(`${base}/surveys/:id/duplicate`, ({ params }) => {
    const id = params.id as string;
    const duplicated = buildSurveyDetail({
      id: `survey-copy-${id}`,
      title: `${currentSurveyDetail.title} (Copy)`,
      status: "DRAFT",
    });
    return HttpResponse.json(
      { success: true, data: { survey: duplicated } },
      { status: 201 },
    );
  }),

  http.post(`${base}/surveys/:id/view`, () => {
    return HttpResponse.json({ success: true, message: "View recorded" });
  }),

  http.post(`${base}/surveys/:id/responses`, async ({ request }) => {
    const body = (await request.json()) as { answers?: unknown[] };
    if (!body.answers) {
      return HttpResponse.json(
        { success: false, message: "Answers are required" },
        { status: 400 },
      );
    }
    return HttpResponse.json(
      {
        success: true,
        message: "Response recorded",
        data: {
          response: {
            id: "resp-new-1",
            surveyId: "survey-1",
            createdAt: "2026-09-10T00:00:00.000Z",
          },
        },
      },
      { status: 201 },
    );
  }),

  http.get(`${base}/surveys/:id/responses`, () => {
    return HttpResponse.json({ success: true, data: mockResponses });
  }),

  http.get(`${base}/surveys/:id/analytics`, () => {
    return HttpResponse.json({ success: true, data: { analytics: mockAnalytics } });
  }),

  http.get(`${base}/surveys/:id/export`, ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get("format");
    if (format !== "csv") {
      return HttpResponse.json(
        { success: false, message: `Unsupported export format: ${format}` },
        { status: 400 },
      );
    }
    const csv = "Response ID,Submitted At,Respondent Type\r\nresp-1,2026-02-10T00:00:00.000Z,Anonymous";
    const csvBytes = new TextEncoder().encode(csv).buffer;
    return HttpResponse.arrayBuffer(csvBytes, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="survey-my-published-survey.csv"',
      },
    });
  }),

  // ------------------------------------------------------------------
  // Questions + options
  // ------------------------------------------------------------------
  http.post(`${base}/surveys/:surveyId/questions`, async ({ request }) => {
    const body = (await request.json()) as { questionText?: string; questionType?: string };
    const question: SurveyQuestion = {
      id: "q-new-1",
      questionText: body.questionText ?? "New question",
      questionType: (body.questionType as SurveyQuestion["questionType"]) ?? "SHORT_TEXT",
      isRequired: false,
      position: mockQuestions.length + 1,
      minValue: null,
      maxValue: null,
      options: [],
    };
    mockQuestions.push(question);
    return HttpResponse.json(
      { success: true, data: { question } },
      { status: 201 },
    );
  }),

  http.post(`${base}/surveys/:surveyId/questions/batch`, async ({ request }) => {
    const body = (await request.json()) as { questions?: Array<{ questionText?: string }> };
    const questions = (body.questions ?? []).map((q, idx) => ({
      id: `q-batch-${idx + 1}`,
      questionText: q.questionText ?? `Question ${idx + 1}`,
      questionType: "SHORT_TEXT" as const,
      isRequired: false,
      position: mockQuestions.length + idx + 1,
      minValue: null,
      maxValue: null,
      options: [],
    }));
    mockQuestions.push(...questions);
    return HttpResponse.json(
      { success: true, data: { questions } },
      { status: 201 },
    );
  }),

  http.patch(`${base}/surveys/:surveyId/questions/reorder`, async ({ request }) => {
    const body = (await request.json()) as { questionIds?: unknown[] };
    if (!body.questionIds) {
      return HttpResponse.json(
        { success: false, message: "questionIds are required" },
        { status: 400 },
      );
    }
    return HttpResponse.json({ success: true, message: "Questions reordered" });
  }),

  http.patch(`${base}/surveys/:surveyId/questions/:questionId`, async ({ params, request }) => {
    const questionId = params.questionId as string;
    const body = (await request.json()) as { questionText?: string };
    const idx = mockQuestions.findIndex((q) => q.id === questionId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 },
      );
    }
    const updated = { ...mockQuestions[idx], questionText: body.questionText ?? mockQuestions[idx].questionText };
    mockQuestions[idx] = updated;
    return HttpResponse.json({ success: true, data: { question: updated } });
  }),

  http.delete(`${base}/surveys/:surveyId/questions/:questionId`, ({ params }) => {
    const questionId = params.questionId as string;
    const idx = mockQuestions.findIndex((q) => q.id === questionId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Question not found" },
        { status: 404 },
      );
    }
    mockQuestions.splice(idx, 1);
    return HttpResponse.json({ success: true, message: "Question deleted" });
  }),

  http.post(`${base}/surveys/:surveyId/questions/:questionId/options`, async ({ request }) => {
    const body = (await request.json()) as { optionText?: string };
    const optionText = body.optionText ?? "New option";
    const questionId = "q-3";
    const question = mockQuestions.find((q) => q.id === questionId);
    const newOption = { id: "opt-new-1", optionText, position: (question?.options.length ?? 0) + 1 };
    return HttpResponse.json(
      { success: true, data: { option: newOption } },
      { status: 201 },
    );
  }),

  http.patch(`${base}/surveys/:surveyId/questions/:questionId/options/:optionId`, async ({ params, request }) => {
    const optionId = params.optionId as string;
    const body = (await request.json()) as { optionText?: string };
    const question = mockQuestions.find((q) => q.id === "q-3");
    const idx = question?.options.findIndex((o) => o.id === optionId) ?? -1;
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, message: "Option not found" },
        { status: 404 },
      );
    }
    const updated = { ...question!.options[idx], optionText: body.optionText ?? question!.options[idx].optionText };
    return HttpResponse.json({ success: true, data: { option: updated } });
  }),

  http.delete(`${base}/surveys/:surveyId/questions/:questionId/options/:optionId`, () => {
    return HttpResponse.json({ success: true, message: "Option deleted" });
  }),
];