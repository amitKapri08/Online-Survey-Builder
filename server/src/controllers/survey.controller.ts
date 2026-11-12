import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";

import {
  createSurvey,
  getSurveys,
  getSurveyById,
  getSurveyBySlug,
  updateSurvey,
  deleteSurvey,
  recordSurveyView,
} from "../services/survey.service.js";
import {
  createSurveySchema,
  updateSurveySchema,
  surveyQuerySchema,
} from "../validators/survey.validator.js";
import { AppError } from "../utils/AppError.js";
import {
  setVisitorCookie,
  VISITOR_COOKIE_NAME,
} from "../utils/cookies.js";

export const handleCreateSurvey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const input = createSurveySchema.parse(req.body);
    const survey = await createSurvey(req.user.id, input);

    res.status(201).json({
      success: true,
      message: "Survey created successfully",
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSurveys = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const query = surveyQuerySchema.parse(req.query);
    const result = await getSurveys(req.user.id, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSurveyById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    const survey = await getSurveyById(surveyId, req.user.id);

    res.status(200).json({
      success: true,
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetSurveyBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const slug = req.params.slug as string;
    const survey = await getSurveyBySlug(slug);

    res.status(200).json({
      success: true,
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

export const handleRecordSurveyView = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const surveyId = req.params.id as string;

    let visitorKey = req.cookies?.[VISITOR_COOKIE_NAME] as string | undefined;
    if (!visitorKey) {
      visitorKey = randomBytes(16).toString("hex");
      setVisitorCookie(res, visitorKey);
    }

    await recordSurveyView(surveyId, visitorKey);

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateSurvey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    const input = updateSurveySchema.parse(req.body);
    const survey = await updateSurvey(surveyId, req.user.id, input);

    res.status(200).json({
      success: true,
      message: "Survey updated successfully",
      data: { survey },
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteSurvey = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    await deleteSurvey(surveyId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Survey deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
