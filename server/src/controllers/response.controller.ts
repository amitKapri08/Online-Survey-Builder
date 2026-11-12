import type { Request, Response, NextFunction } from "express";

import { submitResponse } from "../services/response.service.js";
import { submitResponseSchema } from "../validators/response.validator.js";

export const handleSubmitResponse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const surveyId = req.params.id as string;
    const input = submitResponseSchema.parse(req.body);
    const response = await submitResponse(surveyId, input, req.user?.id);

    res.status(201).json({
      success: true,
      message: "Response recorded",
      data: { response },
    });
  } catch (error) {
    next(error);
  }
};