import type { Request, Response } from "express";

import { AppError } from "../lib/errors.js";
import { getCategories } from "../services/categoriesService.js";

export async function getCategoriesHandler(req: Request, res: Response) {
  try {
    const categories = await getCategories();

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
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
