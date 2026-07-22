import { Router } from "express";
import { dashboard } from "../controller/dashboardController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();
router.get("/", requireAuth, requireRole("admin"), asyncHandler(dashboard));
export default router;
