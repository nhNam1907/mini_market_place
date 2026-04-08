import type { Request, Response } from "express";

import { AppError } from "../lib/errors.js";
import { getRequestUser } from "../lib/requestUser.js";
import {
  getUserInfo,
  loginUser,
  registerUser,
} from "../services/authService.js";

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body;

    const user = await registerUser({ email, password, name });

    return res.status(201).json({
      success: true,
      message: "Register successful",
      data: user,
    });
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const currentUser = getRequestUser(req);
    const user = await getUserInfo({ userId: currentUser.userId });

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  } catch (error) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;
    const message =
      error instanceof Error ? error.message : "Internal server error";

    return res.status(statusCode).json({
      success: false,
      message,
    });
  }
}

export async function adminCheck(_req: Request, res: Response) {
  return res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
}
