import {
  getSellerOrderDetail,
  getSellerOrderItems,
  updateSellerOrderItemStatus,
} from "../services/sellerOrderService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getRequestUser } from "../lib/requestUser.js";
import { parsePositiveNumber } from "../utils/helper.js";
import { AppError, ErrorCode } from "../lib/errors.js";
import { OrderItemStatus } from "@prisma/client";

const getStatus = (status: string | undefined): OrderItemStatus | undefined => {
  return Object.values(OrderItemStatus).includes(status as OrderItemStatus)
    ? (status as OrderItemStatus)
    : undefined;
};

const parseStatusQuery = (status: unknown): OrderItemStatus | undefined => {
  if (typeof status === "undefined") {
    return undefined;
  }

  if (typeof status !== "string") {
    throw new AppError(ErrorCode.BAD_REQUEST, 400, "Invalid status value");
  }

  const parsedStatus = getStatus(status);

  if (!parsedStatus) {
    throw new AppError(ErrorCode.BAD_REQUEST, 400, "Invalid status value");
  }

  return parsedStatus;
};

export const getSellerOrderItemHandler = asyncHandler(async (req, res) => {
  const user = getRequestUser(req);
  const status = parseStatusQuery(req.query.status);

  const response = await getSellerOrderItems({
    userId: user.userId,
    pageSize: parsePositiveNumber(req.query.pageSize, 12),
    pageNumber: parsePositiveNumber(req.query.pageNumber, 1),
    status,
  });

  return res.status(200).json({
    success: true,
    message: "Seller order items fetched successfully",
    data: response,
  });
});

export const updateSellerOrderItemStatusHandler = asyncHandler(
  async (req, res) => {
    const user = getRequestUser(req);

    const response = await updateSellerOrderItemStatus({
      orderItemId: req.params.orderItemId as string,
      userId: user.userId,
      status: req.body.status as OrderItemStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Seller order item status updated successfully",
      data: response,
    });
  },
);

export const getSellerOrderDetailHandler = asyncHandler(async (req, res) => {
  const user = getRequestUser(req);

  const response = await getSellerOrderDetail(
    req.params.orderId as string,
    user.userId,
  );

  return res.status(200).json({
    success: true,
    message: "Seller order detail fetched successfully",
    data: response,
  });
});
