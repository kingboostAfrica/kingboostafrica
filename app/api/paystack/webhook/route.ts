import { NextResponse } from "next/server";
import { confirmPayment, verifyWebhookSignature } from "@/lib/paystack";

// Paystack calls this after every payment. Set the URL in the Paystack dashboard:
//   Settings > API Keys & Webhooks > Live/Test Webhook URL
//   https://www.kingboostfarms.com.ng/api/paystack/webhook
export async function POST(request: Request) {
  const raw = await request.text();

  if (!verifyWebhookSignature(raw, request.headers.get("x-paystack-signature"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw) as { event?: string; data?: { reference?: string } };
    if (event.event === "charge.success" && event.data?.reference) {
      await confirmPayment(event.data.reference);
    }
  } catch (err) {
    // Return an error so Paystack retries later.
    console.error("Paystack webhook error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
