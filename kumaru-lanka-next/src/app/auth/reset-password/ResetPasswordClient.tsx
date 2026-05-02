"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ApiError, AuthApi } from "@/lib/api";

export default function ResetPasswordClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = useMemo(() => sp.get("token") || "", [sp]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  return (
    <div className="container py-10 md:py-14">
      <div className="mx-auto max-w-md surface p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Create new password</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set a strong password for your account.
        </p>

        {!token ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Missing reset token. Please request a new reset link.
          </div>
        ) : null}

        {ok ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {ok}
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
            if (!token) return;
            if (password !== confirm) {
              setError("Passwords do not match");
              return;
            }
            setLoading(true);
            setError(null);
            try {
              const res = await AuthApi.resetPassword(token, password);
              setOk(res.message || "Password updated. Redirecting…");
              setTimeout(() => router.push("/auth/login"), 1200);
            } catch (err: unknown) {
              const msg =
                err instanceof ApiError || err instanceof Error
                  ? err.message
                  : "Reset failed";
              setError(msg);
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="grid gap-2">
            <label className="text-sm font-semibold">New password</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!token}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-semibold">Confirm password</label>
            <input
              className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              disabled={!token}
            />
          </div>

          <button
            disabled={loading || !token}
            className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
          >
            {loading ? "Updating…" : "Update password"}
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

