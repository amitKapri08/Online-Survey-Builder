import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadTestEnv(): Record<string, string> {
  const file = path.join(__dirname, ".env.test");
  const result: Record<string, string> = {};
  if (fs.existsSync(file)) {
    for (const line of fs.readFileSync(file, "utf8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      result[key] = value;
    }
  }
  return result;
}

const testEnv = loadTestEnv();

// Ensure app modules (env.ts, prisma.ts) read the test DATABASE_URL.
for (const [key, value] of Object.entries(testEnv)) {
  process.env[key] = value;
}

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["src/__tests__/setup.ts"],
    include: ["src/__tests__/**/*.test.ts"],
    env: testEnv,
    testTimeout: 60000,
    hookTimeout: 60000,
    maxWorkers: 1,
    minWorkers: 1,
    fileParallelism: false,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    typecheck: {
      enabled: false,
    },
  },
});
