import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateEstimatedPrepMinutes,
  calculateOrderTotals,
  createOrderNumber,
} from "../utils/order.js";

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

test("uses the slowest menu item time for the order estimate", () => {
  const estimate = calculateEstimatedPrepMinutes([
    { prepMinutes: 8, quantity: 1 },
    { prepMinutes: 12, quantity: 2 },
  ]);

  assert.equal(estimate, 12);
});

test("uses a safe default preparation estimate for an empty order", () => {
  assert.equal(calculateEstimatedPrepMinutes([]), 10);
});

test("uses the exact menu time for a fast-service item", () => {
  const estimate = calculateEstimatedPrepMinutes([
    { prepMinutes: 1, quantity: 1 },
  ]);

  assert.equal(estimate, 1);
});
