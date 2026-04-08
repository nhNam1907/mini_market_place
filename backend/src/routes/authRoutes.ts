import { Router } from "express";
import {
  adminCheck,
  login,
  me,
  register,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import { USER_ROLE } from "../types/role.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.get(
  "/admin-check",
  requireAuth,
  requireRole(USER_ROLE.ADMIN),
  adminCheck,
);

export default router;
