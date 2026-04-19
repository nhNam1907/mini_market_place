import type { Prisma } from "@prisma/client";
import { AppError, ErrorCode, ErrorMessages } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { OrderItemStatus, OrderStatus } from "../types/orderStatus.js";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: {
    items: true;
  };
}>;

function mapOrderDetail(order: OrderWithItems) {
  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage,
      unitPrice: Number(item.unitPrice),
      quantity: item.quantity,
      lineTotal: Number(item.lineTotal),
      shopId: item.shopId,
      shopName: item.shopName,
      categoryId: item.categoryId,
      categoryName: item.categoryName,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      status: item.status,
    })),
  };
}

export async function checkoutCart(params: { userId: string }) {
  if (!params.userId) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "userId is required");
  }

  const userId = params.userId;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              shop: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new AppError(ErrorCode.CART_EMPTY, 400, "Cart is empty");
  }

  let totalAmount = 0;

  for (const item of cart.items) {
    const product = item.product;

    if (!product) {
      throw new AppError(ErrorCode.PRODUCT_NOT_FOUND, 404, "Product not found");
    }

    if (item.quantity > product.stock) {
      throw new AppError(
        ErrorCode.INSUFFICIENT_STOCK,
        400,
        "Not enough stock available",
      );
    }

    totalAmount += item.quantity * Number(product.price);
  }

  const createdOrderId = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: OrderStatus.PENDING,
      },
    });

    const orderItemsData = cart.items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.imageUrl,
      unitPrice: item.product.price,
      quantity: item.quantity,
      lineTotal: item.quantity * Number(item.product.price),
      shopId: item.product.shop.id,
      shopName: item.product.shop.name,
      categoryId: item.product.category.id,
      categoryName: item.product.category.name,
      status: OrderItemStatus.PENDING,
    }));

    await tx.orderItem.createMany({
      data: orderItemsData,
    });

    await Promise.all(
      orderItemsData.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return order.id;
  });

  const order = await prisma.order.findUnique({
    where: { id: createdOrderId },
    include: {
      items: {
        where: {
          status: {
            not: OrderItemStatus.CANCELLED,
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(
      ErrorCode.ORDER_NOT_FOUND,
      404,
      ErrorMessages.ORDER_NOT_FOUND,
    );
  }

  return mapOrderDetail(order);
}

export async function getUserOrders(params: {
  userId: string;
  pageNumber: number;
  pageSize: number;
}) {
  if (!params.userId) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "userId is required");
  }

  const pageNumber =
    Number.isInteger(params.pageNumber) && params.pageNumber > 0
      ? params.pageNumber
      : 1;
  const pageSize =
    Number.isInteger(params.pageSize) && params.pageSize > 0
      ? params.pageSize
      : 10;
  const skip = (pageNumber - 1) * pageSize;
  const where = { userId: params.userId };

  const [totalItems, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),
  ]);

  return {
    meta: {
      pageNumber,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
    },
    orders: orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalAmount: Number(order.totalAmount),
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        unitPrice: Number(item.unitPrice),
        quantity: item.quantity,
        lineTotal: Number(item.lineTotal),
        shopId: item.shopId,
        shopName: item.shopName,
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    })),
  };
}

export async function getOrderDetail(params: {
  orderId: string;
  userId: string;
}) {
  if (!params.orderId || !params.userId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "orderId and userId are required",
    );
  }

  const order = await prisma.order.findFirst({
    where: {
      id: params.orderId,
      userId: params.userId,
    },
    include: {
      items: true,
    },
  });

  if (!order) {
    throw new AppError(
      ErrorCode.ORDER_NOT_FOUND,
      404,
      ErrorMessages.ORDER_NOT_FOUND,
    );
  }

  return mapOrderDetail(order);
}

const STATUS_NOT_ALLOWED_TO_CANCEL = [
  OrderStatus.SHIPPING,
  OrderStatus.COMPLETED,
  OrderStatus.CANCELLED,
];

const ITEM_STATUS_NOT_ALLOWED_TO_CANCEL = [
  OrderItemStatus.SHIPPING,
  OrderItemStatus.COMPLETED,
  OrderItemStatus.CANCELLED,
];

export async function cancelOrder(params: { orderId: string; userId: string }) {
  if (!params.orderId || !params.userId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "orderId and userId are required",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: {
        id: params.orderId,
        userId: params.userId,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new AppError(
        ErrorCode.ORDER_NOT_FOUND,
        404,
        ErrorMessages.ORDER_NOT_FOUND,
      );
    }

    if (STATUS_NOT_ALLOWED_TO_CANCEL.includes(order.status as OrderStatus)) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        400,
        `Cannot cancel order with status ${order.status}`,
      );
    }

    const activeItems = order.items.filter(
      (item) => item.status !== OrderItemStatus.CANCELLED,
    );

    const result = await tx.order.updateMany({
      where: {
        id: params.orderId,
        userId: params.userId,
        status: {
          notIn: STATUS_NOT_ALLOWED_TO_CANCEL,
        },
      },
      data: {
        status: OrderStatus.CANCELLED,
        totalAmount: 0,
      },
    });

    if (result.count === 0) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        400,
        `Cannot cancel order with status ${order.status}`,
      );
    }

    if (activeItems.length > 0) {
      await tx.orderItem.updateMany({
        where: {
          id: {
            in: activeItems.map((item) => item.id),
          },
        },
        data: {
          status: OrderItemStatus.CANCELLED,
        },
      });

      await Promise.all(
        activeItems.map((item) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          }),
        ),
      );
    }

    const cancelledOrder = await tx.order.findFirst({
      where: {
        id: params.orderId,
        userId: params.userId,
      },
      include: {
        items: true,
      },
    });

    if (!cancelledOrder) {
      throw new AppError(
        ErrorCode.ORDER_NOT_FOUND,
        404,
        ErrorMessages.ORDER_NOT_FOUND,
      );
    }

    return mapOrderDetail(cancelledOrder);
  });
}

export async function cancelOrderItem(params: {
  orderItemId: string;
  userId: string;
  orderId: string;
}) {
  if (!params.orderItemId || !params.userId || !params.orderId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "orderItemId, userId, and orderId are required",
    );
  }

  return await prisma.$transaction(async (tx) => {
    const orderItem = await tx.orderItem.findFirst({
      where: {
        id: params.orderItemId,
        orderId: params.orderId,
        order: {
          userId: params.userId,
        },
      },
    });

    if (!orderItem) {
      throw new AppError(
        ErrorCode.ORDER_ITEM_NOT_FOUND,
        404,
        ErrorMessages.ORDER_ITEM_NOT_FOUND,
      );
    }

    if (
      ITEM_STATUS_NOT_ALLOWED_TO_CANCEL.includes(
        orderItem.status as OrderItemStatus,
      )
    ) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        400,
        `Cannot cancel order item with status ${orderItem.status}`,
      );
    }

    const result = await tx.orderItem.updateMany({
      where: {
        id: params.orderItemId,
        orderId: params.orderId,
        order: {
          userId: params.userId,
        },
        status: {
          notIn: ITEM_STATUS_NOT_ALLOWED_TO_CANCEL,
        },
      },
      data: {
        status: OrderItemStatus.CANCELLED,
      },
    });

    if (result.count === 0) {
      throw new AppError(
        ErrorCode.BAD_REQUEST,
        400,
        `Cannot cancel order item with status ${orderItem.status}`,
      );
    }

    if (result.count > 0) {
      await tx.product.update({
        where: {
          id: orderItem.productId,
        },
        data: {
          stock: {
            increment: orderItem.quantity,
          },
        },
      });

      await tx.order.update({
        where: {
          id: params.orderId,
        },
        data: {
          totalAmount: {
            decrement: orderItem.lineTotal,
          },
        },
      });
    }

    const remainingActiveItem = await tx.orderItem.count({
      where: {
        orderId: params.orderId,
        status: {
          not: OrderItemStatus.CANCELLED,
        },
      },
    });

    if (remainingActiveItem === 0) {
      await tx.order.update({
        where: {
          id: params.orderId,
        },
        data: {
          status: OrderStatus.CANCELLED,
          totalAmount: 0,
        },
      });
    }

    const updatedOrder = await tx.order.findFirst({
      where: {
        id: params.orderId,
        userId: params.userId,
      },
      include: {
        items: true,
      },
    });

    if (!updatedOrder) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, "Order not found");
    }

    return mapOrderDetail(updatedOrder);
  });
}
