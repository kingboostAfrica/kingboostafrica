// Order tracking + printable receipts. Uses the server (service) key: customers have no accounts.
// Both the tracking page and the receipt read the order through the same private link
// (the order's `cancel_token`, already emailed to the customer) — one link, several things to do with it.
import { createAdminClient } from "@/lib/supabase/admin";
import { extrasFromOrder } from "@/lib/order-emails";
import { isToken } from "@/lib/order-cancel";
import type { OrderExtras, OrderLine } from "@/lib/email";

export type TimelineStep = {
  key: "placed" | "paid" | "shipped" | "completed" | "cancelled";
  label: string;
  at: string | null;
  done: boolean;
  current: boolean;
};

export type OrderView = {
  found: boolean;
  ref?: string;
  status?: string;
  paymentMethod?: "delivery" | "online";
  fulfilmentMethod?: "delivery" | "pickup";
  deliveryZone?: string | null;
  address?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string | null;
  placedAt?: string;
  lines?: OrderLine[];
  extras?: OrderExtras;
  total?: number;
  paid?: boolean;
  paymentReference?: string | null;
  timeline?: TimelineStep[];
  cancelToken?: string;
};

async function loadOrder(admin: NonNullable<ReturnType<typeof createAdminClient>>, orderId: string): Promise<OrderView> {
  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return { found: false };

  const { data: items } = await admin.from("order_items").select("*").eq("order_id", orderId);
  const ids = Array.from(new Set((items ?? []).map((i: { product_id: string }) => i.product_id)));
  const { data: products } = ids.length
    ? await admin.from("products").select("id, name, unit").in("id", ids)
    : { data: [] as { id: string; name: string; unit: string }[] };
  const byId = new Map((products ?? []).map((p: { id: string; name: string; unit: string }) => [p.id, p]));
  const lines: OrderLine[] = (items ?? []).map(
    (i: { product_id: string; quantity: number; unit_price: number }) => ({
      name: byId.get(i.product_id)?.name ?? "Item",
      unit: byId.get(i.product_id)?.unit ?? "",
      quantity: i.quantity,
      price: Number(i.unit_price),
    })
  );

  const cancelled = order.status === "cancelled";
  const paid = order.payment_method === "online" ? Boolean(order.paid_at) : order.status === "completed";
  const pickup = order.fulfilment_method === "pickup";

  const timeline: TimelineStep[] = cancelled
    ? [
        { key: "placed", label: "Order placed", at: order.created_at, done: true, current: false },
        { key: "cancelled", label: "Cancelled", at: order.cancelled_at, done: true, current: true },
      ]
    : [
        { key: "placed", label: "Order placed", at: order.created_at, done: true, current: order.status === "pending" && order.payment_method !== "online" },
        ...(order.payment_method === "online"
          ? [{ key: "paid" as const, label: "Payment received", at: order.paid_at, done: Boolean(order.paid_at), current: order.status === "pending" }]
          : []),
        {
          key: "shipped",
          label: pickup ? "Ready for pickup" : "On its way",
          at: order.shipped_at,
          done: Boolean(order.shipped_at),
          current: order.status === "shipped",
        },
        {
          key: "completed",
          label: pickup ? "Collected" : "Delivered",
          at: order.completed_at,
          done: Boolean(order.completed_at),
          current: order.status === "completed",
        },
      ];

  return {
    found: true,
    ref: String(order.id).slice(0, 8).toUpperCase(),
    status: order.status,
    paymentMethod: order.payment_method === "online" ? "online" : "delivery",
    fulfilmentMethod: pickup ? "pickup" : "delivery",
    deliveryZone: order.delivery_zone ?? null,
    address: order.delivery_address,
    buyerName: order.buyer_name,
    buyerEmail: order.buyer_email,
    buyerPhone: order.buyer_phone,
    placedAt: order.created_at,
    lines,
    extras: extrasFromOrder(order),
    total: Number(order.total_amount),
    paid,
    paymentReference: order.payment_reference,
    timeline,
    cancelToken: order.cancel_token,
  };
}

export async function lookupOrderByTrackingToken(token: string): Promise<OrderView> {
  const admin = createAdminClient();
  if (!admin || !isToken(token)) return { found: false };
  const { data: order } = await admin.from("orders").select("id").eq("cancel_token", token).maybeSingle();
  if (!order) return { found: false };
  return loadOrder(admin, order.id);
}

/** "Track my order": find the order from its reference + the email it was placed with. */
export async function findOrderToken(ref: string, email: string): Promise<string | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const cleanRef = ref.replace(/[^0-9a-zA-Z]/g, "");
  const cleanEmail = email.trim();
  if (cleanRef.length < 8 || !cleanEmail) return null;

  const { data: orderId } = await admin.rpc("find_order_for_tracking", { p_ref: cleanRef, p_email: cleanEmail });
  if (!orderId) return null;
  const { data: order } = await admin.from("orders").select("cancel_token").eq("id", orderId).maybeSingle();
  return order?.cancel_token ?? null;
}

export type BusinessDetails = {
  name: string;
  address: string;
  email: string;
  phone: string | null;
  rc: string | null;
  tin: string | null;
};

export async function getBusinessDetails(): Promise<BusinessDetails> {
  const admin = createAdminClient();
  const defaults: BusinessDetails = {
    name: "KingBoost Farms Ltd.",
    address: "8 Ibudo Oloja Street, Igbanko, Badagry, Lagos State, Nigeria",
    email: "kingboost.africa@gmail.com",
    phone: null,
    rc: null,
    tin: null,
  };
  if (!admin) return defaults;
  const { data } = await admin
    .from("store_settings")
    .select("business_rc, business_tin, business_phone")
    .eq("id", 1)
    .maybeSingle();
  return {
    ...defaults,
    phone: data?.business_phone || null,
    rc: data?.business_rc || null,
    tin: data?.business_tin || null,
  };
}
