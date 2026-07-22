import { pool } from "../database/db.js";
import {
  calculateEstimatedPrepMinutes,
  calculateOrderTotals,
  createOrderNumber,
} from "../utils/order.js";

export async function createOrder({ userId, items, fulfillment, tableNumber, notes }) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const ids = [...new Set(items.map((item) => Number(item.menuItemId)))];
    const placeholders = ids.map(() => "?").join(",");
    const [menuRows] = await connection.execute(
      `SELECT id, name, price, image_url AS imageUrl,
        prep_minutes AS prepMinutes,
        is_available AS isAvailable
       FROM menu_items WHERE id IN (${placeholders}) FOR UPDATE`,
      ids,
    );

    const menuById = new Map(menuRows.map((item) => [Number(item.id), item]));
    const lines = items.map((item) => {
      const menuItem = menuById.get(Number(item.menuItemId));
      if (!menuItem || !menuItem.isAvailable) {
        const error = new Error("One or more menu items are unavailable");
        error.status = 409;
        throw error;
      }
      return {
        menuItemId: menuItem.id,
        itemName: menuItem.name,
        unitPrice: Number(menuItem.price),
        quantity: Number(item.quantity),
        prepMinutes: Number(menuItem.prepMinutes),
        imageUrl: menuItem.imageUrl,
      };
    });

    const totals = calculateOrderTotals(lines);
    const estimatedPrepMinutes = calculateEstimatedPrepMinutes(lines);
    const orderNumber = createOrderNumber();
    const [orderResult] = await connection.execute(
      `INSERT INTO orders
        (order_number, user_id, status, fulfillment, table_number, subtotal, tax, total, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        userId,
        "preparing",
        fulfillment,
        tableNumber ? String(tableNumber) : null,
        totals.subtotal,
        totals.tax,
        totals.total,
        notes || null,
      ],
    );

    const valueSql = lines.map(() => "(?, ?, ?, ?, ?, ?)").join(",");
    const itemValues = lines.flatMap((line) => [
      orderResult.insertId,
      line.menuItemId,
      line.itemName,
      line.unitPrice,
      line.quantity,
      Number((line.unitPrice * line.quantity).toFixed(2)),
    ]);
    await connection.execute(
      `INSERT INTO order_items
        (order_id, menu_item_id, item_name, unit_price, quantity, line_total)
       VALUES ${valueSql}`,
      itemValues,
    );

    await connection.commit();
    return {
      id: orderResult.insertId,
      orderNumber,
      status: "preparing",
      fulfillment,
      tableNumber: tableNumber ? String(tableNumber) : null,
      estimatedPrepMinutes,
      items: lines.map((line) => ({
        menuItemId: line.menuItemId,
        name: line.itemName,
        imageUrl: line.imageUrl,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
      ...totals,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function listOrders({ userId, role }) {
  const values = [];
  const canSeeAllOrders = role === "staff" || role === "admin";
  const where = canSeeAllOrders ? "" : " WHERE o.user_id = ?";
  if (!canSeeAllOrders) values.push(userId);
  const [orders] = await pool.execute(
    `SELECT o.id, o.order_number AS orderNumber, o.status, o.fulfillment,
      o.table_number AS tableNumber, o.subtotal, o.tax, o.total, o.notes,
      o.created_at AS createdAt, u.full_name AS customerName
     FROM orders o JOIN users u ON u.id = o.user_id${where}
     ORDER BY o.created_at DESC`,
    values,
  );
  if (!orders.length) return orders;

  const orderIds = orders.map((order) => Number(order.id));
  const placeholders = orderIds.map(() => "?").join(",");
  const [items] = await pool.execute(
    `SELECT oi.order_id AS orderId, oi.menu_item_id AS menuItemId,
      oi.item_name AS name, oi.quantity, oi.unit_price AS unitPrice,
      m.image_url AS imageUrl
     FROM order_items oi
     LEFT JOIN menu_items m ON m.id = oi.menu_item_id
     WHERE oi.order_id IN (${placeholders})
     ORDER BY oi.id`,
    orderIds,
  );
  const itemsByOrder = new Map();
  items.forEach((item) => {
    const orderId = Number(item.orderId);
    const orderItems = itemsByOrder.get(orderId) ?? [];
    orderItems.push({
      menuItemId: item.menuItemId,
      name: item.name,
      imageUrl: item.imageUrl,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    });
    itemsByOrder.set(orderId, orderItems);
  });

  return orders.map((order) => ({
    ...order,
    items: itemsByOrder.get(Number(order.id)) ?? [],
  }));
}

export async function updateOrderStatus(id, status) {
  const [result] = await pool.execute(
    "UPDATE orders SET status = ? WHERE id = ?",
    [status, id],
  );
  return result.affectedRows > 0;
}

export async function clearOrdersForUser(userId) {
  const [result] = await pool.execute(
    "DELETE FROM orders WHERE user_id = ?",
    [userId],
  );
  return result.affectedRows;
}
