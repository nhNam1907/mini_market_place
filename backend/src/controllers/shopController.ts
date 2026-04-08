import type { Request, Response } from "express";
import type { PublicProductSortBy, PublicProductSortOrder } from "@market-place/shared/api";

import { AppError, ErrorCode } from "../lib/errors.js";
import { getProductsOfShop, getShopInfo } from "../services/shopService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { parsePositiveNumber } from "../utils/helper.js";

const allowedSortBy: PublicProductSortBy[] = ["createdAt", "price", "name"];
const allowedSortOrder: PublicProductSortOrder[] = ["asc", "desc"];

export const getShopInfoById = asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Shop ID is required");
  }

  const shop = await getShopInfo(id);

  return res.status(200).json({
    success: true,
    message: "Shop fetched successfully",
    data: shop,
  });
});

export const getProductsOfShopById = asyncHandler(async (req: Request, res: Response) => {
  const id = typeof req.params.id === "string" ? req.params.id : undefined;

  if (!id) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Shop ID is required");
  }

  const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
  const sortBy =
    typeof req.query.sortBy === "string" && allowedSortBy.includes(req.query.sortBy as PublicProductSortBy)
      ? (req.query.sortBy as PublicProductSortBy)
      : "createdAt";
  const sortOrder =
    typeof req.query.sortOrder === "string" && allowedSortOrder.includes(req.query.sortOrder as PublicProductSortOrder)
      ? (req.query.sortOrder as PublicProductSortOrder)
      : "desc";

  const data = await getProductsOfShop({
    shopId: id,
    pageSize: parsePositiveNumber(req.query.pageSize, 12),
    pageNumber: parsePositiveNumber(req.query.pageNumber, 1),
    sortBy,
    sortOrder,
    search,
    categoryId,
  });

  return res.status(200).json({
    success: true,
    message: "Shop products fetched successfully",
    data,
  });
});
