import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

type GetSellerProductsInput = {
  userId: string;
};

type CreateSellerProductInput = {
  userId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl?: string;
  categoryId: string;
};

async function getSellerShop(userId: string) {
  const shop = await prisma.shop.findUnique({
    where: {
      ownerId: userId,
    },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Shop not found for this seller");
  }

  return shop;
}

export async function getSellerProducts({ userId }: GetSellerProductsInput) {
  const shop = await getSellerShop(userId);

  const products = await prisma.product.findMany({
    where: {
      shopId: shop.id,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map((product) => ({
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
      id: shop.id,
      name: shop.name,
    },
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  }));
}

export async function createSellerProduct({
  userId,
  name,
  description,
  price,
  stock,
  imageUrl,
  categoryId,
}: CreateSellerProductInput) {
  if (!name || !categoryId) {
    throw new AppError(ErrorCode.MISSING_FIELDS, 400, "Name and category are required");
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Price must be greater than 0");
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new AppError(ErrorCode.VALIDATION_FAILED, 400, "Stock must be 0 or greater");
  }

  const shop = await getSellerShop(userId);

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Category not found");
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      imageUrl,
      categoryId: category.id,
      shopId: shop.id,
    },
    include: {
      category: true,
      shop: true,
    },
  });

  return {
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
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}
