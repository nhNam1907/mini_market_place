import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

import { USER_ROLE } from "../types/role.js";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export type TokenPayload = {
  userId: string;
  role: USER_ROLE;
};

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET);

  if (
    typeof decoded !== "object" ||
    !decoded ||
    !("userId" in decoded) ||
    !("role" in decoded)
  ) {
    throw new Error("Invalid token payload");
  }

  return {
    userId: String(decoded.userId),
    role: decoded.role as USER_ROLE,
  };
}
