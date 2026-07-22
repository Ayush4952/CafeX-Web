import { pool } from "../database/db.js";

export async function dashboard(req, res) {
  const [[summary]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM menu_items) AS menuItems,
      (SELECT COUNT(*) FROM menu_items WHERE is_available = 1) AS availableItems,
      (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) AS ordersToday,
      (SELECT COALESCE(SUM(total), 0) FROM orders
       WHERE DATE(created_at) = CURDATE() AND status <> 'cancelled') AS revenueToday,
      (SELECT COUNT(*) FROM users WHERE role = 'customer') AS customers
  `);
  const [recentOrders] = await pool.query(`
    SELECT o.id, o.order_number AS orderNumber, o.status, o.total,
      o.created_at AS createdAt, u.full_name AS customerName
    FROM orders o JOIN users u ON u.id = o.user_id
    ORDER BY o.created_at DESC LIMIT 8
  `);
  const [categories] = await pool.query(`
    SELECT c.name, COUNT(m.id) AS itemCount,
      SUM(CASE WHEN m.is_available = 1 THEN 1 ELSE 0 END) AS availableCount
    FROM categories c LEFT JOIN menu_items m ON m.category_id = c.id
    GROUP BY c.id, c.name ORDER BY c.sort_order
  `);
  res.json({ summary, recentOrders, categories });
}
