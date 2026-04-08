import type { NextFunction, Request, Response } from "express";

import { USER_ROLE } from "../types/role.js";

export function requireRole(...allowRoles: USER_ROLE[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!allowRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    return next();
  };
}
