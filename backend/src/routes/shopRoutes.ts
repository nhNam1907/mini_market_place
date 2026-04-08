import { Router } from "express";

import { getProductsOfShopById, getShopInfoById } from "../controllers/shopController.js";

const route = Router();

route.get("/:id", getShopInfoById);
route.get("/:id/products", getProductsOfShopById);

export default route;
