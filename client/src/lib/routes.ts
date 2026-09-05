export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SURVEYS: "/surveys",
  SURVEY_CREATE: "/surveys/new",
  SURVEY_EDIT: "/surveys/:id/edit",
  SURVEY_PUBLIC: "/s/:slug",
  ADMIN: "/admin",
} as const;
