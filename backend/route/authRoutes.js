import { Router } from "express";
import { login, me, register } from "../controller/authController.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, asyncHandler(me));
export default router;
