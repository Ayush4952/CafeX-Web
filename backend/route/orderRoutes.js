import { Router } from "express";
import {
  changeOrderStatus,
  clearOrderHistory,
  getOrders,
  placeOrder,
} from "../controller/orderController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();
router.use(requireAuth);
router.get("/", asyncHandler(getOrders));
router.post("/", asyncHandler(placeOrder));
router.delete("/", asyncHandler(clearOrderHistory));
router.patch("/:id/status", requireRole("staff", "admin"), asyncHandler(changeOrderStatus));
export default router;
