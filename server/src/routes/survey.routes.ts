import { Router } from "express";

import {
  handleCreateSurvey,
  handleGetSurveys,
  handleGetSurveyById,
  handleGetSurveyBySlug,
  handleUpdateSurvey,
  handleDeleteSurvey,
  handleRecordSurveyView,
} from "../controllers/survey.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { csrf } from "../middlewares/csrf.js";
import { originCheck } from "../middlewares/originCheck.js";
import { viewLimiter } from "../middlewares/rateLimit.js";

const router = Router();

router.get("/", authenticate, handleGetSurveys);
router.post("/", authenticate, originCheck, csrf, handleCreateSurvey);
router.get("/slug/:slug", handleGetSurveyBySlug);
router.get("/:id", authenticate, handleGetSurveyById);
router.patch("/:id", authenticate, originCheck, csrf, handleUpdateSurvey);
router.delete("/:id", authenticate, originCheck, csrf, handleDeleteSurvey);
router.post("/:id/view", originCheck, viewLimiter, csrf, handleRecordSurveyView);

export default router;
