import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clean, isEmail } from "@/lib/validation";
import {
  adminUrl,
  canEmailCustomers,
  detailRows,
  emailLayout,
  escapeHtml,
  naira,
  notifyAddress,
  orderTable,
  sendEmail,
  type OrderExtras,
  type OrderLine,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidateCatalog } from "@/lib/revalidate-server";
import { SITE_URL } from "@/lib/site";
import { initializeTransaction, makeReference, paystackEnabled, toKobo } from "@/lib/paystack";
import { alertOwnerLowStock } from "@/lib/order-emails";

// Places an order through the database function `place_order()`
// (see supabase/002_hardening_and_admin.sql).
//
// IMPORTANT: the browser only sends WHICH products and HOW MANY. Prices and
// stock are looked up and checked inside the database, so a customer can't
// change a price by editing the request.
//
// Payment gateway (Paystack/Flutterwave) hooks in here later: create the
// order as "pending", start the payment, then mark it "paid" from a webhook.
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const buyerName = clean(body.buyerName, 200);
    const buyerEmail = clean(body.buyerEmail, 320);
    const buyerPhone = clean(body.buyerPhone, 40);
    const deliveryAddress = clean(body.deliveryAddress, 1000);
    const method: "delivery" | "pickup" = body.fulfilmentMethod === "pickup" ? "pickup" : "delivery";
    const zoneRaw = clean(body.zoneId, 64);
    const zoneId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(zoneRaw) ? zoneRaw : null;
    const discountCode = clean(body.discountCode, 40) || null;

    if (!buyerName || !isEmail(buyerEmail) || (method === "delivery" && !deliveryAddress)) {
      return NextResponse.json(
        {
          error:
            method === "pickup"
              ? "Please fill in your name and a valid email."
              : "Please fill in your name, a valid email, and delivery address.",
        },
        { status: 400 }
      );
    }

    const wantsOnline = body.paymentMethod === "online";
    if (wantsOnline && !paystackEnabled()) {
      return NextResponse.json(
        { error: "Online payment is not available right now. Please choose pay on delivery." },
        { status: 400 }
      );
    }

    const rawItems: unknown = body.items;
    if (!Array.isArray(rawItems) || rawItems.length === 0 || rawItems.length > 50) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const rawParsed = rawItems.map((i: { product?: { id?: unknown }; quantity?: unknown }) => ({
      product_id: i?.product?.id,
      quantity: Number(i?.quantity),
    }));

    if (
      rawParsed.some(
        (i) =>
          typeof i.product_id !== "string" ||
          !Number.isInteger(i.quantity) ||
          i.quantity < 1 ||
          i.quantity > 1000
      )
    ) {
      return NextResponse.json({ error: "Your cart has an invalid item." }, { status: 400 });
    }
    const items = rawParsed as { product_id: string; quantity: number }[];

    // Housekeeping: unpaid online orders older than 3 hours release their stock.
    if (paystackEnabled()) {
      try {
        await createAdminClient()?.rpc("release_stale_online_orders", { p_hours: 3 });
      } catch (err) {
        console.error("Stale order release failed:", err);
      }
    }

    const supabase = await createClient();
    const { data, error } = await supabase.rpc("place_order", {
      p_name: buyerName,
      p_email: buyerEmail,
      p_phone: buyerPhone,
      p_address: method === "pickup" ? "" : deliveryAddress,
      p_items: items,
      p_method: method,
      p_zone_id: method === "delivery" ? zoneId : null,
      p_discount_code: discountCode,
    });

    if (error) {
      // Messages raised on purpose inside place_order() are safe to show
      // (stock / availability). Anything else is logged and hidden.
      const friendly =
        /left in stock|no longer available|Invalid quantity|cart is empty|delivery area|Self pickup is not available|Invalid delivery option|Delivery address is required|discount code|used up/i.test(error.message);
      if (friendly) {
        return NextResponse.json({ error: error.message }, { status: 409 });
      }
      throw error;
    }

    const result = data as {
      order_id: string;
      total: number;
      subtotal?: number;
      vat?: number;
      vat_percent?: number;
      delivery?: number;
      discount?: number;
      discount_code?: string | null;
      method?: string;
      zone?: string | null;
      address?: string;
      pickup_instructions?: string | null;
      cancel_token?: string;
    };
    revalidateCatalog(); // stock just went down

    // Low-stock alerts: fire-and-forget, must never hold up the customer's checkout.
    checkLowStock(items).catch((err) => console.error("Low stock check failed:", err));

    // ---- Pay online: hand the customer to Paystack. Emails are sent once payment is confirmed. ----
    if (wantsOnline) {
      const admin = createAdminClient();
      const reference = makeReference(result.order_id);
      try {
        if (!admin) throw new Error("Server key missing");
        const { error: tagError } = await admin
          .from("orders")
          .update({ payment_method: "online", payment_reference: reference })
          .eq("id", result.order_id);
        if (tagError) throw tagError;

        const site = process.env.SITE_URL || SITE_URL;
        const authorizationUrl = await initializeTransaction({
          email: buyerEmail,
          amountKobo: toKobo(Number(result.total)),
          reference,
          callbackUrl: `${site}/checkout/success?order=${encodeURIComponent(result.order_id)}`,
          orderId: result.order_id,
        });
        return NextResponse.json({
          orderId: result.order_id,
          total: result.total,
          authorizationUrl,
        });
      } catch (payErr) {
        // Could not start payment: cancel the order so the stock goes straight back.
        console.error("Paystack start error:", payErr);
        await admin?.from("orders").update({ status: "cancelled" }).eq("id", result.order_id);
        return NextResponse.json(
          { error: "We could not start the online payment. Please try again or choose pay on delivery." },
          { status: 502 }
        );
      }
    }

    // Email alerts are best-effort: a failure here must never fail the order.
    try {
      await sendOrderEmails({
        supabase,
        orderId: result.order_id,
        total: Number(result.total),
        extras:
          result.subtotal == null
            ? undefined
            : {
                subtotal: Number(result.subtotal),
                vat: Number(result.vat ?? 0),
                vatPercent: Number(result.vat_percent ?? 0),
                delivery: Number(result.delivery ?? 0),
                discount: Number(result.discount ?? 0),
                discountCode: result.discount_code ?? null,
              },
        cancelToken: result.cancel_token,
        fulfilment: {
          method: result.method === "pickup" ? "pickup" : "delivery",
          zone: result.zone ?? null,
          address: result.address ?? deliveryAddress,
          pickupInstructions: result.pickup_instructions ?? null,
        },
        buyerName,
        buyerEmail,
        buyerPhone,
        deliveryAddress,
        items: items as { product_id: string; quantity: number }[],
      });
    } catch (mailErr) {
      console.error("Order email error:", mailErr);
    }

    return NextResponse.json({
      orderId: result.order_id,
      total: result.total,
      cancelToken: process.env.SUPABASE_SERVICE_ROLE_KEY ? result.cancel_token : undefined,
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Something went wrong placing your order. Please try again." },
      { status: 500 }
    );
  }
}

async function sendOrderEmails(o: {
  supabase: Awaited<ReturnType<typeof createClient>>;
  orderId: string;
  total: number;
  extras?: OrderExtras;
  cancelToken?: string;
  fulfilment: { method: "delivery" | "pickup"; zone: string | null; address: string; pickupInstructions: string | null };
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  deliveryAddress: string;
  items: { product_id: string; quantity: number }[];
}) {
  if (!process.env.RESEND_API_KEY) return; // emails not set up yet

  // Product names/prices are public, so read them back to describe the order.
  const ids = Array.from(new Set(o.items.map((i) => i.product_id)));
  const { data: products } = await o.supabase
    .from("products")
    .select("id, name, unit, price")
    .in("id", ids);
  const byId = new Map(
    ((products as { id: string; name: string; unit: string; price: number }[] | null) ?? []).map((p) => [p.id, p])
  );
  const lines: OrderLine[] = o.items.map((i) => {
    const p = byId.get(i.product_id);
    return { name: p?.name ?? "Item", unit: p?.unit ?? "", quantity: i.quantity, price: Number(p?.price ?? 0) };
  });

  const ref = o.orderId.slice(0, 8).toUpperCase();
  const table = orderTable(lines, o.total, o.extras);

  // 1) Alert to the owner
  await sendEmail({
    to: notifyAddress(),
    replyTo: o.buyerEmail,
    subject: `New order #${ref} — ${naira(o.total)} (${o.buyerName})`,
    html: emailLayout(
      "You have a new order",
      `${detailRows([
        ["Order", `#${ref}`],
        ["Customer", o.buyerName],
        ["Phone", o.buyerPhone],
        ["Email", o.buyerEmail],
        ["Fulfilment", o.fulfilment.method === "pickup" ? "Self pickup" : `Delivery${o.fulfilment.zone ? ` — ${o.fulfilment.zone}` : ""}`],
        [o.fulfilment.method === "pickup" ? "Pick up at" : "Deliver to", o.fulfilment.address],
      ])}<div style="height:12px"></div>${table}<p style="font-size:13px;color:#6b756f;">${o.fulfilment.method === "pickup" ? "Payment is collected when the customer picks up." : "Payment is collected on delivery."} Reply to this email to reach the customer.</p>`,
      { label: "Open orders in admin", href: adminUrl("/admin/orders") }
    ),
  });

  // 2) Confirmation to the customer (only once a verified sender domain is configured)
  if (canEmailCustomers()) {
    const pickingUp = o.fulfilment.method === "pickup";
    const customerNextStep = pickingUp
      ? "will let you know as soon as it is ready to collect. You pay when you collect it."
      : "will contact you shortly to confirm delivery. You pay on delivery.";
    const fulfilmentBlock = pickingUp
      ? `<p style="font-size:13px;color:#6b756f;">Pick up from: ${escapeHtml(o.fulfilment.address.replace(/^Self pickup — /, ""))}${o.fulfilment.pickupInstructions ? `<br>${escapeHtml(o.fulfilment.pickupInstructions)}` : ""}</p>`
      : `<p style="font-size:13px;color:#6b756f;">Delivering to: ${escapeHtml(o.fulfilment.address)}${o.fulfilment.zone ? ` (${escapeHtml(o.fulfilment.zone)})` : ""}</p>`;
    const cancelBlock =
      o.cancelToken && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? `<p style="font-size:13px;color:#6b756f;">Changed your mind? <a href="${escapeHtml(adminUrl(`/order/cancel/${o.cancelToken}`))}" style="color:#2e7d32;font-weight:bold;">Cancel this order</a> (possible until we start processing it).</p>`
        : "";
    await sendEmail({
      to: o.buyerEmail,
      replyTo: notifyAddress(),
      subject: `We received your order #${ref}`,
      html: emailLayout(
        `Thank you, ${o.buyerName.split(" ")[0]}!`,
        `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">We have received your order <strong>#${ref}</strong> and ${customerNextStep}</p>${table}${fulfilmentBlock}${cancelBlock}<p style="font-size:13px;color:#6b756f;">Questions? Just reply to this email.</p>`
      ),
    });
  }
}

/** Sends one owner alert per product that has just crossed below its low-stock threshold. */
async function checkLowStock(items: { product_id: string; quantity: number }[]) {
  const admin = createAdminClient();
  if (!admin || items.length === 0) return;

  const ids = items.map((i) => i.product_id);
  const [{ data: products }, { data: settings }] = await Promise.all([
    admin.from("products").select("id, name, unit, stock, low_stock_threshold").in("id", ids),
    admin.from("store_settings").select("low_stock_threshold").eq("id", 1).maybeSingle(),
  ]);
  const siteDefault = Number.isFinite(Number(settings?.low_stock_threshold)) ? Number(settings?.low_stock_threshold) : null;

  for (const item of items) {
    const p = (products ?? []).find((x) => x.id === item.product_id);
    if (!p) continue;
    const threshold = p.low_stock_threshold ?? siteDefault;
    if (threshold == null) continue;
    const previousStock = Number(p.stock) + item.quantity;
    // Only alert on the crossing itself, so repeat purchases below the line don't spam the owner.
    if (previousStock > threshold && Number(p.stock) <= threshold) {
      await alertOwnerLowStock({ name: p.name, unit: p.unit, stock: Number(p.stock) }, threshold);
    }
  }
}
