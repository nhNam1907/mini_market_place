import type { Request, Response } from "express";
import { getRequestUser } from "../lib/requestUser.js";
import {
  cancelOrder,
  cancelOrderItem,
  checkoutCart,
  getOrderDetail,
  getUserOrders,
} from "../services/orderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

function parsePositiveNumber(value: unknown, fallbackValue: number) {
  if (typeof value !== "string") {
    return fallbackValue;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return fallbackValue;
  }

  return parsedValue;
}

export const checkoutCartHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const order = await checkoutCart({ userId: user.userId });

    return res.status(201).json({
      success: true,
      message: "Checkout successful",
      data: order,
    });
  },
);

export const getUserOrdersHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const pageNumber = parsePositiveNumber(req.query.pageNumber, 1);
    const pageSize = parsePositiveNumber(req.query.pageSize, 10);

    const orders = await getUserOrders({
      userId: user.userId,
      pageNumber,
      pageSize,
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  },
);

export const getDetailOrderHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const orderId: string = req.params.orderId as string;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const order = await getOrderDetail({
      orderId,
      userId: user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Order detail fetched successfully",
      data: order,
    });
  },
);

export const cancelOrderHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);
    const orderId: string = req.params.orderId as string;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId is required",
      });
    }

    const cancelledOrder = await cancelOrder({
      orderId,
      userId: user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: cancelledOrder,
    });
  },
);

export const cancelOrderItemHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const user = getRequestUser(req);

    const { orderItemId, orderId } = req.params;

    const result = await cancelOrderItem({
      orderItemId: orderItemId as string,
      orderId: orderId as string,
      userId: user.userId,
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      data: result,
    });
  },
);
