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

export function computeTotals(subtotal: number, vatPercent: number, deliveryFee: number) {
  const vat = Math.round(subtotal * vatPercent) / 100; // same rounding as the database: 2 decimals
  const total = Math.round((subtotal + vat + deliveryFee) * 100) / 100;
  return { subtotal, vat, delivery: deliveryFee, total };
}
