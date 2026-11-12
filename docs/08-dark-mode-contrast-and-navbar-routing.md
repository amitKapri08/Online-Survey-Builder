# Update 08: Dark Mode Contrast Fix & Comprehensive Navigation / Routing Overhaul

**Date:** 2026-09-08  
**Scope:** Client styling (`index.css`, `buttonVariant.ts`), Layout (`DashboardHeader.tsx`), Navigation & Routing (`DashboardPage.tsx`, `SurveyListPage.tsx`, `CreateSurveyPage.tsx`, `AdminPage.tsx`).

---

## 1. Context & Motivation

1. **Dark Mode Button Contrast Eye Strain:**
   - In `.dark` in `client/src/index.css`, the OKLCH brand, success, and danger palettes had inverted lightness values (`--brand-600` was `0.809` and `--brand-700` was `0.882`).
   - Primary buttons (`variant="brand"`) in dark mode displayed pure white text against an 88% lightness pastel neon blue. This caused severe eye strain, glare, and failed WCAG contrast accessibility.
2. **Disconnected Routing Between `/dashboard` and `/surveys`:**
   - Users clicking on surveys from their dashboard were routed to `/surveys/new` because the dashboard top action bar lacked a direct "Manage surveys" link.
   - When users were on `/surveys`, there was no back link or breadcrumb pointing to `/dashboard`, leaving them stranded unless they clicked the logo icon.
   - The top navigation bar (`DashboardHeader.tsx`) had an empty center with no navigation links between Dashboard, Surveys, Templates, and Admin.

---

## 2. Changes Made

### A. Dark Mode Palette & Contrast Calibration
- **`client/src/index.css`**:
  - Re-calibrated dark mode brand tokens:
    - `--brand-600`: `oklch(0.46 0.21 262)` (comfortable, rich royal blue, >5.2:1 contrast ratio with white text).
    - `--brand-700`: `oklch(0.40 0.20 264)` (deep blue hover state).
    - `--brand-800`: `oklch(0.33 0.17 265)`.
    - `--brand-500`: `oklch(0.54 0.22 260)`.
    - Normalized `--success-*` and `--danger-*` dark mode tokens similarly.
- **`client/src/lib/buttonVariant.ts`**:
  - Configured `brand` and `success` button variants to use `dark:bg-brand-600 dark:hover:bg-brand-700 dark:text-white` and `dark:bg-success-600 dark:hover:bg-success-700 dark:text-white`.

### B. Navbar Overhaul (`client/src/components/dashboard/DashboardHeader.tsx`)
- Added central navigation bar with active route highlighting:
  - **Dashboard** (`/dashboard`) with `LayoutDashboard` icon.
  - **Surveys** (`/surveys`) with `ClipboardList` icon.
  - **Templates** modal trigger with `Sparkles` icon (opens `TemplateGalleryModal`).
  - **Admin** (`/admin`) with `ShieldCheck` icon (role-restricted to admin users).
- Added direct "+ New survey" action button (`variant="brand"`, `size="sm"`) in the header.
- Added responsive mobile navigation drawer with hamburger toggle.

### C. Dashboard Page Routing Improvements (`client/src/pages/dashboard/DashboardPage.tsx`)
- Added a direct **"Manage surveys"** (`/surveys`) button in the top action bar alongside "Templates" and "New survey".
- Calibrated StatCard dark mode brand token to use valid theme variables.

### D. Surveys Page Routing & Breadcrumbs (`client/src/pages/surveys/SurveyListPage.tsx`)
- Added top breadcrumb navigation: `Dashboard > Surveys`.
- Updated heading to "Surveys" with clear action bar:
  - `[Dashboard]` button navigating to `/dashboard`.
  - `[Templates]` button opening `TemplateGalleryModal`.
  - `[+ New survey]` button.
- Cleaned up unused variables to ensure strict TypeScript compilation.

### E. Survey Creation Page Breadcrumbs (`client/src/pages/surveys/CreateSurveyPage.tsx`)
- Added hierarchical breadcrumbs: `Dashboard > Surveys > New Survey`.
- Enhanced back navigation bar with dual options: "Back to surveys" and "Back to dashboard".

### F. Admin Console Breadcrumbs (`client/src/pages/admin/AdminPage.tsx`)
- Added breadcrumbs: `Dashboard > Admin Console`.
- Added quick action navigation buttons: `[Dashboard]` and `[Surveys]`.

---

## 3. Verification & Build
- `client`: `npm run build` completed with **0 TypeScript and 0 Vite bundle errors**.
- `server`: `npm run build` completed with **0 TypeScript errors**.
- No git tools were executed in accordance with user instructions.
