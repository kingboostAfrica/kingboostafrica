"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/safe-redirect";

type Mode = "login" | "signup" | "forgot";

const inputCls = "w-full rounded-lg border border-kb-forest/25 bg-white px-4 py-2.5";

export default function AuthForm({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const linkError = params.get("error") === "link";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(linkError ? "That link has expired or was already used. Please try again." : "");
  const [done, setDone] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone("");
    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback?next=`;

    if (mode === "login") {
      setLoading(true);
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) {
        setLoading(false);
        setError(
          /confirm/i.test(err.message)
            ? "Please confirm your email first. We sent you a link when you signed up."
            : "Incorrect email or password. Please try again."
        );
        return;
      }
      // Hard navigation so the server sees the new login cookie straight away.
      window.location.href = next;
      return;
    }

    if (mode === "signup") {
      if (password.length < 8) return setError("Please choose a password of at least 8 characters.");
      setLoading(true);
      const { error: err } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: callback + encodeURIComponent(next),
        },
      });
      setLoading(false);
      if (err) {
        setError(
          /rate|limit/i.test(err.message)
            ? "Too many sign-up emails were requested. Please wait a little and try again."
            : err.message
        );
        return;
      }
      setDone(
        "Almost there! We sent a confirmation link to your email. Click it to finish creating your account, then log in. If you can't see it, check your spam folder."
      );
      return;
    }

    // forgot
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callback + encodeURIComponent("/account/update-password"),
    });
    setLoading(false);
    if (err && /rate|limit/i.test(err.message)) {
      setError("Too many requests. Please wait a little and try again.");
      return;
    }
    // Same message whether or not the email has an account, so nobody can check who is registered.
    setDone("If that email has an account, a reset link is on its way. Check your inbox and spam folder.");
  }

  const titles: Record<Mode, string> = {
    login: "Log in to your account",
    signup: "Create your account",
    forgot: "Reset your password",
  };
  const blurbs: Record<Mode, string> = {
    login: "See your orders, reorder in one tap, and keep a wishlist.",
    signup: "Use the same email you shop with, so your past and future orders show up here.",
    forgot: "Enter your email and we'll send you a link to choose a new password.",
  };
  const query = next !== "/account" ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="card mx-auto w-full max-w-md p-8">
      <h2 className="mb-2 font-display text-2xl font-bold text-kb-forest">{titles[mode]}</h2>
      <p className="mb-6 text-kb-charcoal/70">{blurbs[mode]}</p>

      {done ? (
        <p role="status" className="rounded-lg bg-kb-mist p-4 text-sm leading-relaxed text-kb-charcoal">
          {done}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label htmlFor="fullName" className="mb-1 block text-sm font-medium">Full name</label>
              <input id="fullName" required autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
            </div>
          )}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
            <input id="email" required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          {mode !== "forgot" && (
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
              <input
                id="password"
                required
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                minLength={mode === "signup" ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="btn btn-primary w-full disabled:opacity-60">
            {loading ? "Please wait..." : mode === "login" ? "Log in" : mode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>
      )}

      <div className="mt-6 space-y-2 text-center text-sm">
        {mode === "login" && (
          <>
            <p>
              New here?{" "}
              <Link href={`/account/signup${query}`} className="font-semibold text-kb-green hover:underline">Create an account</Link>
            </p>
            <p>
              <Link href="/account/forgot" className="font-semibold text-kb-green hover:underline">Forgot your password?</Link>
            </p>
          </>
        )}
        {mode !== "login" && (
          <p>
            <Link href={`/account/login${query}`} className="font-semibold text-kb-green hover:underline">← Back to log in</Link>
          </p>
        )}
      </div>
    </div>
  );
}
