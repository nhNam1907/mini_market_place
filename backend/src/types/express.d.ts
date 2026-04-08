import type { USER_ROLE } from "./role.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: USER_ROLE;
      };
    }
  }
}

export {};
