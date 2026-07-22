import { z } from "zod";
import {
  addFavorite,
  createMenuItem,
  deleteMenuItem,
  findMenuItemById,
  listFavorites,
  listMenuItems,
  removeFavorite,
  updateMenuItem,
} from "../model/menuModel.js";

const menuSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(500),
  price: z.coerce.number().positive(),
  badge: z.string().trim().max(40).optional().nullable(),
  prepMinutes: z.coerce.number().int().min(1).max(120).default(10),
  isAvailable: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
});

export async function getMenu(req, res) {
  res.json({ items: await listMenuItems(req.query) });
}

export async function getMenuItem(req, res) {
  const item = await findMenuItemById(req.params.id);
  if (!item) return res.status(404).json({ message: "Menu item not found" });
  return res.json({ item });
}

export async function addMenuItem(req, res) {
  const input = menuSchema.parse(req.body);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
  const item = await createMenuItem({ ...input, imageUrl });
  res.status(201).json({ item });
}

export async function editMenuItem(req, res) {
  const input = menuSchema.partial().parse(req.body);
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl;
  const item = await updateMenuItem(req.params.id, { ...input, imageUrl });
  if (!item) return res.status(404).json({ message: "Menu item not found" });
  return res.json({ item });
}

export async function removeMenuItem(req, res) {
  if (!(await deleteMenuItem(req.params.id))) {
    return res.status(404).json({ message: "Menu item not found" });
  }
  return res.status(204).end();
}

export async function getFavorites(req, res) {
  res.json({ items: await listFavorites(req.user.id) });
}

export async function favorite(req, res) {
  await addFavorite(req.user.id, req.params.id);
  res.status(201).json({ message: "Added to favorites" });
}

export async function unfavorite(req, res) {
  await removeFavorite(req.user.id, req.params.id);
  res.status(204).end();
}
