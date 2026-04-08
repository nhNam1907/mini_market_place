import type { Request, Response } from "express";

import { AppError } from "../lib/errors.js";
import { getRequestUser } from "../lib/requestUser.js";
import {
  createSellerProduct,
  getSellerProducts,
} from "../services/sellerProductService.js";

export async function getMyProducts(req: Request, res: Response) {
  try {
    const currentUser = getRequestUser(req);
    const products = await getSellerProducts({ userId: currentUser.userId });

    return res.status(200).json({
      success: true,
      message: "Seller products fetched successfully",
      data: products,
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

export async function createProduct(req: Request, res: Response) {
  try {
    const currentUser = getRequestUser(req);
    const { name, description, price, stock, imageUrl, categoryId } = req.body;

    const product = await createSellerProduct({
      userId: currentUser.userId,
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
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
