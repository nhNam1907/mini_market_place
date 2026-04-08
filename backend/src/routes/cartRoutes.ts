import { Router } from "express";

import { addCartItemHandler, getUserCart } from "../controllers/cartController.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const route = Router();

route.get("/", requireAuth, getUserCart);
route.post("/items", requireAuth, addCartItemHandler);

export default route;
