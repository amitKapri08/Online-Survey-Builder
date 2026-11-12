export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code: string | undefined;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}
