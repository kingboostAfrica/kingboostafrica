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
  type OrderLine,
} from "@/lib/email";

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
  const table = orderTable(lines, total);

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
        ["Deliver to", order.delivery_address],
      ])}<div style="height:12px"></div>${table}<p style="font-size:13px;color:#6b756f;">No payment to collect on delivery. Reply to this email to reach the customer.</p>`,
      { label: "Open orders in admin", href: adminUrl("/admin/orders") }
    ),
  });

  if (canEmailCustomers()) {
    await sendEmail({
      to: order.buyer_email,
      replyTo: notifyAddress(),
      subject: `Payment received — order #${ref}`,
      html: emailLayout(
        `Thank you, ${String(order.buyer_name).split(" ")[0]}!`,
        `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;">We have received your payment for order <strong>#${escapeHtml(ref)}</strong>. We will contact you shortly to arrange delivery.</p>${table}<p style="font-size:13px;color:#6b756f;">Delivering to: ${escapeHtml(order.delivery_address)}</p><p style="font-size:13px;color:#6b756f;">Questions? Just reply to this email.</p>`
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
