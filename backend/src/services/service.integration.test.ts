import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import type { prisma as prismaClient } from "../lib/prisma.js";
import type * as cartServiceModule from "./cartService.js";
import type * as orderServiceModule from "./orderService.js";
import type * as publicProductServiceModule from "./publicProductService.js";
import type * as sellerProductServiceModule from "./sellerProductService.js";
import type * as shopServiceModule from "./shopService.js";

const shouldRunIntegrationTests = process.env.RUN_SERVICE_TESTS === "true";

type PrismaClientInstance = typeof prismaClient;
type SellerProductServiceModule = typeof sellerProductServiceModule;
type PublicProductServiceModule = typeof publicProductServiceModule;
type ShopServiceModule = typeof shopServiceModule;
type CartServiceModule = typeof cartServiceModule;
type OrderServiceModule = typeof orderServiceModule;

let prisma: PrismaClientInstance;
let sellerProductService: SellerProductServiceModule;
let publicProductService: PublicProductServiceModule;
let shopService: ShopServiceModule;
let cartService: CartServiceModule;
let orderService: OrderServiceModule;

const runId = `svc-test-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const testIds = {
  users: [] as string[],
  shops: [] as string[],
  categories: [] as string[],
  products: [] as string[],
};

const ctx = {
  sellerId: "",
  buyerId: "",
  shopId: "",
  categoryId: "",
  activeProductId: "",
  inactiveProductId: "",
  checkoutInactiveProductId: "",
};

async function seedServiceTestData() {
  const seller = await prisma.user.create({
    data: {
      name: `${runId} seller`,
      email: `${runId}-seller@example.com`,
      password: "hashed-password",
      role: "SELLER",
      shop: {
        create: {
          name: `${runId} shop`,
          description: "Service test shop",
        },
      },
    },
    include: {
      shop: true,
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: `${runId} buyer`,
      email: `${runId}-buyer@example.com`,
      password: "hashed-password",
      role: "USER",
    },
  });

  const otherSeller = await prisma.user.create({
    data: {
      name: `${runId} other seller`,
      email: `${runId}-other-seller@example.com`,
      password: "hashed-password",
      role: "SELLER",
      shop: {
        create: {
          name: `${runId} other shop`,
        },
      },
    },
    include: {
      shop: true,
    },
  });

  assert.ok(seller.shop);
  assert.ok(otherSeller.shop);

  const category = await prisma.category.create({
    data: {
      name: `${runId} category`,
    },
  });

  const activeProduct = await prisma.product.create({
    data: {
      name: `${runId} active product`,
      description: "Visible product",
      price: "100.00",
      stock: 10,
      categoryId: category.id,
      shopId: seller.shop.id,
      images: {
        create: {
          imageUrl: "https://example.com/active-product.jpg",
          imageKey: `${runId}/active-product`,
          sortOrder: 0,
        },
      },
    },
  });

  const inactiveProduct = await prisma.product.create({
    data: {
      name: `${runId} inactive product`,
      description: "Soft deleted product",
      price: "200.00",
      stock: 10,
      categoryId: category.id,
      shopId: seller.shop.id,
      isActive: false,
      deletedAt: new Date(),
      images: {
        create: {
          imageUrl: "https://example.com/inactive-product.jpg",
          imageKey: `${runId}/inactive-product`,
          sortOrder: 0,
        },
      },
    },
  });

  const checkoutInactiveProduct = await prisma.product.create({
    data: {
      name: `${runId} checkout inactive product`,
      description: "Inactive cart product",
      price: "300.00",
      stock: 10,
      categoryId: category.id,
      shopId: seller.shop.id,
      isActive: false,
      deletedAt: new Date(),
      images: {
        create: {
          imageUrl: "https://example.com/checkout-inactive-product.jpg",
          imageKey: `${runId}/checkout-inactive-product`,
          sortOrder: 0,
        },
      },
    },
  });

  const otherShopProduct = await prisma.product.create({
    data: {
      name: `${runId} other shop product`,
      price: "400.00",
      stock: 10,
      categoryId: category.id,
      shopId: otherSeller.shop.id,
    },
  });

  await prisma.cart.create({
    data: {
      userId: buyer.id,
      items: {
        create: {
          productId: checkoutInactiveProduct.id,
          quantity: 1,
        },
      },
    },
  });

  testIds.users.push(seller.id, buyer.id, otherSeller.id);
  testIds.shops.push(seller.shop.id, otherSeller.shop.id);
  testIds.categories.push(category.id);
  testIds.products.push(
    activeProduct.id,
    inactiveProduct.id,
    checkoutInactiveProduct.id,
    otherShopProduct.id,
  );

  ctx.sellerId = seller.id;
  ctx.buyerId = buyer.id;
  ctx.shopId = seller.shop.id;
  ctx.categoryId = category.id;
  ctx.activeProductId = activeProduct.id;
  ctx.inactiveProductId = inactiveProduct.id;
  ctx.checkoutInactiveProductId = checkoutInactiveProduct.id;
}

async function cleanupServiceTestData() {
  if (!prisma) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: {
      cart: {
        userId: {
          in: testIds.users,
        },
      },
    },
  });

  await prisma.cart.deleteMany({
    where: {
      userId: {
        in: testIds.users,
      },
    },
  });

  await prisma.productImage.deleteMany({
    where: {
      productId: {
        in: testIds.products,
      },
    },
  });

  await prisma.product.deleteMany({
    where: {
      id: {
        in: testIds.products,
      },
    },
  });

  await prisma.category.deleteMany({
    where: {
      id: {
        in: testIds.categories,
      },
    },
  });

  await prisma.shop.deleteMany({
    where: {
      id: {
        in: testIds.shops,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in: testIds.users,
      },
    },
  });
}

describe(
  "marketplace service integration",
  {
    concurrency: false,
    skip: shouldRunIntegrationTests
      ? false
      : "Set RUN_SERVICE_TESTS=true to run database integration tests",
  },
  () => {
    before(async () => {
      const prismaModule = await import("../lib/prisma.js");
      const sellerProductServiceModule = await import("./sellerProductService.js");
      const publicProductServiceModule = await import("./publicProductService.js");
      const shopServiceModule = await import("./shopService.js");
      const cartServiceModule = await import("./cartService.js");
      const orderServiceModule = await import("./orderService.js");

      prisma = prismaModule.prisma;
      sellerProductService = sellerProductServiceModule;
      publicProductService = publicProductServiceModule;
      shopService = shopServiceModule;
      cartService = cartServiceModule;
      orderService = orderServiceModule;

      await seedServiceTestData();
    });

    after(async () => {
      await cleanupServiceTestData();
      await prisma.$disconnect();
    });

    it("filters seller products by active and inactive status", async () => {
      const activeProducts = await sellerProductService.getSellerProducts({
        userId: ctx.sellerId,
        status: "active",
      });

      assert.ok(activeProducts.some((product) => product.id === ctx.activeProductId));
      assert.ok(!activeProducts.some((product) => product.id === ctx.inactiveProductId));

      const inactiveProducts = await sellerProductService.getSellerProducts({
        userId: ctx.sellerId,
        status: "inactive",
      });

      assert.ok(inactiveProducts.some((product) => product.id === ctx.inactiveProductId));
      assert.ok(!inactiveProducts.some((product) => product.id === ctx.activeProductId));
    });

    it("rejects invalid seller product status", async () => {
      await assert.rejects(
        () =>
          sellerProductService.getSellerProducts({
            userId: ctx.sellerId,
            status: "deleted",
          }),
        {
          statusCode: 400,
        },
      );
    });

    it("hides inactive products from public catalog and detail", async () => {
      const productList = await publicProductService.getPublicProducts({
        pageNumber: 1,
        pageSize: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      assert.ok(productList.products.some((product) => product.id === ctx.activeProductId));
      assert.ok(!productList.products.some((product) => product.id === ctx.inactiveProductId));

      const inactiveProductDetail = await publicProductService.getPublicProductById(
        ctx.inactiveProductId,
      );

      assert.equal(inactiveProductDetail, null);
    });

    it("hides inactive products from public shop products", async () => {
      const shopProducts = await shopService.getProductsOfShop({
        shopId: ctx.shopId,
        pageNumber: 1,
        pageSize: 50,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      assert.ok(shopProducts.products.some((product) => product.id === ctx.activeProductId));
      assert.ok(!shopProducts.products.some((product) => product.id === ctx.inactiveProductId));
    });

    it("blocks adding inactive products to cart", async () => {
      await assert.rejects(
        () =>
          cartService.addCartItem({
            userId: ctx.buyerId,
            productId: ctx.inactiveProductId,
            quantity: 1,
          }),
        {
          statusCode: 404,
        },
      );
    });

    it("blocks checkout when an existing cart item product is inactive", async () => {
      await assert.rejects(
        () =>
          orderService.checkoutCart({
            userId: ctx.buyerId,
          }),
        {
          statusCode: 404,
        },
      );
    });

    it("soft deletes and restores a seller product without deleting image records", async () => {
      await sellerProductService.deleteSellerProduct(ctx.sellerId, ctx.activeProductId);

      const deletedProduct = await prisma.product.findUniqueOrThrow({
        where: {
          id: ctx.activeProductId,
        },
        include: {
          images: true,
        },
      });

      assert.equal(deletedProduct.isActive, false);
      assert.ok(deletedProduct.deletedAt);
      assert.equal(deletedProduct.images.length, 1);

      const restoredProduct = await sellerProductService.restoreSellerProduct(
        ctx.sellerId,
        ctx.activeProductId,
      );

      assert.equal(restoredProduct.isActive, true);
      assert.equal(restoredProduct.deletedAt, null);
    });
  },
);
