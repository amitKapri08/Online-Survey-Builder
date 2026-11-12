import { Router } from "express";
import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";

const router = Router();

// Liveness: confirms the process is running. Does not touch the database.
router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    data: {
      status: "ok",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

// Readiness: confirms the database is reachable.
router.get("/ready", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Service is ready",
      data: {
        status: "ready",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    res.status(503).json({
      success: false,
      message: "Service is not ready",
      data: {
        status: "degraded",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
