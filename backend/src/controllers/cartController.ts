import type { Request, Response } from "express";

import { getRequestUser } from "../lib/requestUser.js";
import { addCartItem, getCart } from "../services/cartService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getUserCart = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const cart = await getCart(user.userId);

  return res.status(200).json({
    success: true,
    message: "Cart fetched successfully",
    data: cart,
  });
});

export const addCartItemHandler = asyncHandler(async (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const data = await addCartItem({
    userId: user.userId,
    productId: req.body.productId,
    quantity: req.body.quantity,
  });

  return res.status(200).json({
    success: true,
    message: "Product added to cart successfully",
    data,
  });
});
