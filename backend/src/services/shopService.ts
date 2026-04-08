import type { Prisma } from "@prisma/client";
import type { PublicProductSortBy, PublicProductSortOrder } from "@market-place/shared/api";

import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { buildOrderBy } from "./publicProductService.js";

export async function getShopInfo(id: string) {
  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Shop not found");
  }

  return {
    id: shop.id,
    name: shop.name,
    description: shop.description,
    owner: {
      id: shop.owner.id,
      name: shop.owner.name,
    },
  };
}

type GetProductsOfShopInput = {
  shopId: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy: PublicProductSortBy;
  sortOrder: PublicProductSortOrder;
  search?: string;
  categoryId?: string;
};

export async function getProductsOfShop(input: GetProductsOfShopInput) {
  const {
    shopId,
    pageNumber = 1,
    pageSize = 12,
    sortBy,
    sortOrder,
    search,
    categoryId,
  } = input;

  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: { id: true },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Shop not found");
  }

  const whereClause: Prisma.ProductWhereInput = {
    shopId,
    ...(categoryId ? { categoryId } : {}),
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }
      : {}),
  };

  const [totalItems, products] = await Promise.all([
    prisma.product.count({ where: whereClause }),
    prisma.product.findMany({
      where: whereClause,
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      orderBy: buildOrderBy(sortBy, sortOrder),
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        shop: {
          select: {
            id: true,
            name: true,
          },
        },
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
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      stock: product.stock,
      imageUrl: product.imageUrl,
      category: {
        id: product.category.id,
        name: product.category.name,
      },
      shop: {
        id: product.shop.id,
        name: product.shop.name,
      },
    })),
  };
}
