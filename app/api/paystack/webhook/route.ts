import { NextResponse } from "next/server";
import { confirmPayment, verifyWebhookSignature } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase/admin";

// Paystack calls this after every payment. Set the URL in the Paystack dashboard:
//   Settings > API Keys & Webhooks > Live/Test Webhook URL
//   https://kingboostfarms.com.ng/api/paystack/webhook
export async function POST(request: Request) {
  const raw = await request.text();

  if (!verifyWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw) as {
      event?: string;
      data?: { reference?: string; transaction_reference?: string; transaction?: { reference?: string } };
    };
    if (event.event === "charge.success" && event.data?.reference) {
      await confirmPayment(event.data.reference);
    }

    // Keep the refund status shown in the admin in step with Paystack (best effort).
    if (event.event === "refund.processed" || event.event === "refund.failed") {
      const ref = event.data?.transaction_reference ?? event.data?.transaction?.reference;
      const admin = createAdminClient();
      if (ref && admin) {
        await admin
          .from("orders")
          .update({ refund_status: event.event === "refund.processed" ? "processed" : "failed" })
          .eq("payment_reference", ref);
      }
    }
  } catch (err) {
    // Return an error so Paystack retries later.
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
