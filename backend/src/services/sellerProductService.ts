import type { Prisma } from "@prisma/client";

import { AppError, ErrorCode } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import {
  deleteProductImages,
  type UploadProductImageInput,
  type UploadedProductImage,
  uploadProductImages,
} from "./uploadService.js";
import { OrderItemStatus } from "../types/orderStatus.js";

type GetSellerProductsInput = {
  userId: string;
  status?: string;
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
    deletedAt: product.deletedAt,
    isActive: product.isActive,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const statusMap: any = {
  active: true,
  inactive: false,
};

export async function getSellerProducts({
  userId,
  status,
}: GetSellerProductsInput) {
  const shop = await getSellerShop(userId);

  if (status && !["active", "inactive"].includes(status)) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Invalid status value. Allowed values are 'active' or 'inactive'",
    );
  }

  const whereClause: Prisma.ProductWhereInput = {
    shopId: shop.id,
    isActive: !status ? undefined : !!statusMap[status],
  };

  const products = await prisma.product.findMany({
    where: whereClause,
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

type UpdateSellerProductInput = {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
};

export async function updateSellerProduct(
  userId: string,
  productId: string,
  payload: UpdateSellerProductInput,
) {
  if (
    payload.price !== undefined &&
    (!Number.isFinite(payload.price) || payload.price <= 0)
  ) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Price must be greater than 0",
    );
  }

  if (
    payload.stock !== undefined &&
    (!Number.isInteger(payload.stock) || payload.stock < 0)
  ) {
    throw new AppError(
      ErrorCode.VALIDATION_FAILED,
      400,
      "Stock must be 0 or greater",
    );
  }
  const shop = await getSellerShop(userId);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
  });

  if (!product) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(ErrorCode.NOT_FOUND, 404, "Category not found");
    }
  } else {
    payload.categoryId = product.categoryId;
  }

  const dataUpdate = {
    name: payload.name ?? product.name,
    description: payload.description ?? product.description,
    price: payload.price ?? product.price,
    stock: payload.stock ?? product.stock,
    categoryId: payload.categoryId,
  };

  const updateProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: dataUpdate,
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

  return mapSellerProduct(updateProduct);
}

export async function replaceSellerProductImages(params: {
  userId: string;
  productId: string;
  files: UploadProductImageInput[];
}) {
  const { userId, productId, files } = params;

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

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
    include: {
      images: true,
    },
  });

  if (!product) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  const oldImages = product.images;

  const uploadedImages = await uploadProductImages(
    files.map((file) => ({
      ...file,
      sellerId: shop.id,
    })),
  );

  validateProductImages(uploadedImages);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({
        where: {
          productId: product.id,
        },
      });

      await tx.productImage.createMany({
        data: uploadedImages.map((image) => ({
          productId: product.id,
          imageUrl: image.imageUrl,
          imageKey: image.imageKey,
          sortOrder: image.sortOrder,
        })),
      });
    });
  } catch (error) {
    await deleteProductImages(uploadedImages.map((image) => image.imageKey));
    throw error;
  }

  try {
    await deleteProductImages(oldImages.map((img) => img.imageKey));
  } catch (error) {
    console.error("Failed to delete old product images", error);
  }

  const updatedProduct = await prisma.product.findFirst({
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

  if (!updatedProduct) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  return mapSellerProduct(updatedProduct);
}

export async function deleteSellerProduct(userId: string, productId: string) {
  const shop = await getSellerShop(userId);

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      shopId: shop.id,
    },
    include: {
      images: true,
    },
  });

  if (!product) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  await prisma.product.update({
    where: {
      id: productId,
      shopId: shop.id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });

  return;
}

export async function restoreSellerProduct(userId: string, productId: string) {
  const shop = await getSellerShop(userId);

  const clauseWhere = {
    id: productId,
    shopId: shop.id,
  };

  const product = await prisma.product.findFirst({
    where: clauseWhere,
  });

  if (!product) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Product not found");
  }

  if (product.isActive === true) {
    throw new AppError(ErrorCode.BAD_REQUEST, 400, "Product is already active");
  }

  const rq = await prisma.product.update({
    where: clauseWhere,
    data: {
      isActive: true,
      deletedAt: null,
    },
  });

  if (!rq) {
    throw new AppError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      500,
      "Failed to restore product",
    );
  }

  const updatedProduct = await prisma.product.findFirst({
    where: clauseWhere,
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

  if (!updatedProduct) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      404,
      "Product not found after restore",
    );
  }

  return mapSellerProduct(updatedProduct);
}

export async function getSellerMetrics(userId: string) {
  const shop = await prisma.shop.findFirst({
    where: {
      ownerId: userId,
    },
  });

  if (!shop) {
    throw new AppError(ErrorCode.NOT_FOUND, 404, "Seller shop not found");
  }

  const totalProducts = await prisma.product.count({
    where: {
      shopId: shop.id,
    },
  });

  const allProducts = await prisma.product.findMany({
    where: {
      shopId: shop.id,
    },
  });

  const activeProducts = allProducts.filter((product) => product.isActive);

  const inactiveProducts = allProducts.filter((product) => !product.isActive);

  const orderedProducts = await prisma.orderItem.findMany({
    where: {
      shopId: shop.id,
    },
  });

  const totalOrderedProducts = orderedProducts.length;

  const completedOrders = orderedProducts.filter(
    (order) => order.status === OrderItemStatus.COMPLETED,
  );

  const revenue = completedOrders.reduce(
    (sum, order) => sum + order.quantity * Number(order.unitPrice),
    0,
  );

  const recentOrderItems = await prisma.orderItem.findMany({
    where: {
      shopId: shop.id,
      status: "CONFIRMED",
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      order: {
        include: {
          user: true,
        },
      },
    },
    take: 5,
  });

  return {
    products: {
      totalProducts,
      activeProducts: activeProducts.length,
      inactiveProducts: inactiveProducts.length,
    },
    orders: {
      totalOrderedProducts,
      pending: orderedProducts.filter(
        (order) => order.status === OrderItemStatus.PENDING,
      ).length,
      shipping: orderedProducts.filter(
        (order) => order.status === OrderItemStatus.SHIPPING,
      ).length,
      delivered: orderedProducts.filter(
        (order) => order.status === OrderItemStatus.DELIVERED,
      ).length,
      cancelled: orderedProducts.filter(
        (order) => order.status === OrderItemStatus.CANCELLED,
      ).length,
      completed: completedOrders.length,
      confirmed: orderedProducts.filter(
        (order) => order.status === OrderItemStatus.CONFIRMED,
      ).length,
    },
    revenue: {
      revenue,
      completed: completedOrders.length,
    },
    recentOrderItems: recentOrderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      status: item.status,
      createdAt: item.createdAt,
      orderId: item.orderId,
      lineTotal: item.quantity * Number(item.unitPrice),
      productName: item.productName,
      buyer: {
        name: item.order.user.name,
        email: item.order.user.email,
      },
    })),
  };
}
