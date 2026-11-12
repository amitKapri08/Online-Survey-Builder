# Update 3 — Schema Enhancements (Post-Review)

## What was done

Applied a design review of the initial schema to close gaps against the project goals (share links, analytics, duplicate responses, rating scales).

## Changes

| Model      | Field                                            | Why                                                                  |
| ---------- | ------------------------------------------------ | -------------------------------------------------------------------- |
| `Survey`   | `slug String @unique`                            | Gives friendly shareable links like `/s/:slug` instead of raw UUIDs. |
| `Survey`   | `allowMultipleResponses Boolean @default(false)` | Controls whether the same person may submit more than once.          |
| `Survey`   | `viewCount Int @default(0)`                      | Cheap "views" counter for analytics/landing stats.                   |
| `Question` | `minValue Int?`, `maxValue Int?`                 | Lets the frontend render the scale for `RATING` / `NUMBER`.          |
| `Response` | removed `submittedAt DateTime?`                  | Redundant — `createdAt` already records the submission time.         |

## Explicitly rejected

- **DB-level duplicate-response constraint** (`@@unique([surveyId, userId])`) — would block multiple submissions unconditionally, even when `allowMultipleResponses = true`. Decided to handle duplicate checks in the submit endpoint later instead (and skipped entirely for now).
- **Flexible `previewFeatures` / custom types** — not needed yet.

## Notes

- `slug` must be generated and made unique at survey-creation time (e.g. nanoid- or slugified-title-based) — not yet implemented, this update is schema-only.
- `viewCount` should be incremented when a survey link is served, not when responses are submitted.
