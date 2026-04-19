import { Router } from "express";

import {
  cancelOrderHandler,
  cancelOrderItemHandler,
  checkoutCartHandler,
  getDetailOrderHandler,
  getUserOrdersHandler,
} from "../controllers/orderController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const route = Router();

route.get("/", requireAuth, getUserOrdersHandler);
route.post("/checkout", requireAuth, checkoutCartHandler);
route.get("/:orderId", requireAuth, getDetailOrderHandler);
route.patch("/:orderId/cancel", requireAuth, cancelOrderHandler);
route.patch(
  "/:orderId/items/:orderItemId/cancel",
  requireAuth,
  cancelOrderItemHandler,
);

export default route;
