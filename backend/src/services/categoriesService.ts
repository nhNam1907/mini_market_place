import { prisma } from "../lib/prisma.js";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });
}
