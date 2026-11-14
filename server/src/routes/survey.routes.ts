import { Router } from "express";

import {
  handleCreateSurvey,
  handleGetSurveys,
  handleGetSurveyById,
  handleGetSurveyBySlug,
  handleUpdateSurvey,
  handleDeleteSurvey,
  handleRecordSurveyView,
  handleDuplicateSurvey,
} from "../controllers/survey.controller.js";
import {
  handleSubmitResponse,
  handleListResponses,
  handleGetAnalytics,
} from "../controllers/response.controller.js";
import {
  handleCreateQuestion,
  handleBatchCreateQuestions,
  handleUpdateQuestion,
  handleDeleteQuestion,
  handleReorderQuestions,
  handleSetAllQuestionsRequired,
  handleCreateOption,
  handleUpdateOption,
  handleDeleteOption,
} from "../controllers/question.controller.js";
import {
  authenticate,
  optionalAuthenticate,
} from "../middlewares/authenticate.js";
import { csrf } from "../middlewares/csrf.js";
import { originCheck } from "../middlewares/originCheck.js";
import { viewLimiter, responseLimiter } from "../middlewares/rateLimit.js";
import { handleExportResponses } from "../controllers/export.controller.js";

const router = Router();

router.get("/", authenticate, handleGetSurveys);
router.post("/", authenticate, originCheck, csrf, handleCreateSurvey);
router.get("/slug/:slug", handleGetSurveyBySlug);
router.get("/:id", authenticate, handleGetSurveyById);
router.patch("/:id", authenticate, originCheck, csrf, handleUpdateSurvey);
router.delete("/:id", authenticate, originCheck, csrf, handleDeleteSurvey);
router.post(
  "/:id/duplicate",
  authenticate,
  originCheck,
  csrf,
  handleDuplicateSurvey,
);
router.post(
  "/:id/view",
  originCheck,
  viewLimiter,
  csrf,
  handleRecordSurveyView,
);
router.post(
  "/:id/responses",
  optionalAuthenticate,
  originCheck,
  responseLimiter,
  csrf,
  handleSubmitResponse,
);
router.get("/:id/responses", authenticate, handleListResponses);
router.get("/:id/analytics", authenticate, handleGetAnalytics);
router.get("/:id/export", authenticate, handleExportResponses);

router.post(
  "/:surveyId/questions",
  authenticate,
  originCheck,
  csrf,
  handleCreateQuestion,
);
router.post(
  "/:surveyId/questions/batch",
  authenticate,
  originCheck,
  csrf,
  handleBatchCreateQuestions,
);
router.patch(
  "/:surveyId/questions/reorder",
  authenticate,
  originCheck,
  csrf,
  handleReorderQuestions,
);
router.patch(
  "/:surveyId/questions/required-all",
  authenticate,
  originCheck,
  csrf,
  handleSetAllQuestionsRequired,
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
