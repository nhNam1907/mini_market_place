import { Router } from "express";

import { uploadProductImagesHandler, uploadTestProductImageHandler } from "../controllers/uploadController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { uploadProductImages, uploadSingleProductImage } from "../middlewares/uploadProductImage.js";
import { USER_ROLE } from "../types/role.js";

const router = Router();

router.post(
  "/upload-image",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  uploadSingleProductImage,
  uploadTestProductImageHandler,
);

router.post(
  "/upload-images",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  uploadProductImages,
  uploadProductImagesHandler,
);

export default router;

