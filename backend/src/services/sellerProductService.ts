import type { Prisma } from "@prisma/client";

import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import {
  deleteProductImages,
  type UploadProductImageInput,
  type UploadedProductImage,
  uploadProductImages,
} from "./uploadService.js";

type GetSellerProductsInput = {
  userId: string;
};

type SellerProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    shop: true;
    images: {
      orderBy: {
        sortOrder: "asc";
      };
    };
  };
}>;

type CreateSellerProductInput = {
  userId: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: string;
  files: UploadProductImageInput[];
};

const MAX_PRODUCT_IMAGES = 5;

function mapSellerProduct(product: SellerProductWithRelations) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    stock: product.stock,
    category: {
      id: product.category.id,
      name: product.category.name,
    },
    shop: {
      id: product.shop.id,
      name: product.shop.name,
    },
    images: product.images.map((image) => ({
      id: image.id,
      imageUrl: image.imageUrl,
      imageKey: image.imageKey,
      sortOrder: image.sortOrder,
      createdAt: image.createdAt,
    })),
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function validateProductImages(images: UploadedProductImage[]) {
  if (!images.length) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "At least one product image is required",
    );
  }

  if (images.length > MAX_PRODUCT_IMAGES) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
    );
  }

  const sortOrders = images.map((image) => image.sortOrder);
  const uniqueSortOrders = new Set(sortOrders);

  if (uniqueSortOrders.size !== images.length) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Each product image must have a unique sortOrder",
    );
  }
}

async function getSellerShop(userId: string) {
  const shop = await prisma.shop.findUnique({
    where: {
      ownerId: userId,
    },
  });

  if (!shop) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      404,
      "Shop not found for this seller",
    );
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
      shop: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map(mapSellerProduct);
}

export async function createSellerProduct({
  userId,
  name,
  description,
  price,
  stock,
  categoryId,
  files,
}: CreateSellerProductInput) {
  if (!name || !categoryId) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "Name and category are required",
    );
  }

  if (!Number.isFinite(price) || price <= 0) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Price must be greater than 0",
    );
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Stock must be 0 or greater",
    );
  }

  if (!files.length) {
    throw new AppError(
      ErrorCode.MISSING_FIELDS,
      400,
      "At least one product image is required",
    );
  }

  if (files.length > MAX_PRODUCT_IMAGES) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      `A product can have at most ${MAX_PRODUCT_IMAGES} images`,
    );
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

  const uploadedImages = await uploadProductImages(
    files.map((file) => ({
      ...file,
      sellerId: shop.id,
    })),
  );
  validateProductImages(uploadedImages);

  try {
    const product = await prisma.$transaction(async (tx) => {
      const createdProduct = await tx.product.create({
        data: {
          name,
          description,
          price,
          stock,
          categoryId: category.id,
          shopId: shop.id,
        },
      });

      await tx.productImage.createMany({
        data: uploadedImages.map((image) => ({
          productId: createdProduct.id,
          imageUrl: image.imageUrl,
          imageKey: image.imageKey,
          sortOrder: image.sortOrder,
        })),
      });

      const productWithRelations = await tx.product.findUnique({
        where: {
          id: createdProduct.id,
        },
        include: {
          category: true,
          shop: true,
          images: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

      if (!productWithRelations) {
        throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
      }

      return productWithRelations;
    });

    return mapSellerProduct(product);
  } catch (error) {
    await deleteProductImages(uploadedImages.map((image) => image.imageKey));
    throw error;
  }
}

export async function getSellerProductById(productId: string, userId: string) {
  const shop = await getSellerShop(userId);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
    include: {
      category: true,
      shop: true,
      images: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  return mapSellerProduct(product);
}
