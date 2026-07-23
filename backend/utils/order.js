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

export function calculateEstimatedPrepMinutes(lines, random = Math.random) {
  if (!lines.length) return 10;

  const longestItem = Math.max(
    ...lines.map((line) => Math.max(1, Number(line.prepMinutes) || 10)),
  );
  const totalItems = lines.reduce(
    (sum, line) => sum + Math.max(1, Number(line.quantity) || 1),
    0,
  );
  const quantityBuffer = Math.ceil(Math.max(0, totalItems - 1) / 2);
  const kitchenBuffer = Math.floor(Math.min(Math.max(random(), 0), 0.9999) * 4);

  return Math.min(60, longestItem + quantityBuffer + kitchenBuffer);
}

export function createOrderNumber(now = Date.now()) {
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `CX-${now}-${suffix}`;
}
