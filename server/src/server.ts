import type { Server } from "node:http";

import { env } from "./config/env.js";
import app from "./app.js";
import { prisma } from "./config/prisma.js";

function timestamp(): string {
  return new Date().toISOString();
}

function log(...args: unknown[]): void {
  console.log(`[${timestamp()}]`, ...args);
}

function logError(...args: unknown[]): void {
  console.error(`[${timestamp()}]`, ...args);
}

interface Layer {
  route?: { path?: string | RegExp; methods?: Record<string, boolean> };
  handle?: { stack?: ReadonlyArray<Layer> };
}

function collectRoutes(stack: ReadonlyArray<Layer>, base: string): string[] {
  const lines: string[] = [];
  for (const layer of stack) {
    const path = layer.route?.path;
    if (path && typeof path === "string") {
      const methods = Object.keys(layer.route?.methods ?? {})
        .filter((method) => method !== "_all" && method !== "head")
        .map((method) => method.toUpperCase());
      if (methods.length) {
        lines.push(`${methods.join(",").padEnd(10)} ${base}${path}`);
      }
    } else if (layer.handle?.stack) {
      lines.push(...collectRoutes(layer.handle.stack, base));
    }
  }
  return lines;
}

async function checkDatabase(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logError("Database health check failed:", error);
    return false;
  }
}

process.on("unhandledRejection", (reason) => {
  logError("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  logError("Uncaught Exception:", error);
  process.exit(1);
});

const server: Server = app.listen(env.PORT, async () => {
  const databaseOk = await checkDatabase();

  log("============================================");
  log(" SurveyBuilder API started");
  log("--------------------------------------------");
  log(` Timestamp     : ${timestamp()}`);
  log(` Environment   : ${env.NODE_ENV}`);
  log(` Port          : ${env.PORT}`);
  log(` CORS origin   : ${env.CORS_ORIGINS.join(", ")}`);
  log(` Cookies       : sameSite=${env.COOKIE_SAME_SITE} secure=${env.COOKIE_SECURE}`);
  log(` JWT access    : ${env.JWT_EXPIRES_IN}`);
  log(` JWT refresh   : ${env.REFRESH_TOKEN_EXPIRES_IN}`);
  log(` Database      : ${databaseOk ? "connected" : "UNREACHABLE"}`);
  log("--------------------------------------------");

  // Express 5 exposes the router as `app.router`; the old `app._router` is
  // undefined and would throw inside this async callback. The route table is
  // a local-development aid only, so production logs stay quiet either way.
  if (!env.isProduction) {
    try {
      const routes = collectRoutes(
        (app.router as unknown as { stack: ReadonlyArray<Layer> }).stack,
        "/api",
      );

      log(" API routes (under /api):");
      if (routes.length) {
        for (const route of routes) log(`  ${route}`);
      } else {
        log("  (none registered)");
      }
    } catch (error) {
      logError("Unable to list routes:", error);
    }
  }

  log("============================================");
  log(`Server ready on http://localhost:${env.PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    logError(`Port ${env.PORT} is already in use.`);
  } else {
    logError("Server error:", error);
  }
  process.exit(1);
});

function shutdown(signal: string): void {
  log(`Received ${signal}, shutting down gracefully...`);
  server.close(() => {
    prisma
      .$disconnect()
      .catch(() => undefined)
      .finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));