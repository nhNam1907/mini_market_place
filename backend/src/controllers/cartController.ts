import type { Request, Response } from "express";

import { getRequestUser } from "../lib/requestUser.js";
import {
  addCartItem,
  getCart,
  removeCartItem,
  updateCartItemQuantity,
} from "../services/cartService.js";
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

export const addCartItemHandler = asyncHandler(
  async (req: Request, res: Response) => {
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
  },
);

export const updateCartItemQuantityHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const data = await updateCartItemQuantity({
      userId: user.userId,
      cartItemId: cartItemId as string,
      quantity,
    });

    return res.status(200).json({
      success: true,
      message: "Cart item quantity updated successfully",
      data,
    });
  },
);

export const removeCartItemHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const { cartItemId } = req.params;

    const data = await removeCartItem({
      userId: user.userId,
      cartItemId: cartItemId as string,
    });

    return res.status(200).json({
      success: true,
      message: "Cart item removed successfully",
      data,
    });
  },
);
