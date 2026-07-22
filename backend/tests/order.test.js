import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderTotals, createOrderNumber } from "../utils/order.js";

test("calculates subtotal, tax, and total", () => {
  const totals = calculateOrderTotals([
    { unitPrice: 210, quantity: 2 },
    { unitPrice: 160, quantity: 1 },
  ]);
  assert.deepEqual(totals, { subtotal: 580, tax: 75.4, total: 655.4 });
});

test("creates CafeX order numbers", () => {
  assert.match(createOrderNumber(12345), /^CX-12345-[A-Z0-9]{4}$/);
});
