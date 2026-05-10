import type { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ErrorCode, ErrorMessages } from "../lib/errors.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller"
        : err.message;

    res.status(400).json({
      success: false,
      code: ErrorCode.VALIDATION_FAILED,
      message,
    });
    return;
  }

  const normalizedError = err as Error & { statusCode?: number; code?: ErrorCode };
  const statusCode = normalizedError.statusCode || 500;
  const code = normalizedError.code ?? ErrorCode.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    code,
    message: normalizedError.message || ErrorMessages[ErrorCode.INTERNAL_ERROR],
  });
}
