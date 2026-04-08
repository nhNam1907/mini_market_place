import { Router } from "express";

import {
  getProductById,
  listProducts,
} from "../controllers/publicProductController.js";

const router = Router();

router.get("/products", listProducts);
router.get("/products/:id", getProductById);

export default router;
