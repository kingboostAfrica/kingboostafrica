import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createRefund, paystackEnabled } from "@/lib/paystack";
import { revalidateCatalog } from "@/lib/revalidate-server";
import { sendCancelRequestDeclinedEmail, sendOrderCancelledEmail } from "@/lib/order-emails";

// Admin-only. Actions on a customer's cancellation request for a PAID online order:
//   approve  -> cancel the order (stock returns) and ask Paystack to refund the payment
//   retry    -> ask Paystack again after a failed refund
//   decline  -> keep the order, tell the customer it could not be cancelled
export async function POST(request: Request) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const action = body?.action;
  if (!orderId || !["approve", "retry", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data: order } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  // ---- decline ----
  if (action === "decline") {
    if (order.status !== "paid" || !order.cancel_requested_at) {
      return NextResponse.json({ error: "There is no open cancellation request on this order." }, { status: 409 });
    }
    const { error } = await supabase.from("orders").update({ cancel_requested_at: null }).eq("id", orderId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    let emailed = false;
    try {
      emailed = await sendCancelRequestDeclinedEmail(supabase, orderId);
    } catch (err) {
      console.error("Decline email error:", err);
    }
    return NextResponse.json({ ok: true, emailed });
  }

  // ---- approve / retry: both need Paystack ----
  if (!paystackEnabled()) {
    return NextResponse.json({ error: "Paystack is not configured on the server." }, { status: 400 });
  }
  if (!order.payment_reference || order.payment_method !== "online") {
    return NextResponse.json({ error: "This order was not paid online, so there is nothing to refund." }, { status: 409 });
  }

  if (action === "approve") {
    if (order.status !== "paid") {
      return NextResponse.json({ error: "This order can no longer be cancelled (it is not in the Paid state)." }, { status: 409 });
    }
    // Lock: only one click can flip Paid -> Cancelled, so a double click can never refund twice.
    const { data: locked, error: lockError } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancelled_by: "customer", refund_status: "failed", refund_note: "Refund not confirmed yet" })
      .eq("id", orderId)
      .eq("status", "paid")
      .select("id");
    if (lockError) return NextResponse.json({ error: lockError.message }, { status: 400 });
    if (!locked || locked.length === 0) {
      return NextResponse.json({ error: "This order was already handled." }, { status: 409 });
    }
    revalidateCatalog(); // stock returns to the shelf
  } else if (order.status !== "cancelled" || order.refund_status !== "failed") {
    return NextResponse.json({ error: "There is no failed refund to retry on this order." }, { status: 409 });
  }

  const refund = await createRefund(order.payment_reference, "Order cancelled at your request");
  const { error: saveError } = await supabase
    .from("orders")
    .update({
      refund_status: refund.ok ? "queued" : "failed",
      refund_note: refund.message.slice(0, 300),
    })
    .eq("id", orderId);
  if (saveError) console.error("Could not save refund status:", saveError.message);

  if (!refund.ok) {
    return NextResponse.json(
      {
        error: `The order is cancelled, but Paystack did not accept the refund: ${refund.message}. Use "Retry refund", or refund it in your Paystack dashboard.`,
      },
      { status: 502 }
    );
  }

  let emailed = false;
  try {
    emailed = await sendOrderCancelledEmail(supabase, orderId, "paid", { refundStarted: true });
  } catch (err) {
    console.error("Refund email error:", err);
  }
  return NextResponse.json({ ok: true, emailed });
}
