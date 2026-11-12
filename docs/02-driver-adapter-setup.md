# Update 2 — Driver-Adapter Setup & Project Config

## What was done

Configured Prisma 7's driver-adapter model: the database connection is supplied at runtime by `@prisma/adapter-pg` instead of a datasource `url` in the schema.

## Files touched

| File                          | Change                                                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server/prisma/schema.prisma` | Generator `prisma-client` → output `../src/generated/prisma`                                                                                               |
| `server/prisma.config.ts`     | CLI config: schema path, migrations path, datasource `url` from `DATABASE_URL`                                                                             |
| `server/src/config/prisma.ts` | Single shared `PrismaClient` instance built with the driver adapter                                                                                        |
| `server/package.json`         | Added `@prisma/adapter-pg`, `bcrypt`, `cookie-parser`, `cors`, `dotenv`, `express`, `helmet`, `jsonwebtoken`, `morgan`, `zod`, `prisma`, `typescript` etc. |
| `server/.env`                 | `DATABASE_URL`, `JWT_SECRET`, `PORT`                                                                                                                       |

## The adapter client (`src/config/prisma.ts`)

```ts
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
```

## Why

- Prisma 7 removed `datasourceUrl` and requires a non-empty adapter to construct `PrismaClient` (`new PrismaClient()` throws).
- The adapter model isolates the connection string from the schema, so `DATABASE_URL` lives only in `.env` and `prisma.config.ts`.

## Key rules (per `server/.agents/skills/prisma-postgres-setup`)

1. Import from `./generated/prisma/client.js` — never `./generated/prisma` or `@prisma/client`.
2. The CLI (`prisma generate`, `prisma migrate`) reads the URL from `prisma.config.ts`.
3. Runtime requires the driver adapter — `datasourceUrl` no longer exists in Prisma 7.
4. ESM only: `package.json` has `"type": "module"`.
5. On shutdown, call `await pool.end()` after `prisma.$disconnect()`.

## Notes

- `.env` is git-ignored; anyone cloning must create it with their own `DATABASE_URL`.
- The generated client is output under `src/generated/prisma` so it stays within `tsconfig`'s `rootDir` — see [Update 4](04-build-error-fixes.md).
