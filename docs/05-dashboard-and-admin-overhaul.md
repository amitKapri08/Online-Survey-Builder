# Update 5 — User & Admin Dashboard Metrics Overhaul

## 1. Overview

The User Dashboard and Admin Console have been upgraded from basic placeholder layouts into comprehensive, metric-rich command centers.

## 2. Backend Changes

### User Dashboard Summary (`GET /api/users/dashboard`)
- Aggregates user-specific statistics in a single query via `Promise.all`:
  - `totalSurveys`, `publishedSurveys`, `draftSurveys`, `closedSurveys`
  - `totalResponses` (across all surveys owned by user)
  - `totalViews` (sum of `viewCount`)
  - `completionRate` (percentage of responses per view)
- Returns the 5 most recently updated surveys with question and response counts.
- Returns the 5 latest responses submitted to any of the user's surveys for a live activity feed.

### Enhanced Admin Analytics & Audit Logs (`GET /api/admin/stats` & `GET /api/admin/audit-logs`)
- Upgraded `getStats` to return platform-wide view counts, question counts, and survey status breakdowns (`draft`, `published`, `closed`).
- Added `GET /api/admin/audit-logs` endpoint with pagination to expose historical security and administrative actions (user role changes, account deactivations).

## 3. Frontend Changes

### User Dashboard (`client/src/pages/dashboard/DashboardPage.tsx`)
- **Metric Cards**: Total Surveys (with active/draft/closed subtext), Total Responses Collected, Total Page Views, and Response Rate with visual progress bar.
- **Recent Surveys Table**: Direct actions to edit, inspect results, or copy the public survey link with immediate feedback.
- **Live Activity Feed**: Displays real-time submissions received across surveys with respondent identity and relative timestamps.
- **Template Launcher**: Direct integration with `TemplateGalleryModal` so creators can spin up new surveys from templates in one click.

### Admin Console (`client/src/pages/admin/AdminPage.tsx`)
- Tabbed interface:
  1. **Overview & Health**: High-level platform KPIs and survey status distribution visualization.
  2. **Users Management**: User search, role promotion/demotion, and deactivation modal with audit trail.
  3. **Surveys Oversight**: Real-time search by survey title and status filtering with direct links to live public surveys.
  4. **System Audit Logs**: Tabular chronological ledger with JSON payload inspection dialog.
