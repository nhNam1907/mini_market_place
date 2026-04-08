import { Router } from "express";

import {
  createProduct,
  getMyProducts,
} from "../controllers/sellerProductController.js";
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
  createProduct,
);

export default router;
