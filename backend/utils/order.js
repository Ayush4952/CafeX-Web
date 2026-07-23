export function calculateOrderTotals(lines, taxRate = 0.13) {
  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.unitPrice) * Number(line.quantity),
    0,
  );
  const tax = subtotal * taxRate;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number((subtotal + tax).toFixed(2)),
  };
}

export function calculateEstimatedPrepMinutes(lines) {
  if (!lines.length) return 10;

  return Math.max(
    ...lines.map((line) => Math.max(1, Number(line.prepMinutes) || 10)),
  );
}

export function createOrderNumber(now = Date.now()) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CX-${now}-${suffix}`;
}
