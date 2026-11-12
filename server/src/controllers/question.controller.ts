import type { Request, Response, NextFunction } from "express";

import {
  createQuestion,
  batchCreateQuestions,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  createOption,
  updateOption,
  deleteOption,
} from "../services/question.service.js";
import {
  createQuestionSchema,
  batchCreateQuestionsSchema,
  updateQuestionSchema,
  reorderQuestionsSchema,
  createOptionSchema,
  updateOptionSchema,
} from "../validators/question.validator.js";
import { AppError } from "../utils/AppError.js";

export const handleCreateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const input = createQuestionSchema.parse(req.body);
    const question = await createQuestion(surveyId, req.user.id, input);

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};

export const handleBatchCreateQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const input = batchCreateQuestionsSchema.parse(req.body);
    const questions = await batchCreateQuestions(surveyId, req.user.id, input);

    res.status(201).json({
      success: true,
      message: "Questions added successfully",
      data: { questions },
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const questionId = req.params.questionId as string;
    const input = updateQuestionSchema.parse(req.body);
    const question = await updateQuestion(
      surveyId,
      questionId,
      req.user.id,
      input,
    );

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const questionId = req.params.questionId as string;
    await deleteQuestion(surveyId, questionId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleReorderQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const input = reorderQuestionsSchema.parse(req.body);
    await reorderQuestions(surveyId, req.user.id, input.questionIds);

    res.status(200).json({
      success: true,
      message: "Questions reordered successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const handleCreateOption = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const questionId = req.params.questionId as string;
    const input = createOptionSchema.parse(req.body);
    const option = await createOption(surveyId, questionId, req.user.id, input);

    res.status(201).json({
      success: true,
      message: "Option added successfully",
      data: { option },
    });
  } catch (error) {
    next(error);
  }
};

export const handleUpdateOption = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const questionId = req.params.questionId as string;
    const optionId = req.params.optionId as string;
    const input = updateOptionSchema.parse(req.body);
    const option = await updateOption(
      surveyId,
      questionId,
      optionId,
      req.user.id,
      input,
    );

    res.status(200).json({
      success: true,
      message: "Option updated successfully",
      data: { option },
    });
  } catch (error) {
    next(error);
  }
};

export const handleDeleteOption = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.surveyId as string;
    const questionId = req.params.questionId as string;
    const optionId = req.params.optionId as string;
    await deleteOption(surveyId, questionId, optionId, req.user.id);

    res.status(200).json({
      success: true,
      message: "Option deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
