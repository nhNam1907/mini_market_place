import { Router } from "express";

import authRoutes from "./authRoutes.js";
import categoriesRoutes from "./categoriesRoutes.js";
import healthRoutes from "./healthRoutes.js";
import publicProductRoutes from "./publicProductRoutes.js";
import sellerProductRoutes from "./sellerProductRoutes.js";
import shopRoutes from "./shopRoutes.js";
import cartRoutes from "./cartRoutes.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Market Place API",
  });
});

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/seller", sellerProductRoutes);
router.use("/store", publicProductRoutes);
router.use("/store/shops", shopRoutes);
router.use("/categories", categoriesRoutes);
router.use("/cart", cartRoutes);

export default router;
