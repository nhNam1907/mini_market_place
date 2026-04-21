import { Router } from "express";
import { getSellerOrderDetailHandler, getSellerOrderItemHandler, updateSellerOrderItemStatusHandler } from "../controllers/sellerOrderController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { USER_ROLE } from "../types/role.js";

const route = Router();

route.get(
  "/items",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  getSellerOrderItemHandler,
);

route.put(
  "/items/:orderItemId/status",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  updateSellerOrderItemStatusHandler,
);


route.get(
  "/:orderId",
  requireAuth,
  requireRole(USER_ROLE.SELLER),
  getSellerOrderDetailHandler,
);

export default route;
