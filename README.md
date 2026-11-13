# Online Survey Builder

A real-world full-stack application that lets users **create surveys, collect responses, and analyze results**. The project teaches dynamic form generation, database design, analytics dashboards, and data visualization.

## Features

- User authentication (signup / login, JWT-based, bcrypt-hashed passwords)
- Survey CRUD with draft, published, and closed statuses
- Dynamic question builder with nine question types:
  - Short text, long text, single choice, multiple choice, dropdown, rating, yes/no, number, date
- Public survey responses with support for anonymous and logged-in submissions
- Per-question configuration: required flag, ordering, and min/max bounds for numeric/rating input
- Configurable duplicate-response handling per survey
- Response and analytics tracking (view counts, published dates)

## Tech Stack

### Client (`client/`)

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4**
- **React Router 7** for routing
- **TanStack React Query** for server-state management
- **React Hook Form** + **Zod** for form handling and validation

### Server (`server/`)

- **Node.js** + **Express 5** (TypeScript)
- **Prisma 7** with PostgreSQL and the **pg driver adapter** (`@prisma/adapter-pg`)
- **JWT** + `bcrypt` for authentication
- **Zod** for validation, `helmet` + `cors` + `cookie-parser` + `morgan` for middleware

## Project Structure

```
├── client/                 # React frontend (Vite app)
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       └── assets/
├── server/                 # Express API backend
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── src/
│   │   ├── app.ts          # Express app (middleware)
│   │   ├── server.ts       # Server entry point
│   │   ├── config/         # Prisma client setup
│   │   └── generated/      # Generated Prisma types
│   └── package.json
└── docs/                   # Chronological project change log
```

## Getting Started

### Prerequisites

- Node.js (v22+)
- PostgreSQL database

### Setup

1. Clone the repository and install dependencies:

```bash
cd client
npm install

cd ../server
npm install
```

2. Configure the server environment. Create `server/.env` with your PostgreSQL connection string and any secret keys used by the app.

3. Set up the database schema:

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

4. Run the server:

```bash
cd server
npm run dev
```

5. Run the client in a separate terminal:

```bash
cd client
npm run dev
```

The client runs at `http://localhost:5173` (Vite default) and the server at `http://localhost:8000`.

## Database Overview

Core models in `server/prisma/schema.prisma`:

| Model            | Purpose                                               |
| ---------------- | ----------------------------------------------------- |
| `User`           | Registered users, owners of surveys                   |
| `Survey`         | A survey, its slug, status, and configuration         |
| `Question`       | A question within a survey, with type and ordering    |
| `QuestionOption` | Choice options for single/multiple/dropdown questions |
| `Response`       | An individual submission to a survey                  |
| `Answer`         | The answer to a specific question within a response   |

## Scripts

### Client (`client/`)

| Script            | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the Vite dev server           |
| `npm run build`   | Type-check and build for production |
| `npm run lint`    | Run ESLint                          |
| `npm run preview` | Preview the production build        |

### Server (`server/`)

- Dev server via `tsx` / `ts-node-dev` (see `server/package.json`)
- Prisma CLI for schema migrations and client generation

## Deployment

The app is deployed as two independent services: the API on **Render** and the
client on **Vercel**.

### Server on Render

Create a Web Service from this repository with these settings:

| Setting          | Value                               |
| ---------------- | ----------------------------------- |
| Root Directory   | `server`                            |
| Build Command    | `npm ci --include=dev && npm run build` |
| Start Command    | `npm start`                         |
| Health Check     | `/api/health`                       |

`npm run build` runs `prisma generate && tsc`, so the Prisma client is always
regenerated from `prisma/schema.prisma` on a clean checkout. (`server/src/generated/prisma`
is intentionally git-ignored.)

Required environment variables:

| Variable                   | Example / notes                                                                 |
| -------------------------- | ------------------------------------------------------------------------------- |
| `NODE_ENV`                 | `production`                                                                     |
| `DATABASE_URL`             | Render PostgreSQL connection string (prefer the **Internal** URL)                |
| `JWT_SECRET`               | Random string, **at least 32 characters** in production                           |
| `JWT_EXPIRES_IN`           | `15m`                                                                            |
| `REFRESH_TOKEN_EXPIRES_IN` | `30d`                                                                            |
| `CORS_ORIGIN`              | The Vercel URL, e.g. `https://surveyhub.vercel.app` (no trailing slash)           |
| `COOKIE_SAME_SITE`         | `none` — Vercel and Render are different sites (see [Cookies](#cookies))          |

Migrations are intentionally **not** part of the build command. Apply them once
against the Render database with `npx prisma migrate deploy` (Render Shell or a
local machine using the external database URL). `render.yaml` documents the same
service configuration for Blueprint deploys.

### Client on Vercel

| Setting          | Value                                     |
| ---------------- | ----------------------------------------- |
| Root Directory   | `client`                                  |
| Framework        | Vite                                      |
| Build Command    | `npm ci && npm run build`                 |
| Output Directory | `dist`                                    |
| Env Variable     | `VITE_API_URL=https://<render-service>.onrender.com/api` |

The build fails fast if `VITE_API_URL` is missing, so a broken bundle is never
published. `client/vercel.json` rewrites every path to `index.html` (client-side
routing survives a hard refresh) and marks hashed assets as immutable.

### Cookies

Because the client and API run on different sites (`*.vercel.app` and
`*.onrender.com`), authentication cookies use `SameSite=None; Secure`. This is
configured with `COOKIE_SAME_SITE=none`, which `server/src/config/env.ts` only
allows in production and only with `Secure` enabled.

If the API is instead exposed under the same site as the client (for example a
Vercel rewrite/proxy of `/api/*`, or a custom subdomain such as
`api.example.com` + `app.example.com`), set `COOKIE_SAME_SITE=lax` — it avoids
the browser restrictions that can affect third-party cookies.

### Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and on pull requests:

- **Client:** `npm ci` → `npm run lint` → `npm run build` → `npm test`
- **Server:** ephemeral `postgres:16` service → `npm ci` → `npx prisma migrate deploy` → `npm run build` → `npm test`

## Documentation

See [`docs/README.md`](docs/README.md) for a chronological log of project decisions and changes:

- Database schema design, Prisma 7 driver-adapter setup, schema enhancements, and build fixes.
