# Survey Ideas — Prioritized Implementation Plan

> **Origin:** These ideas came while filling out a survey creation form. Each one has been
> verified against the actual client/server code. This document is now the working
> implementation plan, ordered by priority.
>
> **Stack:** React 19 + Vite + Tailwind 4 (client) · Express 5 + Prisma 7 / PostgreSQL (server)

---

## Verification Summary

| #   | Idea                                                 | Verdict                        | Root cause / location                                                          |
| --- | ---------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------ |
| 1   | Rating needs per-value text labels                   | ✅ Confirmed                   | `Question` has only `minValue`/`maxValue`; respondent UI hardcodes NPS wording |
| 2   | "Other" free-text + conditional logic                | ✅ Confirmed                   | `QuestionOption` has no `allowOther`; server rejects non-option IDs            |
| 3   | Bulk "all questions required" toggle                 | ✅ Confirmed                   | `isRequired` is per-question only; new questions default `false`               |
| 4   | Dark-mode "Question Type" dropdown is white-on-white | ✅ Confirmed                   | Native `<select>`, no `color-scheme: dark`; affects all selects                |
| 5   | Draft / scheduled publishing                         | ✅ Confirmed (scheduling only) | Draft already implicit; no `scheduledAt`, no scheduler                         |
| 6   | View questions without entering Edit                 | ✅ Confirmed                   | No read-only route; only Preview modal in editor                               |
| 7   | Share link on surveys list                           | ⚠️ Partial                     | Dashboard has it; all-surveys list does not; its `Copy` icon = Duplicate       |
| 8   | "View Live Demo" sends visitors to login             | ✅ Confirmed                   | `/templates` is under `ProtectedRoute`                                         |
| 9   | Registration "I Agree" checkbox                      | ⚠️ Partial                     | Checkbox enforced client-side; legal links dead; server ignores/stores nothing |
| 10  | Public visibility + login gate when anonymous off    | ✅ Authentic                   | Direct links already public; no discovery; no login gate for non-anonymous     |

---

## Tomorrow's Committed Scope

- **Commit (must ship):** #4, #9, #7, #10b, #3, #6
- **Stretch:** #8 (minimal demo route), #1
- **Defer:** #2 "Other" input, #5 scheduling, #10a public discovery, conditional logic

---

## P0 — Quick Wins (client-only, low risk, high visible value)

### #4 — Dark-mode dropdown contrast ✅ committed

**Problem:** The native `<select>` popup renders light while text inherits the dark theme
foreground, producing white-on-white text. This affects _every_ `Select`, native date pickers,
and scrollbars — not just "Question Type".

**Changes**

1. `client/src/index.css` — add `color-scheme: dark;` inside the `.dark { … }` block and
   `color-scheme: light;` in `:root`, so the browser renders native popups/scrollbars in the
   correct scheme.
2. `client/src/components/ui/select.tsx` — style options for dark mode:
   - Add `[&>option]:bg-popover [&>option]:text-popover-foreground` (or a scoped class).
   - Ensure the `<select>` itself has `bg-background text-foreground`.
   - Keep `appearance-none` + the custom chevron.

**Acceptance criteria**

- In dark mode, opening any `Select` (Question Type, status filter, public dropdown question)
  shows readable text on a dark popup.
- Light mode unchanged.
- Native date inputs and scrollbars follow the theme.

**Verify:** manual toggle in `EditSurveyPage` (Question Type), `SurveyListPage` (status filter),
`SurveyPublicPage` (dropdown question).

**Time box:** 30–45 min.

---

### #9 — Registration consent: fix links + enforce/record server-side ✅ committed

**Problem:** The checkbox is already compulsory client-side
(`schemas/auth.schema.ts:46-48`, test at `RegisterPage.test.tsx:59-75`), but:

- The Terms/Privacy links are dead `<Button type="button">` controls (`RegisterForm.tsx:219-233`).
- The server ignores `termsAccepted` (`server/src/validators/auth.validator.ts:6-33`) and stores
  no consent record on `User`.

**Changes**

1. **Client — legal links:** replace the dead buttons in `RegisterForm.tsx` with
   `<Link to={ROUTES.TERMS_OF_USE}>` / `<Link to={ROUTES.PRIVACY_POLICY}>`. Opening in a new tab
   is acceptable. Keep the inline styling.
2. **Client — send consent:** include `termsAccepted: true` in the register payload
   (`RegisterForm.tsx` onSubmit + `services/auth.service.ts` `RegisterPayload`).
3. **Server — schema:** add to `model User` in `server/prisma/schema.prisma`:
   ```prisma
   termsAcceptedAt DateTime?
   ```
   Run `npx prisma migrate dev --name add_user_terms_accepted_at`.
4. **Server — validator:** add `termsAccepted: z.literal(true, { … })` to `registerSchema` in
   `auth.validator.ts`.
5. **Server — service:** in `registerUser` (`auth.service.ts`), set `termsAcceptedAt: new Date()`
   on create.
6. **Server — types:** `RegisterInput` is inferred from the schema, so the controller at
   `auth.controller.ts:22` picks it up automatically.

**Acceptance criteria**

- Clicking "Terms of Service" / "Privacy Policy" in the register form navigates to the real pages.
- `POST /api/auth/register` without `termsAccepted: true` returns `400`.
- A registered user row has a non-null `termsAcceptedAt`.
- Existing client test still passes.

**Tests:** update/add a server test in `server/src/__tests__/auth/auth.controller.test.ts` for
the missing-consent `400` and the stored timestamp.

**Time box:** 1.5–2 h.

---

### #7 — Share link on the all-surveys list ✅ committed

**Problem:** `SurveyListPage` has no copy-link action; its `Copy` icon means **Duplicate**
(`SurveyListPage.tsx:246-254`), which is easy to confuse with "copy link". The dashboard already
has Share/Open for published surveys.

**Changes**

1. `client/src/pages/surveys/SurveyListPage.tsx`:
   - For `status === "PUBLISHED"`, add a **Share link** action (Link2/Share icon) that copies
     `window.location.origin + "/s/" + slug` and shows a toast.
   - Keep Duplicate, but change its icon to `CopyPlus` and add `title="Duplicate survey"` +
     `aria-label`.
   - Add an `ExternalLink` "Open public page" action for published surveys (parity with dashboard).
   - For drafts/closed, hide Share or show a disabled state with tooltip "Publish to share".
2. Reuse the copy-to-clipboard + toast pattern already used in `DashboardPage.tsx:417-446`.

**Acceptance criteria**

- Published surveys on `/surveys` expose Copy link and Open public page.
- Duplicate is visually distinct and labeled.
- Drafts never expose a public link.

**Time box:** 1 h.

---

## P1 — Core UX (small schema/API surface)

### #3 — Bulk "require all questions" ✅ committed

**Problem:** Each question must be toggled individually, and new questions default to
`isRequired: false`.

**Changes**

1. **Client (minimum):** in `BuildTab.tsx` / `EditSurveyPage.tsx` Settings tab, add a
   **"Require all questions"** toggle and a **"Mark all required / Clear all"** button that maps
   over questions and calls the existing `useUpdateQuestion` for each (or a new bulk endpoint).
2. **Server (preferred):** add `PATCH /api/surveys/:id/questions/required-all` (or extend the
   reorder-style batch):
   - `server/src/validators/question.validator.ts` — `{ isRequired: boolean }`.
   - `server/src/services/question.service.ts` — new `setAllQuestionsRequired(surveyId, userId,
isRequired)` guarded by `getEditableSurveyOrThrow` (draft-only).
   - `server/src/controllers/question.controller.ts` + `server/src/routes/survey.routes.ts` —
     wire the route with `authenticate` + `csrf`.
3. Optional follow-up: `Survey.defaultRequired Boolean @default(false)` applied to newly created
   questions. Can be deferred.

**Acceptance criteria**

- One action marks every question required (and can clear all).
- Works only on editable (draft) surveys.
- UI reflects the new state without a reload.

**Tests:** server test for the bulk endpoint; guard rejects non-draft.

**Time box:** 2–3 h (client-only ~1 h).

---

### #6 — Read-only survey view (no Edit needed) ✅ committed

**Problem:** There is no read-only route; the list and dashboard only link to the editor, so
drafts have no viewing surface at all.

**Changes**

1. `client/src/lib/routes.ts` — add `SURVEY_VIEW: "/surveys/:id"` (optionally `/surveys/:id/view`).
2. `client/src/App.tsx` — register a lazy `SurveyViewPage` under `ProtectedRoute`.
3. New `client/src/pages/surveys/SurveyViewPage.tsx`:
   - Load survey + questions (reuse the existing detail query).
   - Render questions read-only (reuse `QuestionPreview.tsx`).
   - Header actions: Edit (if draft), Preview, Share/Open (if published), back to list.
4. Update `SurveyListPage.tsx` so row click / title goes to **View** (not Edit); keep an explicit
   Edit button.

**Acceptance criteria**

- Clicking a survey opens a read-only view.
- Edit remains one click away.
- Drafts are viewable read-only by their owner.

**Time box:** 2–3 h.

---

### #10b — Require login when a survey is non-anonymous ✅ committed

**Problem:** `optionalAuthenticate` guards response submission, and `submitResponse` stores
`userId: null` even when `isAnonymous === false` (`response.service.ts:255-258`). There is no
client-side login gate.

**Changes**

1. **Server guard:** in `submitResponse` (`response.service.ts`), after loading the survey:
   ```ts
   if (!survey.isAnonymous && !userId) {
     throw new AppError(
       "This survey requires you to sign in",
       401,
       "LOGIN_REQUIRED",
     );
   }
   ```
2. **Client gate:** in `SurveyPublicPage.tsx`, when `survey.isAnonymous === false &&
!isAuthenticated`, render a sign-in/register prompt instead of the form, with a return URL
   back to `/s/:slug`.
3. **Return-URL plumbing** (required because `PublicOnlyRoute` always redirects authenticated
   users to `/dashboard`):
   - `PublicOnlyRoute.tsx` — read `state.from` and redirect there instead of `ROUTES.DASHBOARD`.
   - `SurveyPublicPage` — link to `/login` with `state={{ from: { pathname: "/s/" + slug } }}`
     (same for register).
   - `LoginForm` / `RegisterForm` — after success, navigate to
     `location.state?.from?.pathname ?? ROUTES.DASHBOARD` (LoginForm currently does not navigate).
4. Keep the existing logged-in identity path (`req.user.id → Response.userId`).

**Acceptance criteria**

- Non-anonymous survey + logged-out visitor → login prompt, no form, no submit.
- Direct API submit without auth on a non-anonymous survey → `401 LOGIN_REQUIRED`.
- After login, the user returns to the survey and can submit; the response is attributed.
- Anonymous surveys are unaffected.

**Tests:** server test for the `401` on non-anonymous + no auth; client test for the gate.

**Time box:** 3–4 h.

---

## P2 — Larger Features (stretch / next session)

### #8 — Public "Live Demo" (no login) — stretch

**Problem:** "View Live Demo" navigates to `/templates`, which is behind `ProtectedRoute`.

**Plan (minimal):** add a public `/demo` route (see `FuturePlans.md` §3) rendering a sample survey
from `surveyTemplates.ts` with local-only submission; point the landing CTA at `/demo`. Keep
`/templates` protected for real use.

**Time box:** 2–3 h.

### #1 — Rating scale labels — stretch

**Problem:** There are no per-value labels, and the respondent UI hardcodes NPS wording for every
rating question.

**Plan:**

- Schema: add `ratingLabels Json?` (or `String[]`) to `Question`; migrate.
- Editor (`QuestionEditor.tsx`): when type = RATING, render label inputs for each value
  `min..max`.
- Preview (`QuestionPreview.tsx`) + respondent (`SurveyAnswerForm.tsx:341-371`): render labels
  under each value; remove the hardcoded NPS text.
- Validators/selects: include `ratingLabels`.

**Time box:** 4–6 h.

---

## P3 — Backlog (not tomorrow)

- **#2** "Other" free-text input for choice questions (`QuestionOption.allowOther`/`isOther`;
  store text in `Answer.answerText`; update `answerGroupValue` so CSV export flows through).
  Needs server validation + schema + editor + public form.
- **#5** Scheduled publish/close (`Survey.scheduledPublishAt`/`scheduledCloseAt` + a scheduler —
  Render cron / BullMQ per `architecture.md:875-889`). No scheduling infrastructure exists today.
- **#10a** Public discovery/listing (`isPubliclyListed` flag + public list endpoint + explore
  page). Surveys are currently private-by-link only.
- **Conditional / branching question logic** (listed as future in `architecture.md:1632`).

---

## Cross-Cutting Notes

- **Migrations:** #9 and #1 (and later #2/#5) require Prisma migrations. Run
  `npx prisma migrate dev` and regenerate the client.
- **Draft-only guard:** question edits go through `getEditableSurveyOrThrow`
  (`question.service.ts:40-59`) — bulk-required (#3) must respect this.
- **Export coupling:** `answerGroupValue` (`response.service.ts`) feeds CSV export; #2 must update it.
- **Auth redirect:** `PublicOnlyRoute` always sends authenticated users to `/dashboard`; #10b needs
  `state.from` support there and in `LoginForm`.
- **Tests to touch:** `client/src/__tests__/pages/auth/RegisterPage.test.tsx` (#9),
  `server/src/__tests__/auth/auth.controller.test.ts` (#9), new response-gate test (#10b), new
  bulk-required test (#3).

---

## Suggested Order for Tomorrow

1. **#4** (30–45 min) — instant win, unblocks visual QA.
2. **#9** (1.5–2 h) — legal links + server-side consent.
3. **#7** (1 h) — list share/link clarity.
4. **#10b** (3–4 h) — login gate + redirect plumbing.
5. **#3** (2–3 h) — bulk required.
6. **#6** (2–3 h) — read-only view.
7. **Stretch:** #8 minimal demo, then #1.

**Total committed:** ~10–14 h of focused work.

=========================================================================

11. Forgot Password functionality - there is no forgot password functionality as there is no mail functionality in the project. In future if there is any mail services, then this functionality needs to be added
