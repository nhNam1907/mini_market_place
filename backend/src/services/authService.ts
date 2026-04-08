import bcrypt from "bcryptjs";

import { AppError, ErrorCode } from "../lib/errors.js";
import { signAccessToken } from "../lib/jwt.js";
import { prisma } from "../lib/prisma.js";
import { USER_ROLE } from "../types/role.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser({ name, email, password }: RegisterInput) {
  if (!name || !email || !password) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400);
  }

  if (password.length < 6) {
    throw new AppError(ErrorCode.INVALID_PASSWORD, 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError(ErrorCode.USER_ALREADY_EXISTS, 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: USER_ROLE.USER,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function loginUser({ email, password }: LoginInput) {
  if (!email || !password) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400);
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError(ErrorCode.INVALID_CREDENTIALS, 401);
  }

  const token = signAccessToken({
    userId: user.id,
    role: user.role as USER_ROLE,
  });

  return {
    token,
  };
}

export async function getUserInfo(params: { userId: string }) {
  const user = await prisma.user.findUnique({
    where: {
      id: params.userId,
    },
  });

  if (!user) {
    throw new AppError(ErrorCode.USER_NOT_FOUND, 404);
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
