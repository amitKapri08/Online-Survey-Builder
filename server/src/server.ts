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