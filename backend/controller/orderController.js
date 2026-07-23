import { z } from "zod";
import {
  clearOrdersForUser,
  createOrder,
  listOrders,
  updateOrderStatus,
} from "../model/orderModel.js";

export const orderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1).max(20),
  })).min(1).max(50),
  fulfillment: z.literal("dine_in").default("dine_in"),
  tableNumber: z.coerce.number().int().min(1).max(15).optional(),
  notes: z.string().trim().max(500).optional(),
}).superRefine((order, context) => {
  if (order.fulfillment === "dine_in" && !order.tableNumber) {
    context.addIssue({
      code: "custom",
      path: ["tableNumber"],
      message: "Choose a table number from 1 to 15",
    });
  }
});

const statusSchema = z.object({
  status: z.enum(["pending", "preparing", "ready", "completed", "cancelled"]),
});

export async function placeOrder(req, res) {
  const input = orderSchema.parse(req.body);
  const order = await createOrder({ userId: req.user.id, ...input });
  res.status(201).json({ order });
}

export async function getOrders(req, res) {
  const orders = await listOrders({ userId: req.user.id, role: req.user.role });
  res.json({ orders });
}

export async function clearOrderHistory(req, res) {
  const deletedCount = await clearOrdersForUser(req.user.id);
  res.json({
    message: deletedCount ? "Order history cleared" : "Order history is already empty",
    deletedCount,
  });
}

export async function changeOrderStatus(req, res) {
  const { status } = statusSchema.parse(req.body);
  if (!(await updateOrderStatus(req.params.id, status))) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json({ message: "Order status updated", status });
}
