import type { Prisma } from "@prisma/client";
import type {
  PublicProductSortBy,
  PublicProductSortOrder,
} from "@market-place/shared/api";

import { prisma } from "../lib/prisma.js";

export type PublicProductParameters = {
  categoryId?: string;
  pageSize: number;
  pageNumber: number;
  search?: string;
  sortBy: PublicProductSortBy;
  sortOrder: PublicProductSortOrder;
};

export function buildOrderBy(
  sortBy: PublicProductSortBy,
  sortOrder: PublicProductSortOrder,
): Prisma.ProductOrderByWithRelationInput {
  switch (sortBy) {
    case "price":
      return { price: sortOrder };
    case "name":
      return { name: sortOrder };
    default:
      return { createdAt: sortOrder };
  }
}

export async function getPublicProducts(params: PublicProductParameters) {
  const { categoryId, pageSize, pageNumber, search, sortBy, sortOrder } =
    params;

  const whereClause: Prisma.ProductWhereInput = {
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
        category: true,
        shop: true,
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
    products,
  };
}

export async function getPublicProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      shop: true,
    },
  });

  if (!product) {
    return null;
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    imageUrl: product.imageUrl,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
    shop: {
      id: product.shop.id,
      name: product.shop.name,
    },
    stock: product.stock,
  };
}
