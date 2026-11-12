import { Router } from "express";

import adminRoutes from "./admin.routes.js";
import authRoutes from "./auth.routes.js";
import healthRoutes from "./health.routes.js";
import surveyRoutes from "./survey.routes.js";
import userRoutes from "./user.routes.js";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/surveys", surveyRoutes);
router.use("/admin", adminRoutes);

export default router;
