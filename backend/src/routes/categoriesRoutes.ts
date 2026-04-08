import { Router } from "express";
import { getCategoriesHandler } from "../controllers/categoriesController.js";

const route = Router();

route.get("/", getCategoriesHandler);

export default route;
