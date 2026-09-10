import { Router } from "express";

import {
  changePassword,
  getDashboardSummary,
  getMe,
  updateProfile,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { csrf } from "../middlewares/csrf.js";
import { originCheck } from "../middlewares/originCheck.js";

const router = Router();

router.get("/me", authenticate, getMe);
router.get("/dashboard", authenticate, getDashboardSummary);
router.patch("/profile", authenticate, originCheck, csrf, updateProfile);
router.post("/password", authenticate, originCheck, csrf, changePassword);

export default router;
