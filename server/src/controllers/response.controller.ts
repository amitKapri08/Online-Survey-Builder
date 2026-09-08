import type { Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";

import { AppError } from "../utils/AppError.js";
import { VISITOR_COOKIE_NAME, setVisitorCookie } from "../utils/cookies.js";
import {
  submitResponseSchema,
  responseQuerySchema,
} from "../validators/response.validator.js";
import {
  submitResponse,
  getSurveyResponses,
  getSurveyAnalytics,
} from "../services/response.service.js";

export const handleSubmitResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const surveyId = req.params.id as string;
    const input = submitResponseSchema.parse(req.body);
    let visitorId = req.cookies?.[VISITOR_COOKIE_NAME] as string | undefined;

    if (!visitorId && !req.user) {
      visitorId = randomBytes(16).toString("hex");
      setVisitorCookie(res, visitorId);
    }

    const response = await submitResponse(
      surveyId,
      input,
      req.user?.id,
      visitorId,
    );

    res.status(201).json({
      success: true,
      message: "Response recorded",
      data: { response },
    });
  } catch (error) {
    next(error);
  }
};

export const handleListResponses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    const query = responseQuerySchema.parse(req.query);
    const result = await getSurveyResponses(surveyId, req.user.id, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    const analytics = await getSurveyAnalytics(surveyId, req.user.id);

    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
};
