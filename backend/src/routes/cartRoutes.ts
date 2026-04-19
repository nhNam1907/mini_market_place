import { Router } from "express";

import {
  addCartItemHandler,
  getUserCart,
  removeCartItemHandler,
  updateCartItemQuantityHandler,
} from "../controllers/cartController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const route = Router();

route.get("/", requireAuth, getUserCart);
route.post("/items", requireAuth, addCartItemHandler);
route.patch("/items/:cartItemId", requireAuth, updateCartItemQuantityHandler);
route.delete("/items/:cartItemId", requireAuth, removeCartItemHandler);

export default route;
