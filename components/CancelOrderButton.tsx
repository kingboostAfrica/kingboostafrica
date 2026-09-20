"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ token }: { token: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function cancel() {
    if (!window.confirm("Cancel this order? This cannot be undone.")) return;
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (json.state === "cancelled" || json.state === "already_cancelled") {
        router.refresh();
        return;
      }
      setMessage(
        json.state === "not_allowed"
          ? "We have already started on this order, so it can no longer be cancelled here. Please contact us."
          : "We could not cancel this order. Please contact us."
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
        onClick={cancel}
        disabled={loading}
        className="btn bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
      >
        {loading ? "Cancelling..." : "Cancel this order"}
      </button>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
    </div>
  );
}
