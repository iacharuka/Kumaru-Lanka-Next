"use client";

import { useState } from "react";
import { ApiError, AuthApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Reset password</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Enter your email and we’ll send a reset link.
        </p>

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setMessage(null);
            try {
              const res = await AuthApi.forgotPassword(email);
              setMessage(res.message || "If that email exists, a reset link was sent.");
            } catch (err: unknown) {
              const msg =
                err instanceof ApiError || err instanceof Error
                  ? err.message
                  : "Request failed";
              setError(msg);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Email</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send reset link"}
          </button>

          <div className="text-sm text-[var(--muted)]">
            Back to{" "}
            <a className="font-semibold hover:text-[var(--brand)]" href="/auth/login">
              sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

