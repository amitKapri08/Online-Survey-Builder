export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  SURVEYS: "/surveys",
  SURVEY_CREATE: "/surveys/new",
  SURVEY_EDIT: "/surveys/:id/edit",
  SURVEY_PUBLIC: "/s/:slug",
  PROFILE: "/account",
  ADMIN: "/admin",
  PRIVACY_POLICY: "/privacy",
  TERMS_OF_USE: "/terms",
} as const;
