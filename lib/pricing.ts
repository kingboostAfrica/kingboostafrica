// Money helpers shared by the browser and the server.
// The DATABASE is the one that finally decides every amount (see place_order in the SQL);
// these are used to show the customer the same numbers beforehand.

export function formatNaira(n: number): string {
  const v = Number(n);
  return (
    "₦" +
    v.toLocaleString("en-NG", {
      minimumFractionDigits: Number.isInteger(v) ? 0 : 2,
      maximumFractionDigits: 2,
    })
  );
}

export function computeTotals(subtotal: number, vatPercent: number, deliveryFee: number, discount = 0) {
  const cappedDiscount = Math.min(Math.max(discount, 0), subtotal);
  const taxable = subtotal - cappedDiscount;
  const vat = Math.round(taxable * vatPercent) / 100; // same rounding as the database: 2 decimals
  const total = Math.round((taxable + vat + deliveryFee) * 100) / 100;
  return { subtotal, discount: cappedDiscount, vat, delivery: deliveryFee, total };
}
