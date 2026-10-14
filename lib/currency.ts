// Approximate foreign-currency display. The real charge is always in Naira (Paystack settles in NGN);
// foreign cards are converted by the customer's own bank. This is only a guide for overseas visitors.

/** "approx. $12.50" for a Naira amount, or null when no exchange rate has been set. */
export function usdEstimate(priceNaira: number, ngnPerUsd: number | null | undefined): string | null {
  if (!ngnPerUsd || ngnPerUsd <= 0 || !Number.isFinite(priceNaira)) return null;
  const usd = priceNaira / ngnPerUsd;
  const text = usd >= 100 ? Math.round(usd).toLocaleString("en-US") : usd.toFixed(2);
  return `approx. $${text}`;
}
