import assert from "node:assert/strict";
import test from "node:test";
import { orderSchema } from "../controller/orderController.js";

const items = [{ menuItemId: 1, quantity: 1 }];

test("accepts dine-in tables from 1 through 15", () => {
  assert.equal(orderSchema.parse({ items, fulfillment: "dine_in", tableNumber: 1 }).tableNumber, 1);
  assert.equal(orderSchema.parse({ items, fulfillment: "dine_in", tableNumber: 15 }).tableNumber, 15);
});

test("requires a valid table for dine-in orders", () => {
  assert.equal(orderSchema.safeParse({ items, fulfillment: "dine_in" }).success, false);
  assert.equal(orderSchema.safeParse({ items, fulfillment: "dine_in", tableNumber: 0 }).success, false);
  assert.equal(orderSchema.safeParse({ items, fulfillment: "dine_in", tableNumber: 16 }).success, false);
});

test("rejects pickup orders", () => {
  assert.equal(orderSchema.safeParse({ items, fulfillment: "pickup" }).success, false);
});
