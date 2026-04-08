import type { Request } from "express";

import { AppError, ErrorCode } from "./errors.js";

export function getRequestUser(req: Request) {
  if (!req.user) {
    throw new AppError(ErrorCode.AUTHENTICATION_FAILED, 401, "Unauthorized");
  }

  return req.user;
}
