import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { sendOrderCancelledEmail } from "@/lib/order-emails";
import { revalidateCatalog } from "@/lib/revalidate-server";

const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"];

// Admin-only: change an order's status. Cancelling also emails the customer.
export async function POST(request: Request) {
  let supabase;
  try {
    ({ supabase } = await requireAdmin());
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = typeof body?.orderId === "string" ? body.orderId : "";
  const status = typeof body?.status === "string" ? body.status : "";
  if (!orderId || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  if (order.status === status) return NextResponse.json({ ok: true, emailed: false });

  // The database also puts the stock back when an order is cancelled.
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  let emailed = false;
  if (status === "cancelled") {
    revalidateCatalog(); // stock returns to the shelf
    try {
      emailed = await sendOrderCancelledEmail(supabase, orderId, order.status);
    } catch (err) {
      console.error("Cancellation email error:", err);
    }
  }
  return NextResponse.json({ ok: true, emailed });
}
