// Customer self-cancellation through the private link in their confirmation email.
// Uses the server (service) key: customers have no accounts, the link's token is the proof.
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateCatalog } from "@/lib/revalidate-server";
import {
  alertOwnerCancelRequest,
  alertOwnerCustomerCancelled,
  extrasFromOrder,
  sendCancelRequestReceivedEmail,
  sendOrderCancelledEmail,
} from "@/lib/order-emails";
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
      // paid online and not shipped yet: the customer may ASK to cancel (the owner approves and refunds)
      canRequest: boolean;
      requested: boolean;
      refundStatus: string | null;
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
    canRequest: order.status === "paid" && order.payment_method === "online" && !order.cancel_requested_at,
    requested: Boolean(order.cancel_requested_at),
    refundStatus: order.refund_status ?? null,
  };
}

export type CancelResult =
  | "cancelled"
  | "already_cancelled"
  | "requested"
  | "already_requested"
  | "not_allowed"
  | "not_found";

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

  const { data: order } = await admin
    .from("orders")
    .select("status, payment_method, cancel_requested_at")
    .eq("cancel_token", token)
    .maybeSingle();
  if (!order) return "not_found";
  if (order.status === "cancelled") return "already_cancelled";

  // Already paid online and not shipped: record a REQUEST. The owner approves (and refunds) or declines.
  if (order.status === "paid" && order.payment_method === "online") {
    if (order.cancel_requested_at) return "already_requested";
    const { data: flagged } = await admin
      .from("orders")
      .update({ cancel_requested_at: new Date().toISOString() })
      .eq("cancel_token", token)
      .eq("status", "paid")
      .is("cancel_requested_at", null)
      .select("id");
    if (flagged && flagged.length > 0) {
      try {
        await alertOwnerCancelRequest(admin, flagged[0].id as string);
        await sendCancelRequestReceivedEmail(admin, flagged[0].id as string);
      } catch (err) {
        console.error("Cancel-request email error:", err);
      }
      return "requested";
    }
    return "already_requested";
  }
  return "not_allowed";
}
