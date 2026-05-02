"use client";

import { useState } from "react";
import { ApiError, AuthApi } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Access your trips, bookings, and itinerary.
        </p>

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
            try {
              const res = await AuthApi.login(email, password);
              setToken(res.token);
              setUser({
                fullName: res.fullName,
                email: res.email,
                role: res.role,
                expiry: res.expiry,
              });
              const normalizedRole = (res.role || "").trim().toLowerCase();
              const isAdmin =
                normalizedRole === "admin" ||
                email.trim().toLowerCase() === "admin@kumarulanka.lk";
              const target = isAdmin ? "/admin" : "/profile";
              window.location.assign(target);
              return;
            } catch (err: unknown) {
              const msg =
                err instanceof ApiError || err instanceof Error
                  ? err.message
                  : "Login failed";
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
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Password</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="flex items-center justify-between text-sm text-[var(--muted)]">
            <a className="hover:text-[var(--brand)]" href="/auth/register">
              Create account
            </a>
            <a className="hover:text-[var(--brand)]" href="/auth/forgot-password">
              Forgot password?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
