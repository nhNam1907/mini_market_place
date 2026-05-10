import type { Request, Response } from "express";

import { AppError } from "../lib/errors.js";
import { getRequestUser } from "../lib/requestUser.js";
import {
  createSellerProduct,
  getSellerProductById,
  getSellerProducts,
} from "../services/sellerProductService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    const { name, description, price, stock, categoryId } = req.body;
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    const product = await createSellerProduct({
      userId: currentUser.userId,
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryId,
      files: files.map((file) => ({
        buffer: file.buffer,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sellerId: currentUser.userId,
      })),
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

export const getSellerProductByIdHandler = asyncHandler(async (req, res) => {
  const user = getRequestUser(req);
  const product = await getSellerProductById(
    req.params.productId as string,
    user.userId,
  );
  return res.status(200).json({
    success: true,
    message: "Seller product fetched successfully",
    data: product,
  });
});
