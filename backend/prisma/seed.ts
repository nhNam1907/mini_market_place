import "dotenv/config";

import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@marketplace.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.create({
    data: {
      name: "Demo Seller",
      email: "seller@marketplace.com",
      password: hashedPassword,
      role: "SELLER",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "user@marketplace.com",
      password: hashedPassword,
      role: "USER",
    },
  });

  const shop = await prisma.shop.create({
    data: {
      name: "Demo Tech Store",
      description: "Electronics and accessories",
      ownerId: seller.id,
    },
  });

  const laptopCategory = await prisma.category.create({
    data: {
      name: "Laptop",
    },
  });

  const accessoryCategory = await prisma.category.create({
    data: {
      name: "Accessories",
    },
  });

  const laptop = await prisma.product.create({
    data: {
      name: "Laptop Dell XPS",
      description: "Premium ultrabook for developers",
      price: 35000000,
      stock: 12,
      imageUrl: "https://example.com/dell-xps.jpg",
      categoryId: laptopCategory.id,
      shopId: shop.id,
    },
  });

  const mouse = await prisma.product.create({
    data: {
      name: "Wireless Mouse",
      description: "Comfortable mouse for daily work",
      price: 650000,
      stock: 30,
      imageUrl: "https://example.com/mouse.jpg",
      categoryId: accessoryCategory.id,
      shopId: shop.id,
    },
  });

  const keyboard = await prisma.product.create({
    data: {
      name: "Mechanical Keyboard",
      description: "Tactile keyboard for typing and gaming",
      price: 1900000,
      stock: 20,
      imageUrl: "https://example.com/keyboard.jpg",
      categoryId: accessoryCategory.id,
      shopId: shop.id,
    },
  });

  const cart = await prisma.cart.create({
    data: {
      userId: user.id,
    },
  });

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: cart.id,
        productId: laptop.id,
        quantity: 1,
      },
      {
        cartId: cart.id,
        productId: mouse.id,
        quantity: 2,
      },
      {
        cartId: cart.id,
        productId: keyboard.id,
        quantity: 1,
      },
    ],
  });

  console.log("Seed completed successfully");
  console.log({
    adminEmail: admin.email,
    sellerEmail: seller.email,
    userEmail: user.email,
    cartUserEmail: user.email,
    cartId: cart.id,
  });
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
