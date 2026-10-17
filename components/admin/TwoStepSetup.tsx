"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Field, inputCls } from "@/components/admin/ui";

type Enrol = { factorId: string; qr: string; secret: string };

// Turn two-step login (authenticator app code) on or off for the person who is logged in.
export default function TwoStepSetup() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [enrol, setEnrol] = useState<Enrol | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.auth.mfa.listFactors();
    setEnabled((data?.totp?.length ?? 0) > 0);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function start() {
    setBusy(true);
    setMessage(null);
    // Remove any half-finished set-up from an earlier try, so a new one can start cleanly.
    const { data: all } = await supabase.auth.mfa.listFactors();
    for (const f of all?.all ?? []) {
      if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "KingBoostFarms admin" });
    setBusy(false);
    if (error || !data) return setMessage({ ok: false, text: error?.message ?? "Could not start set-up. Try again." });
    setEnrol({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enrol) return;
    setBusy(true);
    setMessage(null);
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: enrol.factorId, code: code.trim() });
    setBusy(false);
    if (error) return setMessage({ ok: false, text: "That code did not work. Check your app and try again." });
    setEnrol(null);
    setCode("");
    setEnabled(true);
    setMessage({ ok: true, text: "Two-step login is on. You will be asked for a code each time you log in." });
  }

  async function turnOff() {
    if (!window.confirm("Turn off two-step login for your account?")) return;
    setBusy(true);
    setMessage(null);
    const { data } = await supabase.auth.mfa.listFactors();
    let failed: string | null = null;
    for (const f of data?.totp ?? []) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (error) failed = error.message;
    }
    setBusy(false);
    if (failed) return setMessage({ ok: false, text: failed });
    setEnabled(false);
    setMessage({ ok: true, text: "Two-step login is off." });
  }

  async function cancel() {
    if (enrol) await supabase.auth.mfa.unenroll({ factorId: enrol.factorId });
    setEnrol(null);
    setCode("");
    setMessage(null);
  }

  if (loading) return <p className="text-sm text-kb-charcoal/60">Checking...</p>;

  return (
    <div className="space-y-4">
      {!enrol && (
        <p className="text-sm font-semibold">
          Status:{" "}
          <span className={enabled ? "text-kb-green" : "text-kb-charcoal/70"}>{enabled ? "On" : "Off"}</span>
        </p>
      )}

      {enrol && (
        <form onSubmit={confirm} className="space-y-4 rounded-xl border border-kb-forest/15 p-5">
          <p className="text-sm text-kb-charcoal/80">
            1. Open your authenticator app and scan this picture.
          </p>
          {/* The QR code comes from Supabase as a ready-made image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enrol.qr} alt="QR code to add KingBoostFarms to your authenticator app" className="h-44 w-44 rounded-lg bg-white p-2 ring-1 ring-kb-forest/15" />
          <p className="text-sm text-kb-charcoal/80">
            Cannot scan? Type this key into the app instead:
            <br />
            <code className="break-all font-mono text-sm font-semibold text-kb-forest">{enrol.secret}</code>
          </p>
          <Field label="2. Type the 6-digit code the app shows">
            <input
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className={inputCls}
            />
          </Field>
          <div className="flex gap-3">
            <button type="submit" disabled={busy || code.length !== 6} className="btn btn-primary disabled:opacity-60">
              {busy ? "Checking..." : "Turn on"}
            </button>
            <button type="button" onClick={cancel} className="btn btn-outline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {message && (
        <p className={`text-sm font-semibold ${message.ok ? "text-kb-green" : "text-red-600"}`}>{message.text}</p>
      )}

      {!enrol && !enabled && (
        <button type="button" onClick={start} disabled={busy} className="btn btn-primary disabled:opacity-60">
          {busy ? "Starting..." : "Set up two-step login"}
        </button>
      )}
      {!enrol && enabled && (
        <button type="button" onClick={turnOff} disabled={busy} className="btn btn-outline disabled:opacity-60">
          Turn off
        </button>
      )}
    </div>
  );
}
