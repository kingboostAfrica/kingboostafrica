"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// mode "cancel": the order is not paid yet, so it is cancelled straight away.
// mode "request": the order is paid, so this only sends a request that the shop approves.
export default function CancelOrderButton({ token, mode = "cancel" }: { token: string; mode?: "cancel" | "request" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const asking = mode === "request";

  async function send() {
    const ok = window.confirm(
      asking
        ? "Ask to cancel this order and get a refund? We will review your request and email you."
        : "Cancel this order? This cannot be undone."
    );
    if (!ok) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (["cancelled", "already_cancelled", "requested", "already_requested"].includes(json.state)) {
        router.refresh();
        return;
      }
      setMessage(
        json.state === "not_allowed"
          ? "We have already started on this order, so it can no longer be cancelled here. Please contact us."
          : "We could not do that. Please contact us."
      );
    } catch {
      setMessage("Something went wrong. Please try again or contact us.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={send}
        disabled={loading}
        className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Sending..." : asking ? "Request cancellation and refund" : "Cancel this order"}
      </button>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
    </div>
  );
}
