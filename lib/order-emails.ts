// Emails for online-paid orders. Reads the order from the database (server key),
// because by the time Paystack confirms payment there is no cart any more.
import type { SupabaseClient } from "@supabase/supabase-js";
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

/** Pull the subtotal / VAT / delivery breakdown out of an order row (older orders have none). */
export function extrasFromOrder(order: Record<string, unknown>): OrderExtras | undefined {
  if (order.subtotal_amount == null) return undefined;
  return {
    subtotal: Number(order.subtotal_amount),
    vat: Number(order.vat_amount ?? 0),
    vatPercent: Number(order.vat_percent ?? 0),
    delivery: Number(order.delivery_fee ?? 0),
    discount: Number(order.discount_amount ?? 0),
    discountCode: (order.discount_code as string | null) ?? null,
  };
}

export async function sendPaidOrderEmails(admin: SupabaseClient, orderId: string) {
  if (!process.env.RESEND_API_KEY) return;

  const { data: order } = await admin.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return;
  const { data: items } = await admin.from("order_items").select("*").eq("order_id", orderId);
  const productIds = Array.from(new Set((items ?? []).map((i: { product_id: string }) => i.product_id)));
  const { data: products } = productIds.length
    ? await admin.from("products").select("id, name, unit").in("id", productIds)
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
  const total = Number(order.total_amount);
  const ref = String(order.id).slice(0, 8).toUpperCase();
  const table = orderTable(lines, total, extrasFromOrder(order));

  await sendEmail({
    to: notifyAddress(),
    replyTo: order.buyer_email,
    subject: `PAID order #${ref} — ${naira(total)} (${order.buyer_name})`,
    html: emailLayout(
      "You have a new PAID order",
      `${detailRows([
        ["Order", `#${ref}`],
        ["Payment", `Paid online via Paystack (${order.payment_reference})`],
        ["Customer", order.buyer_name],
        ["Phone", order.buyer_phone],
        ["Email", order.buyer_email],
        ["Fulfilment", order.fulfilment_method === "pickup" ? "Self pickup" : `Delivery${order.delivery_zone ? ` — ${order.delivery_zone}` : ""}`],
        [order.fulfilment_method === "pickup" ? "Pick up at" : "Deliver to", order.delivery_address],
      ])}<div style="height:12px"></div>${table}<p style="font-size:13px;color:#6b756f;">No payment to collect. Reply to this email to reach the customer.</p>`,
      { label: "Open orders in admin", href: adminUrl("/admin/orders") }
    ),
  });

  if (canEmailCustomers()) {
    const cancelRequestBlock =
      order.cancel_token && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? `<p style="font-size:13px;color:#6b756f;">Need to cancel? <a href="${escapeHtml(adminUrl(`/order/cancel/${order.cancel_token}`))}" style="color:#2e7d32;font-weight:bold;">Request a cancellation and refund</a> (possible until we ship your order).</p>`
        : "";
    await sendEmail({
      to: order.buyer_email,
      replyTo: notifyAddress(),
      subject: `Payment received — order #${ref}`,
      html: emailLayout(
        `Thank you, ${String(order.buyer_name).split(" ")[0]}!`,
        `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">We have received your payment for order <strong>#${escapeHtml(ref)}</strong>. ${order.fulfilment_method === "pickup" ? "We will let you know as soon as it is ready to collect." : "We will contact you shortly to arrange delivery."}</p>${table}<p style="font-size:13px;color:#6b756f;">${order.fulfilment_method === "pickup" ? "Pick up from" : "Delivering to"}: ${escapeHtml(String(order.delivery_address).replace(/^Self pickup — /, ""))}</p>${cancelRequestBlock}<p style="font-size:13px;color:#6b756f;">Questions? Just reply to this email.</p>`
      ),
    });
  }
}

/** Tell the owner about a payment that needs a human decision. */
export async function alertOwnerPaymentProblem(orderId: string, message: string) {
  const ref = orderId.slice(0, 8).toUpperCase();
  await sendEmail({
    to: notifyAddress(),
    subject: `Action needed: payment problem on order #${ref}`,
    html: emailLayout("A payment needs your attention", `<p style="font-size:14px;line-height:1.6;">${escapeHtml(message)}</p>${detailRows([["Order", `#${ref}`]])}`, {
      label: "Open orders in admin",
      href: adminUrl("/admin/orders"),
    }),
  });
}

/** Tell the customer their order was cancelled. Returns true if an email was sent. */
export async function sendOrderCancelledEmail(
  db: SupabaseClient,
  orderId: string,
  previousStatus: string,
  opts?: { refundStarted?: boolean }
): Promise<boolean> {
  // Customers can only be emailed once a verified sender (EMAIL_FROM) is configured.
  if (!canEmailCustomers()) return false;

  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const { data: items } = await db.from("order_items").select("*").eq("order_id", orderId);
  const productIds = Array.from(new Set((items ?? []).map((i: { product_id: string }) => i.product_id)));
  const { data: products } = productIds.length
    ? await db.from("products").select("id, name, unit").in("id", productIds)
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
  const total = Number(order.total_amount);
  const ref = String(order.id).slice(0, 8).toUpperCase();

  // Online orders that were already paid need a refund conversation; everything else costs nothing.
  const paidOnline = order.payment_method === "online" && previousStatus !== "pending";
  const moneyNote = opts?.refundStarted
    ? `We have started your refund of <strong>${naira(total)}</strong> to the card or bank account you paid with. It can take several business days to show in your account.`
    : paidOnline
      ? `You paid <strong>${naira(total)}</strong> online for this order. Please reply to this email and we will arrange your refund.`
      : "You have not been charged for this order.";

  return sendEmail({
    to: order.buyer_email,
    replyTo: notifyAddress(),
    subject: opts?.refundStarted ? `Your order #${ref} was cancelled — refund started` : `Your order #${ref} has been cancelled`,
    html: emailLayout(
      "Your order has been cancelled",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(String(order.buyer_name).split(" ")[0])}, your order <strong>#${escapeHtml(ref)}</strong> has been cancelled.</p>${orderTable(lines, total, extrasFromOrder(order))}<p style="font-size:14px;line-height:1.6;margin:12px 0 0;">${moneyNote}</p><p style="font-size:13px;color:#6b756f;">If you were not expecting this, or would like to order again, just reply to this email.</p>`,
      { label: "Visit the Food Mart", href: adminUrl("/food-mart") }
    ),
  });
}

/** Tell the owner that a CUSTOMER cancelled their own order (stock has already been put back). */
export async function alertOwnerCustomerCancelled(db: SupabaseClient, orderId: string) {
  if (!process.env.RESEND_API_KEY) return false;
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const ref = String(order.id).slice(0, 8).toUpperCase();
  return sendEmail({
    to: notifyAddress(),
    replyTo: order.buyer_email,
    subject: `Customer cancelled order #${ref} — ${naira(Number(order.total_amount))} (${order.buyer_name})`,
    html: emailLayout(
      "A customer cancelled their order",
      `${detailRows([
        ["Order", `#${ref}`],
        ["Customer", order.buyer_name],
        ["Phone", order.buyer_phone],
        ["Email", order.buyer_email],
        ["Total", naira(Number(order.total_amount))],
      ])}<p style="font-size:13px;color:#6b756f;">The items have been put back into stock automatically.</p>`,
      { label: "Open orders in admin", href: adminUrl("/admin/orders") }
    ),
  });
}

// ─── Cancellation requests for paid (online) orders ───

/** Owner: a customer who already paid has asked to cancel. */
export async function alertOwnerCancelRequest(db: SupabaseClient, orderId: string) {
  if (!process.env.RESEND_API_KEY) return false;
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const ref = String(order.id).slice(0, 8).toUpperCase();
  return sendEmail({
    to: notifyAddress(),
    replyTo: order.buyer_email,
    subject: `Cancellation requested — PAID order #${ref} (${naira(Number(order.total_amount))})`,
    html: emailLayout(
      "A customer wants to cancel a paid order",
      `${detailRows([
        ["Order", `#${ref}`],
        ["Customer", order.buyer_name],
        ["Phone", order.buyer_phone],
        ["Email", order.buyer_email],
        ["Paid", naira(Number(order.total_amount))],
        ["Payment reference", order.payment_reference],
      ])}<p style="font-size:14px;line-height:1.6;">Open the order in the admin and choose <strong>Approve and refund</strong> (Paystack returns the money and the stock goes back) or <strong>Decline</strong> if you have already prepared it.</p>`,
      { label: "Review in admin", href: adminUrl("/admin/orders") }
    ),
  });
}

/** Customer: we got the request. */
export async function sendCancelRequestReceivedEmail(db: SupabaseClient, orderId: string) {
  if (!canEmailCustomers()) return false;
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const ref = String(order.id).slice(0, 8).toUpperCase();
  return sendEmail({
    to: order.buyer_email,
    replyTo: notifyAddress(),
    subject: `We received your cancellation request — order #${ref}`,
    html: emailLayout(
      "We received your request",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(String(order.buyer_name).split(" ")[0])}, we have received your request to cancel order <strong>#${escapeHtml(ref)}</strong>. We will review it and email you shortly. If it is approved, your payment of <strong>${naira(Number(order.total_amount))}</strong> is refunded.</p><p style="font-size:13px;color:#6b756f;">Questions? Just reply to this email.</p>`
    ),
  });
}

/** Customer: the owner could not cancel it. */
export async function sendCancelRequestDeclinedEmail(db: SupabaseClient, orderId: string) {
  if (!canEmailCustomers()) return false;
  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const ref = String(order.id).slice(0, 8).toUpperCase();
  return sendEmail({
    to: order.buyer_email,
    replyTo: notifyAddress(),
    subject: `Update on your cancellation request — order #${ref}`,
    html: emailLayout(
      "We could not cancel your order",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(String(order.buyer_name).split(" ")[0])}, we are sorry, we could not cancel order <strong>#${escapeHtml(ref)}</strong> because it is already being prepared. Please reply to this email if you have any questions.</p>`
    ),
  });
}

/** Customer: the order has been marked Shipped (delivery: on its way / pickup: ready to collect). */
export async function sendOrderShippedEmail(db: SupabaseClient, orderId: string): Promise<boolean> {
  if (!canEmailCustomers()) return false;

  const { data: order } = await db.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return false;
  const { data: items } = await db.from("order_items").select("*").eq("order_id", orderId);
  const ids = Array.from(new Set((items ?? []).map((i: { product_id: string }) => i.product_id)));
  const { data: products } = ids.length
    ? await db.from("products").select("id, name, unit").in("id", ids)
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

  const total = Number(order.total_amount);
  const ref = String(order.id).slice(0, 8).toUpperCase();
  const first = escapeHtml(String(order.buyer_name).split(" ")[0]);
  const pickingUp = order.fulfilment_method === "pickup";
  const paidOnline = order.payment_method === "online" && Boolean(order.paid_at);
  const payLine = paidOnline
    ? "You have already paid, so there is nothing more to pay."
    : pickingUp
      ? `Please bring <strong>${naira(total)}</strong> to pay when you collect.`
      : `Please have <strong>${naira(total)}</strong> ready to pay on delivery.`;

  let where = "";
  if (pickingUp) {
    const { data: settings } = await db
      .from("store_settings")
      .select("pickup_address, pickup_instructions")
      .eq("id", 1)
      .maybeSingle();
    const address = settings?.pickup_address || String(order.delivery_address).replace(/^Self pickup — /, "");
    where = `<p style="font-size:14px;line-height:1.6;margin:12px 0 0;"><strong>Collect from:</strong> ${escapeHtml(address)}${
      settings?.pickup_instructions ? `<br>${escapeHtml(settings.pickup_instructions)}` : ""
    }</p>`;
  } else {
    where = `<p style="font-size:14px;line-height:1.6;margin:12px 0 0;"><strong>Delivering to:</strong> ${escapeHtml(order.delivery_address)}${
      order.delivery_zone ? ` (${escapeHtml(order.delivery_zone)})` : ""
    }</p>`;
  }

  return sendEmail({
    to: order.buyer_email,
    replyTo: notifyAddress(),
    subject: pickingUp ? `Your order #${ref} is ready for pickup` : `Your order #${ref} is on its way`,
    html: emailLayout(
      pickingUp ? "Your order is ready for pickup" : "Your order is on its way",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${first}, ${
        pickingUp
          ? `your order <strong>#${escapeHtml(ref)}</strong> is ready to collect.`
          : `good news, your order <strong>#${escapeHtml(ref)}</strong> is on its way to you.`
      }</p>${orderTable(lines, total, extrasFromOrder(order))}${where}<p style="font-size:14px;line-height:1.6;margin:12px 0 0;">${payLine}</p><p style="font-size:13px;color:#6b756f;">Questions? Just reply to this email.</p>`
    ),
  });
}

// ─── Confirmation emails for the "small" forms ───

export async function sendQuoteRequestReceivedEmail(input: {
  contactName: string;
  email: string;
  items: { name: string; unit: string; quantity: number }[];
}) {
  if (!canEmailCustomers()) return false;
  const list = input.items
    .map((i) => `<li>${escapeHtml(String(i.quantity))}${i.unit ? ` ${escapeHtml(i.unit)}` : ""} × ${escapeHtml(i.name)}</li>`)
    .join("");
  return sendEmail({
    to: input.email,
    replyTo: notifyAddress(),
    subject: "We received your bulk quote request",
    html: emailLayout(
      "We received your request",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(input.contactName.split(" ")[0])}, thank you for your interest. We have received your request for:</p><ul style="font-size:14px;line-height:1.7;padding-left:20px;margin:0 0 12px;">${list}</ul><p style="font-size:14px;line-height:1.6;margin:0;">Our team will get back to you with pricing shortly. Questions in the meantime? Just reply to this email.</p>`
    ),
  });
}

export async function sendEnrollmentReceivedEmail(input: { name: string; email: string; courseTitle: string }) {
  if (!canEmailCustomers()) return false;
  return sendEmail({
    to: input.email,
    replyTo: notifyAddress(),
    subject: `We received your enrollment — ${input.courseTitle}`,
    html: emailLayout(
      "We received your enrollment",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(input.name.split(" ")[0])}, thank you for signing up for <strong>${escapeHtml(input.courseTitle)}</strong>. Our team will contact you shortly with the next steps.</p><p style="font-size:14px;line-height:1.6;margin:0;">Questions in the meantime? Just reply to this email.</p>`
    ),
  });
}

export async function sendBookingReceivedEmail(input: { name: string; email: string; serviceTitle: string }) {
  if (!canEmailCustomers()) return false;
  return sendEmail({
    to: input.email,
    replyTo: notifyAddress(),
    subject: `We received your request — ${input.serviceTitle}`,
    html: emailLayout(
      "We received your request",
      `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">Hello ${escapeHtml(input.name.split(" ")[0])}, thank you for your interest in <strong>${escapeHtml(input.serviceTitle)}</strong>. Our team will contact you shortly to arrange the details.</p><p style="font-size:14px;line-height:1.6;margin:0;">Questions in the meantime? Just reply to this email.</p>`
    ),
  });
}

// ─── Low stock alert (owner only) ───

export async function alertOwnerLowStock(product: { name: string; unit: string; stock: number }, threshold: number) {
  if (!process.env.RESEND_API_KEY) return false;
  return sendEmail({
    to: notifyAddress(),
    subject: `Low stock: ${product.name} (${product.stock} ${product.unit} left)`,
    html: emailLayout(
      "A product is running low",
      `${detailRows([
        ["Product", product.name],
        ["Remaining stock", `${product.stock} ${product.unit}`],
        ["Alert threshold", String(threshold)],
      ])}<p style="font-size:13px;color:#6b756f;">You will not get another alert for this product until its stock rises above the threshold and drops again.</p>`,
      { label: "Open products in admin", href: adminUrl("/admin/products") }
    ),
  });
}
