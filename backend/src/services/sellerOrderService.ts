import type { Prisma } from "@prisma/client";
import { OrderItemStatus, OrderStatus } from "@prisma/client";

import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

type GetSellerOrderItemsParams = {
  userId: string;
  pageNumber: number;
  pageSize: number;
  status?: OrderItemStatus;
};

type SellerOrderItemWithOrder = Prisma.OrderItemGetPayload<{
  include: {
    order: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
          };
        };
      };
    };
  };
}>;

function mapSellerOrderItem(item: SellerOrderItemWithOrder) {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    lineTotal: Number(item.lineTotal),
    order: {
      id: item.order.id,
      userId: item.order.userId,
      createdAt: item.order.createdAt,
      updatedAt: item.order.updatedAt,
      user: {
        id: item.order.user.id,
        name: item.order.user.name,
        email: item.order.user.email,
      },
    },
  };
}

async function getSellerShop(userId: string) {
  if (!userId) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "userId is required");
  }

  const shop = await prisma.shop.findFirst({
    where: {
      ownerId: userId,
    },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Shop not found");
  }

  return shop;
}

export async function getSellerOrderItems(params: GetSellerOrderItemsParams) {
  const { userId, pageNumber, pageSize, status } = params;
  const shop = await getSellerShop(userId);

  const whereClause: Prisma.OrderItemWhereInput = {
    shopId: shop.id,
    ...(status ? { status } : {}),
  };

  const [totalItems, orderItems] = await Promise.all([
    prisma.orderItem.count({ where: whereClause }),
    prisma.orderItem.findMany({
      where: whereClause,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    meta: {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      currentPage: pageNumber,
      pageSize,
    },
    items: orderItems.map(mapSellerOrderItem),
  };
}

const allowedStatusTransitions: Record<OrderItemStatus, OrderItemStatus[]> = {
  [OrderItemStatus.PENDING]: [OrderItemStatus.CONFIRMED],
  [OrderItemStatus.CONFIRMED]: [OrderItemStatus.SHIPPING],
  [OrderItemStatus.SHIPPING]: [OrderItemStatus.DELIVERED],
  [OrderItemStatus.DELIVERED]: [OrderItemStatus.COMPLETED],
  [OrderItemStatus.COMPLETED]: [],
  [OrderItemStatus.CANCELLED]: [],
};

function isOrderItemStatus(value: unknown): value is OrderItemStatus {
  return Object.values(OrderItemStatus).includes(value as OrderItemStatus);
}

function deriveOrderStatus(itemStatuses: OrderItemStatus[]) {
  if (
    itemStatuses.length > 0 &&
    itemStatuses.every((status) => status === OrderItemStatus.CANCELLED)
  ) {
    return OrderStatus.CANCELLED;
  }

  if (
    itemStatuses.length > 0 &&
    itemStatuses.every((status) => status === OrderItemStatus.COMPLETED)
  ) {
    return OrderStatus.COMPLETED;
  }

  if (
    itemStatuses.some(
      (status) =>
        status === OrderItemStatus.SHIPPING ||
        status === OrderItemStatus.DELIVERED,
    )
  ) {
    return OrderStatus.SHIPPING;
  }

  if (itemStatuses.some((status) => status === OrderItemStatus.CONFIRMED)) {
    return OrderStatus.CONFIRMED;
  }

  return OrderStatus.PENDING;
}

export async function updateSellerOrderItemStatus({
  orderItemId,
  userId,
  status,
}: {
  orderItemId: string;
  userId: string;
  status: OrderItemStatus;
}) {
  if (!orderItemId || !userId || !status) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "orderItemId, userId, and status are required",
    );
  }

  if (status && !isOrderItemStatus(status)) {
    throw new AppError(ErrorCode.BAD_REQUEST, 400, "Invalid order item status");
  }

  const shop = await getSellerShop(userId);

  return prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findFirst({
      where: {
        id: orderItemId,
        shopId: shop.id,
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!orderItem) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, "Order item not found");
    }

    const allowedNextStatuses = allowedStatusTransitions[orderItem.status];

    if (!allowedNextStatuses.includes(status)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        400,
        `Cannot change status from ${orderItem.status} to ${status}`,
      );
    }

    const updatedOrderItem = await tx.orderItem.update({
      where: {
        id: orderItemId,
      },
      data: {
        status,
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const siblingItems = await tx.orderItem.findMany({
      where: {
        orderId: updatedOrderItem.orderId,
      },
      select: {
        status: true,
      },
    });

    await tx.order.update({
      where: {
        id: updatedOrderItem.orderId,
      },
      data: {
        status: deriveOrderStatus(siblingItems.map((item) => item.status)),
      },
    });

    return mapSellerOrderItem(updatedOrderItem);
  });
}

export async function getSellerOrderDetail(orderId: string, userId: string) {
  if (!orderId || !userId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "orderId and userId are required",
    );
  }

  const shop = await getSellerShop(userId);

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      items: {
        some: {
          shopId: shop.id,
        },
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(ErrorCode.ORDER_NOT_FOUND, 404, "Order not found");
  }

  const [orderItems, totalItems] = await Promise.all([
    prisma.orderItem.findMany({
      where: {
        orderId,
        shopId: shop.id,
      },
      select: {
        id: true,
        orderId: true,
        productId: true,
        productName: true,
        quantity: true,
        unitPrice: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lineTotal: true,
      },
    }),
    prisma.orderItem.count({
      where: {
        orderId,
        shopId: shop.id,
      },
    }),
  ]);

  if (totalItems === 0) {
    throw new AppError(
      ErrorCode.ORDER_ITEM_NOT_FOUND,
      404,
      "No order items found for this order",
    );
  }

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + Number(item.lineTotal),
    0,
  );

  if (!order) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Order not found");
  }

  return {
    orderItems: orderItems.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lineTotal: Number(item.lineTotal),
    })),
    order: {
      id: order.id,
      userId: order.userId,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      user: {
        name: order.user.name,
        email: order.user.email,
      },
    },
    totalItems,
    totalAmount,
  };
}
