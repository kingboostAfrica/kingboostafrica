"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Buttons shown on an order in Admin > Orders:
//  kind "request": the customer asked to cancel a paid order  -> Approve and refund / Decline
//  kind "retry":   the order is cancelled but Paystack refused the refund -> Retry refund
export default function CancelRequestActions({ orderId, kind }: { orderId: string; kind: "request" | "retry" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function run(action: "approve" | "decline" | "retry", confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/orders/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ ok: false, text: json.error ?? "Something went wrong." });
      } else {
        setMessage({
          ok: true,
          text:
            action === "decline"
              ? "Declined. The customer was emailed."
              : "Refund requested from Paystack. The customer was emailed.",
        });
      }
      router.refresh();
    } catch {
      setMessage({ ok: false, text: "Could not reach the server." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {kind === "request" ? (
          <>
            <button
              disabled={busy}
              onClick={() =>
                run(
                  "approve",
                  "Approve this cancellation? The order is cancelled, the stock returns, and Paystack refunds the customer's full payment. This cannot be undone."
                )
              }
              className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
            >
              Approve and refund
            </button>
            <button
              disabled={busy}
              onClick={() => run("decline", "Decline this request? The order stays as it is and the customer is told it could not be cancelled.")}
              className="rounded-lg border border-kb-forest/25 px-4 py-2 text-sm font-semibold hover:bg-kb-mist disabled:opacity-60"
            >
              Decline
            </button>
          </>
        ) : (
          <button
            disabled={busy}
            onClick={() => run("retry", "Ask Paystack to refund this payment again?")}
            className="btn btn-primary !px-4 !py-2 text-sm disabled:opacity-60"
          >
            Retry refund
          </button>
        )}
      </div>
      {message && (
        <p className={`mt-2 text-xs font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
