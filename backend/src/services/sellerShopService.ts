import type { Prisma } from "@prisma/client";

import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

type SellerShopWithOwner = Prisma.ShopGetPayload<{
  include: {
    owner: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

type UpdateSellerShopInput = {
  name?: string;
  description?: string | null;
};

function mapSellerShop(shop: SellerShopWithOwner) {
  return {
    id: shop.id,
    name: shop.name,
    description: shop.description,
    createdAt: shop.createdAt,
    updatedAt: shop.updatedAt,
    owner: {
      id: shop.owner.id,
      name: shop.owner.name,
      email: shop.owner.email,
    },
  };
}

async function findSellerShop(userId: string) {
  if (!userId) {
    throw new AppError(ErrorCode.AUTHENTICATION_FAILED, 401, "Unauthorized");
  }

  const shop = await prisma.shop.findUnique({
    where: {
      ownerId: userId,
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Shop not found");
  }

  return shop;
}

export async function getSellerShopProfile(userId: string) {
  const shop = await findSellerShop(userId);
  return mapSellerShop(shop);
}

export async function updateSellerShopProfile(
  userId: string,
  input: UpdateSellerShopInput,
) {
  const shop = await findSellerShop(userId);
  const data: Prisma.ShopUpdateInput = {};

  if (input.name !== undefined) {
    const name = input.name.trim();

    if (!name) {
      throw new AppError(
        ErrorCode.VALIDATION_FAILED,
        400,
        "Shop name is required",
      );
    }

    data.name = name;
  }

  if (input.description !== undefined) {
    data.description = input.description?.trim() || null;
  }

  if (Object.keys(data).length === 0) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "At least one shop field is required",
    );
  }

  const updatedShop = await prisma.shop.update({
    where: {
      id: shop.id,
    },
    data,
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return mapSellerShop(updatedShop);
}
