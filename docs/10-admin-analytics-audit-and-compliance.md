# Admin Analytics, Audit Logging & Compliance (Plan)

Status: **Proposed — not yet implemented.** Recorded per the docs index convention so the work is tracked before code changes land.

## Problem

Three gaps were reported in the admin console:

1. **Audit Logs tab displays nothing.** The tab is fully wired (`GET /admin/audit-logs` → `getAuditLogs`) and renders entries, but the `AdminAuditLog` table is only ever written by two actions: role changes and user deactivation (`server/src/services/admin.service.ts`). No login, lifecycle, or admin read is logged, the seed writes no entries, and the MSW mock always returns `logs: []`, so the tab legitimately shows the empty state. The Overview tab already claims an "immutable audit log" (`client/src/pages/admin/AdminPage.tsx`) that the code does not actually provide.
2. **Admin survey view shows no analytics.** `getAllSurveys` returns only title, slug, status, views, timestamps, owner, and `_count` (questions/responses). A rich per-question analytics engine already exists owner-side (`getSurveyAnalytics`, `server/src/services/response.service.ts`) but hard-404s non-owners via `getOwnedSurveyForResults`. Admin survey rows only offer "View Public."
3. **No compliance tooling.** Only two event types exist, entries carry no IP/user-agent, the audit tab has no search/filter, and nothing logs admin logins, survey lifecycle changes, or admin reads.

## Decisions (confirmed with stakeholder)

- **Admin analytics depth:** full drill-down per survey (per-question breakdown) *plus* KPI summaries in the survey list.
- **Audit event scope:** everything incl. reads — admin logins, admin reads (users/stats/surveys/analytics/audit logs), role changes, user deactivation, survey create/publish/close/delete/duplicate, and survey exports.
- **Raw response policy:** aggregates only. Admin analytics show counts/averages/distributions; raw answer text stays owner-only (TEXT questions returned without samples).

## Plan

### Phase 1 — Audit foundation (server)

- Move `writeAuditLog` from `admin.service.ts` into a new `server/src/services/audit.service.ts` with an `AUDIT_ACTIONS` const set (avoids a service→service circular import once `survey.service` also logs). Extend it to accept `ipAddress` / `userAgent`.
- `server/prisma/schema.prisma`: add `ipAddress String?` + `userAgent String?` to `AdminAuditLog`. New migration: `npx prisma migrate dev --name add_audit_ip_useragent`; replay against the test DB (`.env.test`) so integration tests see the columns.
- `server/src/routes/admin.routes.ts`: add `GET /surveys/:id/analytics`; wrap admin GET routes with a new `auditAdminRead(action)` middleware (`server/src/middlewares/auditAdminRead.ts`) that records the read plus `targetId` from params.

### Phase 2 — Lifecycle + auth events (server)

- `survey.service.ts`: `createSurvey` → `SURVEY_CREATED`; `updateSurvey` → `SURVEY_PUBLISHED` / `SURVEY_CLOSED` on status change; `deleteSurvey` → `SURVEY_DELETED`; `duplicateSurvey` → `SURVEY_DUPLICATED`.
- `export.controller.ts`: `SURVEY_EXPORTED` (owner today, admin later).
- `auth.controller.ts` `login`: after success, if `user.role === "ADMIN"`, write `ADMIN_LOGIN` with `req.ip` and `req.headers["user-agent"]`.

### Phase 3 — Admin analytics + audit filtering (server)

- `response.service.ts`: extend `getSurveyAnalytics(surveyId, userId, opts?)` with `{ requireOwnership?, includeTextSamples? }`. Admin path passes `requireOwnership: false, includeTextSamples: false` (TEXT still returned as `{ type: "TEXT", ...base, samples: [] }` so the shared UI renders unchanged).
- `admin.service.ts`:
  - New `getAdminSurveyAnalytics(surveyId)` returning survey meta (title/slug/status/publishedAt/owner) + per-question breakdown + totals (views, responses, response rate, completion rate, average rating, last-response time).
  - Extend `getAllSurveys` with list KPIs (response rate, avg rating, last response, last-7-days count) via grouped Prisma queries.
  - Extend `getAuditLogs` with `action` / `actorId` / `dateFrom` / `dateTo` filters (+ `admin.validator.ts`).
- `admin.routes.ts` / `admin.controller.ts`: wire `/admin/surveys/:id/analytics` and the audit filter params.

### Phase 4 — Client

- `client/src/types/admin.ts`: KPI fields on `AdminSurvey`; new `AdminSurveyAnalytics` (reuses `QuestionAnalytics` from `@/types/survey`).
- `admin.service.ts` + `useAdminApi.ts`: `getAdminSurveyAnalytics` / `useAdminSurveyAnalytics`; extend audit query params; invalidate the `auditLogs` query on role-change/delete success so the tab live-updates.
- `AdminPage.tsx`: KPI line on survey rows; "View Analytics" button per row → dialog showing an owner-style `AnalyticsBlock` (aggregate-only data from server) plus a summary header; audit tab filter bar (action / actor / date). Keep the empty states and the audit detail dialog.

### Phase 5 — Mocks + tests

- `client/src/__tests__/mocks/handlers.ts`: `mockAdminAuditLogs` array served/filtered at `/admin/audit-logs`; `GET /admin/surveys/:id/analytics`; KPI fields on `mockAdminSurveys`; role/delete handlers prepend audit entries.
- Server tests: KPI shapes, aggregates-only analytics (TEXT without samples), audit filters, and lifecycle/login/admin-read entries; update `admin.service.test.ts` imports if it referenced `writeAuditLog`.
- Client tests: replace the audit "empty state" assertion in `AdminPage.test.tsx` with rendered-entries + filtering coverage; add KPI + analytics-dialog coverage.

## Verification

- Server: `npx vitest run` (in `server/`).
- Client: `npx vitest run`, then `npx vitest run --typecheck` (in `client/`).
- Manual smoke: apply the migration, `npm run seed`, log in as admin, perform admin actions, confirm entries + filters behave.

## Notes & risks

- The schema migration touches both the dev DB and the test DB (test setup only truncates tables — it does not migrate — so `migrate deploy` must be run against `.env.test` too).
- `AdminAuditLog` cascades on actor delete, but soft-deleted users persist as actors, which is compliance-friendly (deactivation is logged, actors remain linkable).
- Large change set: implement Phases 1–3 (server) before Phases 4–5 (client) so each half is independently verifiable.
- Over-auditing risk is accepted per the "everything incl. reads" decision; reads are awaited writes on GET admin routes.