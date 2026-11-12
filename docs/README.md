# Project Updates — Online Survey Builder

A chronological log of the work done on this project. Each update is a standalone markdown file that records **what** was changed, **why**, and **how it fits** the overall goal.

## Index

| #   | File                                                       | Summary                                                                               |
| --- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| 1   | [01-initial-prisma-schema.md](01-initial-prisma-schema.md) | Initial database schema for users, surveys, questions, options, responses and answers |
| 2   | [02-driver-adapter-setup.md](02-driver-adapter-setup.md)   | Prisma 7 driver-adapter client setup and project config                               |
| 3   | [03-schema-enhancements.md](03-schema-enhancements.md)     | Schema review fixes: slug, duplicate responses, rating bounds, analytics fields       |
| 4   | [04-build-error-fixes.md](04-build-error-fixes.md)         | TypeScript/ESM errors resolved during initial setup                                   |
| 5   | [05-dashboard-and-admin-overhaul.md](05-dashboard-and-admin-overhaul.md) | User & Admin dashboard metrics, recent activity feeds, search & audit logs           |
| 6   | [06-post-submission-redirection-and-landing-page.md](06-post-submission-redirection-and-landing-page.md) | Public landing page, post-submission auto-redirection & admin sub-routes |
| 7   | [07-theme-toggle-implementation.md](07-theme-toggle-implementation.md) | Dark mode, theme provider, anti-flicker script, and toggle component |
| 8   | [08-dark-mode-contrast-and-navbar-routing.md](08-dark-mode-contrast-and-navbar-routing.md) | Dark mode button contrast fix, navbar overhaul, and dashboard-survey routing links |
| 9   | [09-dedicated-templates-page.md](09-dedicated-templates-page.md) | Dedicated survey templates library page, 8 curated templates, search & interactive preview |
| 10  | [10-admin-analytics-audit-and-compliance.md](10-admin-analytics-audit-and-compliance.md) | Plan: admin survey analytics drill-down, audit event coverage (logins/lifecycle/reads), audit filtering & IP capture |

## How to add an update

1. Copy the numbered file naming convention (`NN-short-title.md`).
2. Add a row to the index table above.
3. Record: what changed, why, and any important decisions or trade-offs.
