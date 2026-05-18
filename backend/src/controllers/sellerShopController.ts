import type { Request, Response } from "express";
import type { UpdateSellerShopRequest } from "@market-place/shared/api";

import { AppError, ErrorCode } from "../lib/errors.js";
import { getRequestUser } from "../lib/requestUser.js";
import {
  getSellerShopProfile,
  updateSellerShopProfile,
} from "../services/sellerShopService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parseUpdateSellerShopBody(body: unknown): UpdateSellerShopRequest {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Invalid request body");
  }

  const payload = body as Record<string, unknown>;

  if (payload.name !== undefined && typeof payload.name !== "string") {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Shop name must be a string");
  }

  if (
    payload.description !== undefined &&
    payload.description !== null &&
    typeof payload.description !== "string"
  ) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Shop description must be a string",
    );
  }

  return {
    name: payload.name,
    description: payload.description,
  } as UpdateSellerShopRequest;
}

export const getSellerShopProfileHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const shop = await getSellerShopProfile(user.userId);

    return res.status(200).json({
      success: true,
      message: "Seller shop fetched successfully",
      data: shop,
    });
  },
);

export const updateSellerShopProfileHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const shop = await updateSellerShopProfile(
      user.userId,
      parseUpdateSellerShopBody(req.body),
    );

    return res.status(200).json({
      success: true,
      message: "Seller shop updated successfully",
      data: shop,
    });
  },
);
