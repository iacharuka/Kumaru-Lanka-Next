"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, AuthApi } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Create your account</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Join thousands of travellers exploring Sri Lanka.
        </p>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {ok ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {ok}
          </div>
        ) : null}

        <form
          className="mt-6 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading(true);
            setError(null);
            setOk(null);
            try {
              const res = await AuthApi.register({
                firstName,
                lastName,
                email,
                phone: phone || undefined,
                password,
                subscribeNewsletter: true,
              });
              setOk(res.message || "Account created. Redirecting…");
              setTimeout(() => router.push("/auth/login"), 1200);
            } catch (err: unknown) {
              const msg =
                err instanceof ApiError || err instanceof Error
                  ? err.message
                  : "Registration failed";
              setError(msg);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <label className="text-sm font-semibold">First name</label>
              <input
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-semibold">Last name</label>
              <input
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>

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
            <label className="text-sm font-semibold">Phone (optional)</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold">Password</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            disabled={loading}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
          >
            {loading ? "Creating…" : "Create account"}
          </button>

          <div className="text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <a className="font-semibold hover:text-[var(--brand)]" href="/auth/login">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

