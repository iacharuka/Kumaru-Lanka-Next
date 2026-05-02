"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, BookingsApi, BookingResponse } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  met_customer: "Met customer",
  completed: "Completed",
  cancelled: "Cancelled",
};
const statusOrder = ["pending", "confirmed", "met_customer", "completed"];

export default function BookingStatusClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const ref = useMemo(() => sp.get("ref") || "", [sp]);
  const [refInput, setRefInput] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingResponse | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setRefInput(ref));
  }, [ref]);

  useEffect(() => {
    if (!ref) return;
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
      setBooking(null);
    });
    BookingsApi.getByRef(ref)
      .then((b) => setBooking(b))
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load booking";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [ref]);

  return (
    <div className="container py-10 md:py-14">
      <Badge tone="brand">Booking</Badge>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
        Booking status
      </h1>
      <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
        Enter a reference to view status.
      </p>

      <div className="mt-8 surface p-6">
        <form
          className="grid gap-2 sm:grid-cols-[1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            const nextRef = refInput.trim();
            if (!nextRef) return;
            router.push(`/booking-status?ref=${encodeURIComponent(nextRef)}`);
          }}
        >
          <input
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
            placeholder="Enter booking reference (e.g. CE-2026-1234)"
            value={refInput}
            onChange={(e) => setRefInput(e.target.value)}
          />
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand)] px-5 font-semibold text-white hover:bg-[var(--brand-dark)]">
            Check status
          </button>
        </form>

        <div className="text-sm font-extrabold">Reference</div>
        <div className="mt-1 text-sm text-[var(--muted)]">
          {ref ? ref : "No reference provided"}
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-[var(--muted)]">Loading…</div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {booking ? (
          <div className="mt-5 grid gap-5 text-sm text-[var(--muted)]">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider">
                  Reference
                </div>
                <div className="mt-1 font-mono text-sm font-extrabold text-[var(--brand)]">
                  {booking.bookingRef}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider">
                  Trip status
                </div>
                <div className="mt-1 font-extrabold text-[var(--fg)] dark:text-white">
                  {statusLabels[booking.status] || booking.status}
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider">
                  Payment
                </div>
                <div className="mt-1 font-extrabold text-[var(--fg)] dark:text-white">
                  {booking.isPaid ? "Paid" : "Pay after meeting"}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-bold uppercase tracking-wider">
                Booking flow
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                {["pending", "confirmed", "met_customer", "paid", "completed"].map(
                  (step) => {
                    const currentStatusIndex = statusOrder.indexOf(booking.status);
                    const stepStatusIndex = statusOrder.indexOf(step);
                    const isPaidStep = step === "paid";
                    const isActive = isPaidStep
                      ? booking.isPaid
                      : booking.status !== "cancelled" &&
                        stepStatusIndex >= 0 &&
                        currentStatusIndex >= stepStatusIndex;
                    return (
                      <div
                        key={step}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                          isActive
                            ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                            : "border-[var(--border)] bg-[var(--surface)]"
                        }`}
                      >
                        {step === "met_customer"
                          ? "Met customer"
                          : step.charAt(0).toUpperCase() + step.slice(1)}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            <div>
              <span className="font-semibold text-[var(--fg)] dark:text-white">
                Estimated total:
              </span>{" "}
              ${booking.totalAmount}
            </div>
            <div>{booking.message}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
