// Email notifications via Resend (https://resend.com), using plain fetch — no extra packages.
//
// Netlify environment variables:
//   RESEND_API_KEY       required. Without it, emails are silently skipped (the site still works).
//   ORDER_NOTIFY_EMAIL   where alerts go. Default: kingboost.africa@gmail.com
//   EMAIL_FROM           e.g.  KingBoostFarms <orders@kingboostfarms.com.ng>
//                        Needs a domain verified in Resend. Until it is set, only the
//                        owner alert is sent (Resend's test sender can only deliver to
//                        your own Resend sign-up address). Once set, customers also get
//                        an order confirmation.
//
// Sending never blocks or breaks an order: every failure is caught and logged.

import { SITE_URL } from "@/lib/site";

const TEST_FROM = "KingBoostFarms <onboarding@resend.dev>";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const naira = (n: number) => `₦${Number(n).toLocaleString("en-NG")}`;

export function notifyAddress(): string {
  return process.env.ORDER_NOTIFY_EMAIL || "kingboost.africa@gmail.com";
}

/** True once a real sender domain has been configured, so customers can be emailed too. */
export function canEmailCustomers(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false; // emails not set up yet — quietly skip

  try {
    const res = await fetch(process.env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || TEST_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Email send failed:", res.status, await res.text().catch(() => ""));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

/** Simple branded wrapper that works in email clients (inline styles, no images required). */
export function emailLayout(heading: string, bodyHtml: string, button?: { label: string; href: string }) {
  return `<!doctype html>
<html><body style="margin:0;background:#f1f5ef;font-family:Arial,Helvetica,sans-serif;color:#26302a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5ef;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="background:#05391d;padding:20px 28px;border-bottom:4px solid #cf9b26;">
          <span style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ffffff;">KingBoost</span><span style="font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#cf9b26;">Farms</span>
        </td></tr>
        <tr><td style="padding:28px;">
          <h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#05391d;">${escapeHtml(heading)}</h1>
          ${bodyHtml}
          ${
            button
              ? `<p style="margin:28px 0 0;"><a href="${escapeHtml(button.href)}" style="background:#2e7d32;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:8px;display:inline-block;">${escapeHtml(button.label)}</a></p>`
              : ""
          }
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f1f5ef;font-size:12px;color:#6b756f;">
          KingBoost Farms Ltd. · Cultivating Growth, Nourishing Nations
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function detailRows(rows: [string, string | null | undefined][]): string {
  const body = rows
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#6b756f;vertical-align:top;white-space:nowrap;">${escapeHtml(k)}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`
    )
    .join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:14px;">${body}</table>`;
}

export type OrderLine = { name: string; unit: string; quantity: number; price: number };

export function orderTable(lines: OrderLine[], total: number): string {
  const rows = lines
    .map(
      (l) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #e3e8e1;">${l.quantity} × ${escapeHtml(l.name)} <span style="color:#6b756f;">(${escapeHtml(l.unit)})</span></td>
          <td align="right" style="padding:8px 0;border-bottom:1px solid #e3e8e1;white-space:nowrap;">${naira(l.price * l.quantity)}</td>
        </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:8px 0;">
    ${rows}
    <tr><td style="padding:12px 0 0;font-weight:bold;">Total</td><td align="right" style="padding:12px 0 0;font-weight:bold;color:#2e7d32;font-size:16px;">${naira(total)}</td></tr>
  </table>`;
}

export const adminUrl = (path: string) => `${SITE_URL}${path}`;

/** Owner alert for the small forms (inquiry, enrollment, booking). */
export async function notifyOwner(subject: string, heading: string, rows: [string, string | null | undefined][], replyTo: string, adminPath: string, buttonLabel: string) {
  return sendEmail({
    to: notifyAddress(),
    subject,
    replyTo,
    html: emailLayout(heading, detailRows(rows), { label: buttonLabel, href: adminUrl(adminPath) }),
  });
}
