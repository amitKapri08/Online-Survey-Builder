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

- Node.js (v20+)
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

## Documentation

See [`docs/README.md`](docs/README.md) for a chronological log of project decisions and changes:

- Database schema design, Prisma 7 driver-adapter setup, schema enhancements, and build fixes.
