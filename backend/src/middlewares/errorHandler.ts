import type { NextFunction, Request, Response } from "express";
import { ErrorCode, ErrorMessages } from "../lib/errors.js";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    code: ErrorCode.NOT_FOUND,
    message: `Route ${req.originalUrl} not found`,
  });
}

export function errorHandler(
  err: Error & { statusCode?: number; code?: ErrorCode },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code ?? ErrorCode.INTERNAL_ERROR;

  res.status(statusCode).json({
    success: false,
    code,
    message: err.message || ErrorMessages[ErrorCode.INTERNAL_ERROR],
  });
}
