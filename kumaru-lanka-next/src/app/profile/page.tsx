"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Booking, BookingsApi } from "@/lib/api";
import { getToken, getUser, logout, useAuthUser } from "@/lib/auth";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthUser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState<string | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!getToken() || !getUser()) {
        router.replace("/auth/login");
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    if (!user || !getToken()) return;

    let cancelled = false;
    async function loadBookings() {
      try {
        setBookingsLoading(true);
        const data = await BookingsApi.mine();
        if (!cancelled) {
          setBookings(data);
          setBookingsError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setBookingsError(
            error instanceof Error ? error.message : "Could not load bookings."
          );
        }
      } finally {
        if (!cancelled) setBookingsLoading(false);
      }
    }

    loadBookings();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="container py-10 md:py-14">
        <div className="surface p-6 text-sm text-[var(--muted)]">
          Redirecting to sign in...
        </div>
      </div>
    );
  }

  const isAdmin = user.role.toLowerCase() === "admin";
  const statusStyles: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-900",
    confirmed: "bg-blue-100 text-blue-900",
    met_customer: "bg-purple-100 text-purple-900",
    completed: "bg-green-100 text-green-900",
    cancelled: "bg-red-100 text-red-900",
  };
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    confirmed: "Confirmed",
    met_customer: "Met customer",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  const activeBookings = bookings.filter(
    (booking) => booking.status !== "completed" && booking.status !== "cancelled"
  ).length;
  const paidBookings = bookings.filter((booking) => booking.isPaid).length;

  return (
    <div className="container py-10 md:py-14">
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside className="surface p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-xl font-extrabold text-white">
              {initials(user.fullName) || "U"}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-extrabold">
                {user.fullName}
              </h1>
              <p className="truncate text-sm text-[var(--muted)]">
                {user.email}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 text-sm">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Account type
              </div>
              <div className="mt-1 font-extrabold">{user.role}</div>
            </div>
            {user.expiry ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Session valid until
                </div>
                <div className="mt-1 font-extrabold">
                  {new Date(user.expiry).toLocaleString()}
                </div>
              </div>
            ) : null}
          </div>

          <button
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold hover:border-[var(--brand)]"
            onClick={() => {
              logout();
              router.replace("/auth/login");
            }}
          >
            Sign out
          </button>
        </aside>

        <section className="grid gap-6">
          <div className="surface p-6 md:p-8">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Traveler profile
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--green-800)] dark:text-white">
              Welcome back, {user.fullName.split(" ")[0] || "traveler"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Your account is ready. From here you can continue booking tours,
              check booking references, and manage your travel plans.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Link
                href="/book"
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
              >
                <div className="text-lg font-extrabold">New booking</div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  Request a tour, vehicle, or transfer.
                </div>
              </Link>
              <Link
                href="/booking-status"
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
              >
                <div className="text-lg font-extrabold">Booking status</div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  Track a booking by reference.
                </div>
              </Link>
              <Link
                href="/itinerary"
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
              >
                <div className="text-lg font-extrabold">Itinerary</div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  Plan the route for your Sri Lanka trip.
                </div>
              </Link>
            </div>
          </div>

          <div className="surface p-6 md:p-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                  My bookings
                </div>
                <h2 className="mt-2 text-2xl font-extrabold text-[var(--green-800)] dark:text-white">
                  Booking details and status
                </h2>
              </div>
              <Link
                href="/book"
                className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
              >
                Create booking
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Total bookings
                </div>
                <div className="mt-1 text-2xl font-extrabold">{bookings.length}</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Active trips
                </div>
                <div className="mt-1 text-2xl font-extrabold">{activeBookings}</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Paid after meeting
                </div>
                <div className="mt-1 text-2xl font-extrabold">{paidBookings}</div>
              </div>
            </div>

            {bookingsLoading ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)]">
                Loading your bookings...
              </div>
            ) : null}

            {bookingsError ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {bookingsError}
              </div>
            ) : null}

            {!bookingsLoading && !bookingsError && bookings.length === 0 ? (
              <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-5">
                <div className="text-sm font-extrabold">No bookings yet</div>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Bookings made with {user.email} will appear here with live
                  status updates.
                </p>
              </div>
            ) : null}

            {bookings.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="font-mono text-xs font-bold text-[var(--brand)]">
                            {booking.bookingRef}
                          </div>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              statusStyles[booking.status] ||
                              "bg-gray-100 text-gray-900"
                            }`}
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
                        <div className="mt-1 text-lg font-extrabold">
                          {booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} booking
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-[var(--muted)] md:grid-cols-3">
                          <div className="rounded-xl bg-[var(--surface)] p-3">
                            <div className="text-xs font-bold uppercase tracking-wider">
                              Travel date
                            </div>
                            <div className="mt-1 font-semibold text-[var(--fg)] dark:text-white">
                              {new Date(booking.travelDate).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="rounded-xl bg-[var(--surface)] p-3">
                            <div className="text-xs font-bold uppercase tracking-wider">
                              Guests
                            </div>
                            <div className="mt-1 font-semibold text-[var(--fg)] dark:text-white">
                              {booking.numberOfPax}
                            </div>
                          </div>
                          <div className="rounded-xl bg-[var(--surface)] p-3">
                            <div className="text-xs font-bold uppercase tracking-wider">
                              Estimated total
                            </div>
                            <div className="mt-1 font-semibold text-[var(--fg)] dark:text-white">
                              ${booking.totalAmount}
                            </div>
                          </div>
                        </div>
                        {booking.message ? (
                          <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-6 text-[var(--muted)]">
                            {booking.message}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <Link
                          href={`/booking-status?ref=${encodeURIComponent(
                            booking.bookingRef
                          )}`}
                          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold hover:border-[var(--brand)]"
                        >
                          View status
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {isAdmin ? (
            <div className="surface p-6">
              <h2 className="text-lg font-extrabold">Admin access</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                This account can manage site content and bookings.
              </p>
              <Link
                href="/admin"
                className="mt-4 inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
              >
                Open admin dashboard
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
