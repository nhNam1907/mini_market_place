import { Router } from "express";

import {
  getSellerShopProfileHandler,
  updateSellerShopProfileHandler,
} from "../controllers/sellerShopController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { USER_ROLE } from "../types/role.js";

const router = Router();

router.use(requireAuth, requireRole(USER_ROLE.SELLER));

router.get("/", getSellerShopProfileHandler);
router.patch("/", updateSellerShopProfileHandler);

export default router;
