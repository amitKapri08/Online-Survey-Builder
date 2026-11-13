import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/AppError.js";

interface ClientError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  body?: unknown;
}

interface ClientErrorInfo {
  status: number;
  message: string;
}

// Messages for errors thrown by body-parser / raw-body. These are always
// client mistakes, never server faults, and the original message can echo
// parts of the request body back to the caller.
const BODY_PARSER_ERRORS: Record<string, ClientErrorInfo> = {
  "entity.parse.failed": { status: 400, message: "Invalid JSON body" },
  "entity.too.large": { status: 413, message: "Request body too large" },
  "request.aborted": { status: 400, message: "Request aborted" },
  "request.size.invalid": {
    status: 400,
    message: "Request body size does not match Content-Length",
  },
  "encoding.unsupported": {
    status: 415,
    message: "Unsupported content encoding",
  },
  "charset.unsupported": { status: 415, message: "Unsupported charset" },
  "parameters.too.many": { status: 413, message: "Too many parameters" },
};

const GENERIC_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad request",
  401: "Authentication required",
  403: "Forbidden",
  404: "Not found",
  405: "Method not allowed",
  413: "Request body too large",
  415: "Unsupported media type",
  429: "Too many requests",
};

/**
 * Recognises errors that Express middleware (body-parser, raw-body, etc.)
 * raises with a 4xx status. We never forward their `message` because it can
 * contain the raw request body, and we never treat them as server faults.
 */
const getClientErrorInfo = (error: unknown): ClientErrorInfo | null => {
  if (!(error instanceof Error)) {
    return null;
  }

  const candidate = error as ClientError;

  const bodyParserError = candidate.type
    ? BODY_PARSER_ERRORS[candidate.type]
    : undefined;

  if (bodyParserError) {
    return bodyParserError;
  }

  const status = candidate.statusCode ?? candidate.status;

  if (typeof status !== "number" || status < 400 || status > 499) {
    return null;
  }

  return {
    status,
    message: GENERIC_STATUS_MESSAGES[status] ?? "Bad request",
  };
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });

    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      ...(error.code && { code: error.code }),
    });

    return;
  }

  const clientError = getClientErrorInfo(error);

  if (clientError) {
    // Deliberately log only routing metadata: body-parser errors carry the
    // raw request body (including passwords) on `error.body`.
    console.warn(
      `[client-error] ${req.method} ${req.originalUrl} -> ${clientError.status}`,
    );

    res.status(clientError.status).json({
      success: false,
      message: clientError.message,
    });

    return;
  }

  // Log the message and stack only. Logging the error object itself would
  // serialise any custom properties it carries (e.g. `body`).
  console.error(
    `[error] ${req.method} ${req.originalUrl}`,
    error instanceof Error ? (error.stack ?? error.message) : error,
  );

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
