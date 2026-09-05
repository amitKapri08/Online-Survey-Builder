import { Router } from "express";

import {
  handleListUsers,
  handleListSurveys,
  handleGetStats,
} from "../controllers/admin.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { requireAdmin } from "../middlewares/requireAdmin.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/users", handleListUsers);
router.get("/surveys", handleListSurveys);
router.get("/stats", handleGetStats);

export default router;
