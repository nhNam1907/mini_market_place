import { Router } from "express";

import {
  createProduct,
  deleteSellerProductHandler,
  getMyProducts,
  getSellerMetricHandler,
  getSellerProductByIdHandler,
  replaceSellerProductImagesHandler,
  restoreSellerProductHandler,
  updateSellerProductHandler,
} from "../controllers/sellerProductController.js";
import { uploadProductImages } from "../middlewares/uploadProductImage.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { USER_ROLE } from "../types/role.js";

const router = Router();

router.get(
  "/products",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  getMyProducts,
);

router.post(
  "/products",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  uploadProductImages,
  createProduct,
);

router.get(
  "/products/:productId",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  getSellerProductByIdHandler,
);

router.patch(
  "/products/:productId",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  updateSellerProductHandler,
);

router.put(
  "/products/:productId/images",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  uploadProductImages,
  replaceSellerProductImagesHandler,
);

router.delete(
  "/products/:productId",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  deleteSellerProductHandler,
);

router.patch(
  "/products/:productId/restore",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  restoreSellerProductHandler,
);

router.get(
  "/metrics",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  getSellerMetricHandler,
);

export default router;
