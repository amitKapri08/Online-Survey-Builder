# Update 4 — Build & TypeScript Error Fixes

Three errors surfaced while setting up the generated Prisma client. All were resolved.

## Error 1: Relative imports need file extensions

> Relative import paths need explicit file extensions in ECMAScript imports when '--moduleResolution' is 'node16' or 'nodenext'.

**Cause:** `tsconfig.json` uses `module: nodenext` + `moduleResolution: NodeNext`. ESM relative imports must end in `.js` (the extension of the _compiled_ file).

**Fix:** `src/config/prisma.ts` now imports `../generated/prisma/client.js` (with the `.js`) — matching the existing convention in `src/server.ts` (`./app.js`).

## Error 2: Cannot find module `../generated/prisma/client.js`

**Cause:** The client had never been generated — `server/generated/` didn't exist.

**Fix:** Run `npx prisma generate` in `server/` (reads `DATABASE_URL` via `prisma.config.ts` → `dotenv/config`).

## Error 3: Generated file outside `rootDir`

> File '.../server/generated/prisma/client.ts' is not under 'rootDir' '.../server/src'. 'rootDir' is expected to contain all source files.

**Cause:** The new `prisma-client` generator emits **TypeScript** files, and `tsconfig.json` sets `rootDir: "./src"`. Importing a file outside `src` violates `rootDir`.

**Fix:**

- Moved the generator output into `src` in `schema.prisma`:
  ```prisma
  generator client {
    provider = "prisma-client"
    output   = "../src/generated/prisma"
  }
  ```
- Updated `.gitignore`: `/src/generated/prisma` (was `/generated/prisma`).
- The import path `../generated/prisma/client.js` stays valid — it now resolves inside `src`.
- Compiled runtime resolves too: `dist/config/prisma.js` → `dist/generated/prisma/client.js`.

## Notes

- If Prisma's generated TS ever trips the strict flags later, revisit — but it compiles clean today.
- No commits exist yet; all current work is untracked in `git status`.
