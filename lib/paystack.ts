// Paystack (https://paystack.com) server helpers. Uses plain fetch — no extra packages.
//
// Netlify environment variables:
//   PAYSTACK_SECRET_KEY         sk_test_... while testing, sk_live_... when you go live
//   SUPABASE_SERVICE_ROLE_KEY   lets the server mark orders as paid (server only!)
//
// How a payment flows:
//   1. /api/checkout creates the order (stock reserved) and asks Paystack for a payment link.
//   2. The customer pays on Paystack's own page.
//   3. Paystack calls /api/paystack/webhook AND sends the customer to /checkout/success.
//      Both call confirmPayment(), which ASKS PAYSTACK whether the payment really succeeded and
//      whether the amount matches the order, then marks the order paid exactly once.

import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPaidOrderEmails, alertOwnerPaymentProblem } from "@/lib/order-emails";

const API = () => process.env.PAYSTACK_API_URL || "https://api.paystack.co";

export function paystackEnabled(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

const headers = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

export const toKobo = (naira: number) => Math.round(Number(naira) * 100);

export function makeReference(orderId: string): string {
  // Letters, digits and hyphens only (what Paystack allows), unique per attempt.
  const short = orderId.replace(/-/g, "").slice(0, 12).toUpperCase();
  return `KBF-${short}-${Date.now().toString(36).toUpperCase()}`;
}

export async function initializeTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  orderId: string;
}): Promise<string> {
  const res = await fetch(`${API()}/transaction/initialize`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: { order_id: input.orderId },
    }),
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json?.data?.authorization_url) {
    throw new Error(`Paystack initialize failed: ${res.status} ${json?.message ?? ""}`);
  }
  return json.data.authorization_url as string;
}

type VerifyData = { status: string; reference: string; amount: number; currency: string };

async function verifyTransaction(reference: string): Promise<VerifyData | null> {
  const res = await fetch(`${API()}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: headers(),
    signal: AbortSignal.timeout(10000),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.status || !json?.data) return null;
  return json.data as VerifyData;
}

/** Paystack signs the raw request body with your secret key (HMAC-SHA512). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !process.env.PAYSTACK_SECRET_KEY) return false;
  const expected = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export type PaymentState =
  | { state: "paid"; orderId: string; total: number }
  | { state: "pending" | "failed" | "cancelled" | "mismatch" | "unknown"; orderId?: string; total?: number };

/** Verify a payment with Paystack and mark the order paid. Safe to call many times. */
export async function confirmPayment(reference: string): Promise<PaymentState> {
  const admin = createAdminClient();
  if (!admin || !process.env.PAYSTACK_SECRET_KEY) return { state: "unknown" };

  const { data: order } = await admin
    .from("orders")
    .select("id, status, total_amount, payment_method")
    .eq("payment_reference", reference)
    .maybeSingle();
  if (!order) return { state: "unknown" };

  const total = Number(order.total_amount);
  if (["paid", "shipped", "completed"].includes(order.status)) {
    return { state: "paid", orderId: order.id, total };
  }

  const tx = await verifyTransaction(reference);
  if (!tx) return { state: "pending", orderId: order.id, total };
  if (tx.status !== "success") {
    const failed = ["failed", "abandoned", "reversed"].includes(tx.status);
    return { state: failed ? "failed" : "pending", orderId: order.id, total };
  }

  // Money was taken. Make sure it is the right money.
  if (tx.currency !== "NGN" || Number(tx.amount) !== toKobo(total) || tx.reference !== reference) {
    await alertOwnerPaymentProblem(
      order.id,
      `Paystack reports ${tx.currency} ${Number(tx.amount) / 100} but the order total is ₦${total}. The order was NOT marked paid — check it in your Paystack dashboard.`
    );
    return { state: "mismatch", orderId: order.id, total };
  }

  if (order.status === "cancelled") {
    await alertOwnerPaymentProblem(
      order.id,
      "A payment arrived for an order that had already been cancelled (unpaid orders are released after 3 hours). Refund the customer in your Paystack dashboard, or recreate the order for them."
    );
    return { state: "cancelled", orderId: order.id, total };
  }

  // Mark paid exactly once: only the request that flips pending -> paid sends the emails.
  const { data: updated } = await admin
    .from("orders")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pending")
    .select("id");

  if (updated && updated.length > 0) {
    try {
      await sendPaidOrderEmails(admin, order.id);
    } catch (err) {
      console.error("Paid-order email error:", err);
    }
  }
  return { state: "paid", orderId: order.id, total };
}
