import { z } from "zod";
import { createOrder, listOrders, updateOrderStatus } from "../model/orderModel.js";

const orderSchema = z.object({
  items: z.array(z.object({
    menuItemId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().min(1).max(20),
  })).min(1).max(50),
  fulfillment: z.enum(["dine_in", "pickup", "delivery"]).default("pickup"),
  tableNumber: z.string().trim().max(20).optional(),
  notes: z.string().trim().max(500).optional(),
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

export async function changeOrderStatus(req, res) {
  const { status } = statusSchema.parse(req.body);
  if (!(await updateOrderStatus(req.params.id, status))) {
    return res.status(404).json({ message: "Order not found" });
  }
  return res.json({ message: "Order status updated", status });
}
