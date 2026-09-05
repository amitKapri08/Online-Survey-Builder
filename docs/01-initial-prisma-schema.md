# Update 1 — Initial Prisma Schema

## What was done

Created the initial database schema at `server/prisma/schema.prisma` using PostgreSQL. It models the core entities of an online survey builder.

## Models

| Model            | Purpose                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| `User`           | Registered users who create surveys. Has unique `email`, name, and hashed `password`.                               |
| `Survey`         | A survey owned by a user, with title, description, and lifecycle `status` (`DRAFT` / `PUBLISHED` / `CLOSED`).       |
| `Question`       | Questions within a survey. Ordered by `position`, supports `isRequired`, and has a `QuestionType`.                  |
| `QuestionOption` | Choice options for single/multiple-choice, dropdown. Ordered by `position`.                                         |
| `Response`       | A submitted response to a survey. `userId` is nullable → supports anonymous surveys.                                |
| `Answer`         | One answer to a question within a response. Flexible value columns cover text/number/date or a selected `optionId`. |

## Question types covered

`SHORT_TEXT`, `LONG_TEXT`, `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `DROPDOWN`, `RATING`, `YES_NO`, `NUMBER`, `DATE`.

## Key design decisions

- **UUID primary keys** with identity-free IDs, so survey share links never leak auto-increment counters.
- **Cascade deletes** — deleting a user removes their surveys; deleting a survey removes its questions/responses; deleting a response removes its answers.
- **`SetNull` on answer `optionId`** so deleting a question option doesn't destroy existing answers.
- **Flexible `Answer` value columns** (`answerText`, `answerNumber`, `answerDate`) so one model serves all question types without a nullable-only string field.
- **Indexes on every foreign key** for fast joins in analytics queries.
- **Enums** give strict, DB-level type safety for survey status and question type.

## Project map

```
server/
├── prisma/
│   └── schema.prisma      # this schema
├── src/
│   ├── app.ts             # Express app (middleware only, so far)
│   └── server.ts          # app entry point (listen)
├── .env                   # DATABASE_URL, JWT_SECRET, PORT
└── prisma.config.ts       # Prisma CLI config (schema + migrations path + data source URL)
```

## Notes

- The generator block uses `provider = "prisma-client"` (Prisma 7 style) with output `../src/generated/prisma` — see [Update 2](02-driver-adapter-setup.md) and [Update 4](04-build-error-fixes.md) for why.
- The datasource block carries **no** `url` — in Prisma 7 the connection string is supplied through a driver adapter and `prisma.config.ts`.
