import { pool } from "../database/db.js";

const menuSelect = `SELECT m.id, m.name, m.description, m.price,
  m.image_url AS imageUrl, m.badge, m.prep_minutes AS prepMinutes,
  m.is_available AS isAvailable, m.is_featured AS isFeatured,
  c.id AS categoryId, c.name AS category, c.slug AS categorySlug, c.icon
  FROM menu_items m JOIN categories c ON c.id = m.category_id`;

export async function listMenuItems({ category, search, featured } = {}) {
  const clauses = [];
  const values = [];
  if (category && category !== "all") {
    clauses.push("c.slug = ?");
    values.push(category);
  }
  if (search) {
    clauses.push("(m.name LIKE ? OR m.description LIKE ?)");
    values.push(`%${search}%`, `%${search}%`);
  }
  if (featured === "true") clauses.push("m.is_featured = 1");
  const where = clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `${menuSelect}${where} ORDER BY c.sort_order, m.name`,
    values,
  );
  return rows;
}

export async function findMenuItemById(id) {
  const [rows] = await pool.execute(`${menuSelect} WHERE m.id = ? LIMIT 1`, [id]);
  return rows[0] ?? null;
}

export async function createMenuItem(item) {
  const [result] = await pool.execute(
    `INSERT INTO menu_items
      (category_id, name, description, price, image_url, badge, prep_minutes, is_available, is_featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.categoryId,
      item.name,
      item.description,
      item.price,
      item.imageUrl || null,
      item.badge || null,
      item.prepMinutes ?? 10,
      item.isAvailable ?? true,
      item.isFeatured ?? false,
    ],
  );
  return findMenuItemById(result.insertId);
}

export async function updateMenuItem(id, item) {
  const allowed = {
    categoryId: "category_id",
    name: "name",
    description: "description",
    price: "price",
    imageUrl: "image_url",
    badge: "badge",
    prepMinutes: "prep_minutes",
    isAvailable: "is_available",
    isFeatured: "is_featured",
  };
  const entries = Object.entries(item).filter(([key, value]) => allowed[key] && value !== undefined);
  if (!entries.length) return findMenuItemById(id);
  const setters = entries.map(([key]) => `${allowed[key]} = ?`).join(", ");
  await pool.execute(
    `UPDATE menu_items SET ${setters} WHERE id = ?`,
    [...entries.map(([, value]) => value), id],
  );
  return findMenuItemById(id);
}

export async function deleteMenuItem(id) {
  const [result] = await pool.execute("DELETE FROM menu_items WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function addFavorite(userId, menuItemId) {
  await pool.execute(
    "INSERT IGNORE INTO favorites (user_id, menu_item_id) VALUES (?, ?)",
    [userId, menuItemId],
  );
}

export async function removeFavorite(userId, menuItemId) {
  await pool.execute(
    "DELETE FROM favorites WHERE user_id = ? AND menu_item_id = ?",
    [userId, menuItemId],
  );
}

export async function listFavorites(userId) {
  const [rows] = await pool.execute(
    `${menuSelect} JOIN favorites f ON f.menu_item_id = m.id WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId],
  );
  return rows;
}
