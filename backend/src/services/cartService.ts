import type { Prisma } from "@prisma/client";

import { AppError, ErrorCode, ErrorMessages } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

type CartItemWithProduct = Prisma.CartItemGetPayload<{
  include: {
    product: {
      include: {
        category: true;
        shop: true;
      };
    };
  };
}>;

type CartItemWithCartAndProduct = Prisma.CartItemGetPayload<{
  include: {
    cart: true;
    product: {
      include: {
        category: true;
        shop: true;
      };
    };
  };
}>;

function mapCartItem(item: CartItemWithProduct | CartItemWithCartAndProduct) {
  const price = Number(item.product.price);
  const lineTotal = price * item.quantity;

  return {
    id: item.id,
    quantity: item.quantity,
    lineTotal,
    product: {
      id: item.product.id,
      name: item.product.name,
      description: item.product.description,
      price,
      stock: item.product.stock,
      imageUrl: item.product.imageUrl,
      category: {
        id: item.product.category.id,
        name: item.product.category.name,
      },
      shop: {
        id: item.product.shop.id,
        name: item.product.shop.name,
      },
    },
  };
}

async function getCartItemById(cartItemId: string) {
  return prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      product: {
        include: {
          category: true,
          shop: true,
        },
      },
    },
  });
}

async function getOwnedCartItem(userId: string, cartItemId: string) {
  return prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      product: {
        include: {
          category: true,
          shop: true,
        },
      },
    },
  }).then((cartItem) => {
    if (!cartItem || cartItem.cart.userId !== userId) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, "Cart item not found");
    }

    return cartItem;
  });
}

export async function getCart(userId: string) {
  const result = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
              shop: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!result) {
    return {
      id: null,
      items: [],
      summary: {
        totalItems: 0,
        subtotal: 0,
      },
    };
  }

  const items = result.items.map((item) => mapCartItem(item));

  const summary = items.reduce(
    (acc: { totalItems: number; subtotal: number }, item) => {
      acc.totalItems += item.quantity;
      acc.subtotal += item.lineTotal;
      return acc;
    },
    {
      totalItems: 0,
      subtotal: 0,
    },
  );

  return {
    id: result.id,
    items,
    summary,
  };
}

type AddCartItemParams = {
  userId: string;
  productId: string;
  quantity: number;
};

export async function addCartItem({ userId, productId, quantity }: AddCartItemParams) {
  if (!userId || !productId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "userId and productId are required",
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "quantity must be a positive integer",
    );
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError(
      ErrorCode.PRODUCT_NOT_FOUND,
      404,
      ErrorMessages.PRODUCT_NOT_FOUND,
    );
  }

  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      productId,
    },
  });

  if (existingCartItem) {
    const nextQuantity = existingCartItem.quantity + quantity;

    if (nextQuantity > product.stock) {
      throw new AppError(
        ErrorCode.INSUFFICIENT_STOCK,
        400,
        ErrorMessages.INSUFFICIENT_STOCK,
      );
    }

    await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: nextQuantity,
      },
    });

    const updatedCartItem = await getCartItemById(existingCartItem.id);

    if (!updatedCartItem) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, "Cart item not found");
    }

    return mapCartItem(updatedCartItem);
  }

  if (quantity > product.stock) {
    throw new AppError(
      ErrorCode.INSUFFICIENT_STOCK,
      400,
      ErrorMessages.INSUFFICIENT_STOCK,
    );
  }

  const createdCartItem = await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });

  const createdCartItemWithProduct = await getCartItemById(createdCartItem.id);

  if (!createdCartItemWithProduct) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Cart item not found");
  }

  return mapCartItem(createdCartItemWithProduct);
}

export async function updateCartItemQuantity({
  userId,
  cartItemId,
  quantity,
}: {
  userId: string;
  cartItemId: string;
  quantity: number;
}) {
  if (!userId || !cartItemId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "userId and cartItemId are required",
    );
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "quantity must be a positive integer",
    );
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Cart not found");
  }

  const cartItem = await getOwnedCartItem(userId, cartItemId);

  if (quantity > cartItem.product.stock) {
    throw new AppError(
      ErrorCode.INSUFFICIENT_STOCK,
      400,
      ErrorMessages.INSUFFICIENT_STOCK,
    );
  }

  const updatedCartItem = await prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity,
    },
    include: {
      product: {
        include: {
          category: true,
          shop: true,
        },
      },
    },
  });

  return mapCartItem(updatedCartItem);
}

export async function removeCartItem({
  userId,
  cartItemId,
}: {
  userId: string;
  cartItemId: string;
}) {
  if (!userId || !cartItemId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "userId and cartItemId are required",
    );
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Cart not found");
  }

  const cartItem = await getOwnedCartItem(userId, cartItemId);

  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return mapCartItem(cartItem);
}
