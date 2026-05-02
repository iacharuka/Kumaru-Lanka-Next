"use client";

import { useEffect, useState } from "react";
import { AdminBookingsApi, Booking } from "@/lib/api";
import {
  buildAdminBookingMessage,
  buildCustomerBookingMessage,
} from "@/lib/bookingMessages";

export function BookingsManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState<number | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookings() {
      try {
        const data = await AdminBookingsApi.list(statusFilter || undefined);
        if (cancelled) return;
        setBookings(data);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load bookings");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      cancelled = true;
    };
  }, [statusFilter]);

  async function updateStatus(id: number, newStatus: string) {
    setUpdatingId(id);
    try {
      await AdminBookingsApi.updateStatus(id, newStatus);
      const data = await AdminBookingsApi.list(statusFilter || undefined);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update booking");
    } finally {
      setUpdatingId(null);
    }
  }

  async function updatePayment(id: number, isPaid: boolean) {
    setUpdatingPaymentId(id);
    try {
      await AdminBookingsApi.updatePayment(id, isPaid);
      const data = await AdminBookingsApi.list(statusFilter || undefined);
      setBookings(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update payment");
    } finally {
      setUpdatingPaymentId(null);
    }
  }

  async function copyTemplate(key: string, message: string) {
    await navigator.clipboard.writeText(message);
    setCopiedTemplate(key);
    window.setTimeout(() => setCopiedTemplate(null), 1800);
  }

  if (loading) return <div className="text-center py-8">Loading bookings...</div>;

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-900",
    confirmed: "bg-blue-100 text-blue-900",
    met_customer: "bg-purple-100 text-purple-900",
    completed: "bg-green-100 text-green-900",
    cancelled: "bg-red-100 text-red-900",
  };

  const statusOptions = [
    "pending",
    "confirmed",
    "met_customer",
    "completed",
    "cancelled",
  ];
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    met_customer: "Met customer",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const pendingCount = bookings.filter((booking) => booking.status === "pending").length;
  const activeCount = bookings.filter(
    (booking) => booking.status !== "completed" && booking.status !== "cancelled"
  ).length;
  const unpaidCount = bookings.filter((booking) => !booking.isPaid).length;

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h3 className="text-xl font-extrabold">Bookings</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Review customer requests and update trip status.
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="met_customer">Met customer</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Pending review
          </div>
          <div className="mt-1 text-2xl font-extrabold">{pendingCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Active trips
          </div>
          <div className="mt-1 text-2xl font-extrabold">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Awaiting payment
          </div>
          <div className="mt-1 text-2xl font-extrabold">{unpaidCount}</div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-900 rounded text-sm">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted)]">No bookings found</div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => {
            const isOpen = openId === booking.id;
            const statusClass =
              statusColors[booking.status] || "bg-gray-100 text-gray-900";

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-mono text-xs font-bold text-[var(--brand)]">
                        {booking.bookingRef}
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass}`}
                      >
                        {statusLabels[booking.status] || booking.status}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          booking.isPaid
                            ? "bg-green-100 text-green-900"
                            : "bg-orange-100 text-orange-900"
                        }`}
                      >
                        {booking.isPaid ? "Paid" : "Pay after meeting"}
                      </span>
                    </div>
                    <div className="mt-1 text-base font-extrabold">
                      {booking.fullName}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {booking.type} ·{" "}
                      {new Date(booking.travelDate).toLocaleDateString()} ·{" "}
                      {booking.numberOfPax} pax
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold">
                      ${booking.totalAmount}
                    </span>
                    <button
                      className="h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold hover:border-[var(--brand)]"
                      onClick={() => setOpenId(isOpen ? null : booking.id)}
                    >
                      {isOpen ? "Hide details" : "View details"}
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 grid gap-4 border-t border-[var(--border)] pt-4">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Email
                        </div>
                        <div className="mt-1 break-all text-sm font-semibold">
                          {booking.email}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Phone
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {booking.phone || "Not provided"}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Country
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {booking.country || "Not provided"}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Created
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {new Date(booking.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Travel date
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {new Date(booking.travelDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Passengers
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {booking.numberOfPax}
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Payment method
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          Pay after meeting
                        </div>
                      </div>
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                        <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                          Payment status
                        </div>
                        <div className="mt-1 text-sm font-semibold">
                          {booking.isPaid ? "Paid" : "Not paid yet"}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        Customer notes
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                        {booking.message || "No extra notes were provided."}
                      </p>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-2">
                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            Customer message
                          </div>
                          <button
                            className="h-8 rounded-full border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)]"
                            onClick={() =>
                              copyTemplate(
                                `customer-${booking.id}`,
                                buildCustomerBookingMessage(booking)
                              )
                            }
                          >
                            {copiedTemplate === `customer-${booking.id}`
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </div>
                        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--muted)]">
                          {buildCustomerBookingMessage(booking)}
                        </pre>
                      </div>

                      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                            Admin follow-up
                          </div>
                          <button
                            className="h-8 rounded-full border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)]"
                            onClick={() =>
                              copyTemplate(
                                `admin-${booking.id}`,
                                buildAdminBookingMessage(booking)
                              )
                            }
                          >
                            {copiedTemplate === `admin-${booking.id}`
                              ? "Copied"
                              : "Copy"}
                          </button>
                        </div>
                        <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-[var(--surface-2)] p-3 text-xs leading-5 text-[var(--muted)]">
                          {buildAdminBookingMessage(booking)}
                        </pre>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-extrabold">Trip progress</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          Move the booking through the pay-after-meeting flow.
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            className={`h-9 rounded-full border px-3 text-xs font-semibold disabled:opacity-50 ${
                              booking.status === status
                                ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                                : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]"
                            }`}
                            disabled={
                              updatingId === booking.id || booking.status === status
                            }
                            onClick={() => updateStatus(booking.id, status)}
                          >
                            {statusLabels[status] || status}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-extrabold">Meeting payment</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          Customer pays after meeting the driver or guide.
                        </div>
                      </div>
                      <button
                        className={`h-10 rounded-full border px-4 text-xs font-semibold disabled:opacity-50 ${
                          booking.isPaid
                            ? "border-[var(--border)] bg-[var(--surface-2)] hover:border-[var(--brand)]"
                            : "border-[var(--brand)] bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
                        }`}
                        disabled={updatingPaymentId === booking.id}
                        onClick={() => updatePayment(booking.id, !booking.isPaid)}
                      >
                        {booking.isPaid ? "Mark as not paid" : "Mark as paid"}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
