// Customer self-cancellation through the private link in their confirmation email.
// Uses the server (service) key: customers have no accounts, the link's token is the proof.
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateCatalog } from "@/lib/revalidate-server";
import { alertOwnerCustomerCancelled, extrasFromOrder, sendOrderCancelledEmail } from "@/lib/order-emails";
import type { OrderExtras, OrderLine } from "@/lib/email";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const cancelEnabled = () => Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
export const isToken = (t: unknown): t is string => typeof t === "string" && UUID.test(t);

export type CancelView =
  | { found: false }
  | {
      found: true;
      ref: string;
      status: string;
      paymentMethod: string;
      total: number;
      lines: OrderLine[];
      extras?: OrderExtras;
      // pending = we have not started on it yet, so the customer may cancel
      canCancel: boolean;
    };

export async function lookupOrderByToken(token: string): Promise<CancelView> {
  const admin = createAdminClient();
  if (!admin || !isToken(token)) return { found: false };

  const { data: order } = await admin.from("orders").select("*").eq("cancel_token", token).maybeSingle();
  if (!order) return { found: false };

  const { data: items } = await admin.from("order_items").select("*").eq("order_id", order.id);
  const ids = Array.from(new Set((items ?? []).map((i: { product_id: string }) => i.product_id)));
  const { data: products } = ids.length
    ? await admin.from("products").select("id, name, unit").in("id", ids)
    : { data: [] as { id: string; name: string; unit: string }[] };
  const byId = new Map((products ?? []).map((p: { id: string; name: string; unit: string }) => [p.id, p]));

  return {
    found: true,
    ref: String(order.id).slice(0, 8).toUpperCase(),
    status: order.status,
    paymentMethod: order.payment_method ?? "delivery",
    total: Number(order.total_amount),
    lines: (items ?? []).map((i: { product_id: string; quantity: number; unit_price: number }) => ({
      name: byId.get(i.product_id)?.name ?? "Item",
      unit: byId.get(i.product_id)?.unit ?? "",
      quantity: i.quantity,
      price: Number(i.unit_price),
    })),
    extras: extrasFromOrder(order),
    canCancel: order.status === "pending",
  };
}

export type CancelResult = "cancelled" | "already_cancelled" | "not_allowed" | "not_found";

export async function cancelOrderByToken(token: string): Promise<CancelResult> {
  const admin = createAdminClient();
  if (!admin || !isToken(token)) return "not_found";

  // Only an order that is still "pending" can be cancelled this way. The database puts the stock back.
  const { data: updated } = await admin
    .from("orders")
    .update({ status: "cancelled", cancelled_by: "customer" })
    .eq("cancel_token", token)
    .eq("status", "pending")
    .select("id");

  if (updated && updated.length > 0) {
    const orderId = updated[0].id as string;
    revalidateCatalog();
    try {
      await sendOrderCancelledEmail(admin, orderId, "pending");
      await alertOwnerCustomerCancelled(admin, orderId);
    } catch (err) {
      console.error("Customer-cancel email error:", err);
    }
    return "cancelled";
  }

  const { data: order } = await admin.from("orders").select("status").eq("cancel_token", token).maybeSingle();
  if (!order) return "not_found";
  return order.status === "cancelled" ? "already_cancelled" : "not_allowed";
}
