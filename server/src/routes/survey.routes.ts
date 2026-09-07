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
import { handleSubmitResponse } from "../controllers/response.controller.js";
import {
  handleCreateQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,
  handleReorderQuestions,
  handleCreateOption,
  handleUpdateOption,
  handleDeleteOption,
} from "../controllers/question.controller.js";
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
router.post(
  "/:id/responses",
  originCheck,
  viewLimiter,
  csrf,
  handleSubmitResponse,
);

router.post(
  "/:surveyId/questions",
  authenticate,
  originCheck,
  csrf,
  handleCreateQuestion,
);
router.patch(
  "/:surveyId/questions/reorder",
  authenticate,
  originCheck,
  csrf,
  handleReorderQuestions,
);
router.patch(
  "/:surveyId/questions/:questionId",
  authenticate,
  originCheck,
  csrf,
  handleUpdateQuestion,
);
router.delete(
  "/:surveyId/questions/:questionId",
  authenticate,
  originCheck,
  csrf,
  handleDeleteQuestion,
);
router.post(
  "/:surveyId/questions/:questionId/options",
  authenticate,
  originCheck,
  csrf,
  handleCreateOption,
);
router.patch(
  "/:surveyId/questions/:questionId/options/:optionId",
  authenticate,
  originCheck,
  csrf,
  handleUpdateOption,
);
router.delete(
  "/:surveyId/questions/:questionId/options/:optionId",
  authenticate,
  originCheck,
  csrf,
  handleDeleteOption,
);

export default router;
