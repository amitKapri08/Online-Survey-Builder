import { Router } from "express";

import {
  handleListUsers,
  handleListSurveys,
  handleGetStats,
  handleGetAuditLogs,
  handleUpdateUserRole,
  handleDeleteUser,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { csrf } from "../middlewares/csrf.js";
import { originCheck } from "../middlewares/originCheck.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", handleListUsers);
router.get("/surveys", handleListSurveys);
router.get("/stats", handleGetStats);
router.get("/audit-logs", handleGetAuditLogs);
router.patch("/users/:id/role", originCheck, csrf, handleUpdateUserRole);
router.delete("/users/:id", originCheck, csrf, handleDeleteUser);

export default router;
