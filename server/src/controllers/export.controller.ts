import type { Request, Response, NextFunction } from "express";

import { AppError } from "../utils/AppError.js";
import { generateSurveyCsv } from "../services/export.service.js";

export const handleExportResponses = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    const surveyId = req.params.id as string;
    const format = (req.query.format as string | undefined) ?? "csv";

    if (format !== "csv") {
      throw new AppError(`Unsupported export format: ${format}`, 400);
    }

    const { filename, csv } = await generateSurveyCsv(surveyId, req.user.id);

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`,
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
