import { Router } from "express";
import {
  addMenuItem,
  editMenuItem,
  favorite,
  getFavorites,
  getMenu,
  getMenuItem,
  removeMenuItem,
  unfavorite,
} from "../controller/menuController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { uploadImage } from "../middleware/uploads.js";

const router = Router();
router.get("/", asyncHandler(getMenu));
router.get("/favorites", requireAuth, asyncHandler(getFavorites));
router.post("/:id/favorite", requireAuth, asyncHandler(favorite));
router.delete("/:id/favorite", requireAuth, asyncHandler(unfavorite));
router.get("/:id", asyncHandler(getMenuItem));
router.post("/", requireAuth, requireRole("admin"), uploadImage.single("image"), asyncHandler(addMenuItem));
router.patch("/:id", requireAuth, requireRole("admin"), uploadImage.single("image"), asyncHandler(editMenuItem));
router.delete("/:id", requireAuth, requireRole("admin"), asyncHandler(removeMenuItem));
export default router;
