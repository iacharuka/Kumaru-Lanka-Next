"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ApiError,
  BookingsApi,
  BookingCreate,
  ToursApi,
  VehiclesApi,
  Tour,
  Vehicle,
} from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { useAuthUser } from "@/lib/auth";

type Step = "details" | "review" | "success";

const bookingTypeLabels: Record<BookingCreate["type"], string> = {
  tour: "Guided tour",
  vehicle: "Vehicle hire",
  transfer: "Airport / city transfer",
};

const stepLabels: Step[] = ["details", "review", "success"];
const stepTitles: Record<Step, string> = {
  details: "Trip details",
  review: "Review request",
  success: "Reference ready",
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const user = useAuthUser();

  const initialType = (sp.get("type") as BookingCreate["type"]) || "tour";
  const initialTourId = sp.get("tourId");
  const initialVehicleId = sp.get("vehicleId");
  const initialHireDays = sp.get("hireDays");

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [form, setForm] = useState<BookingCreate>(() => ({
    type: initialType,
    fullName: "",
    email: "",
    phone: "",
    country: "",
    travelDate: todayISO(),
    numberOfPax: 2,
    message: "",
    tourId: initialTourId ? Number(initialTourId) : null,
    vehicleId: initialVehicleId ? Number(initialVehicleId) : null,
    hireDays: initialHireDays ? Number(initialHireDays) : null,
    pickupLocation: "",
    extras: [],
  }));

  const effectiveFullName = form.fullName || user?.fullName || "";
  const effectiveEmail = user?.email || form.email || "";
  const bookingPayload = useMemo<BookingCreate>(
    () => ({
      ...form,
      fullName: effectiveFullName,
      email: effectiveEmail,
    }),
    [effectiveEmail, effectiveFullName, form]
  );

  const summary = useMemo(() => {
    return {
      type: bookingPayload.type,
      travelDate: bookingPayload.travelDate,
      pax: bookingPayload.numberOfPax,
      name: bookingPayload.fullName,
      email: bookingPayload.email,
      phone: bookingPayload.phone,
      message: bookingPayload.message,
    };
  }, [bookingPayload]);

  useEffect(() => {
    ToursApi.list().then(setTours).catch(() => setTours([]));
    VehiclesApi.list().then(setVehicles).catch(() => setVehicles([]));
  }, []);

  function changeBookingType(type: BookingCreate["type"]) {
    setForm((current) => {
      if (type === "tour") {
        return {
          ...current,
          type,
          vehicleId: null,
          hireDays: null,
          pickupLocation: "",
          extras: [],
        };
      }

      if (type === "vehicle") {
        return {
          ...current,
          type,
          tourId: null,
          pickupLocation: "",
        };
      }

      return {
        ...current,
        type,
        tourId: null,
        vehicleId: null,
        hireDays: null,
        extras: [],
      };
    });
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <Badge tone="brand">Booking</Badge>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
            Request your booking
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
            Share your travel details and our team will confirm availability,
            pricing, and the best route. No online payment is required now.
          </p>
        </div>
        <div className="grid gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm sm:grid-cols-3 lg:min-w-[420px]">
          {stepLabels.map((item, index) => {
            const activeIndex = stepLabels.indexOf(step);
            const isActive = activeIndex >= index;
            return (
              <div
                key={item}
                className={`rounded-xl px-3 py-2 ${
                  isActive ? "bg-[var(--brand)] text-white" : "bg-[var(--surface)]"
                }`}
              >
                <div className="text-xs font-bold opacity-80">Step {index + 1}</div>
                <div className="text-sm font-extrabold">{stepTitles[item]}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 surface p-6 md:p-8">
          {error ? (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {step === "details" ? (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                setStep("review");
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Booking type</label>
                <div className="grid gap-2 md:grid-cols-3">
                  {(["tour", "vehicle", "transfer"] as BookingCreate["type"][]).map(
                    (type) => (
                      <button
                        key={type}
                        type="button"
                        className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                          form.type === type
                            ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--green-800)]"
                            : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--brand)]"
                        }`}
                        onClick={() => changeBookingType(type)}
                      >
                        <div className="font-extrabold">{bookingTypeLabels[type]}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          {type === "tour"
                            ? "Packages and day trips"
                            : type === "vehicle"
                              ? "Driver and vehicle plan"
                              : "Point-to-point pickup"}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Full name</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    required
                    value={effectiveFullName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fullName: e.target.value }))
                    }
                    autoComplete="name"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Email</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    type="email"
                    required
                    value={effectiveEmail}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    autoComplete="email"
                    readOnly={Boolean(user)}
                  />
                  {user ? (
                    <div className="text-xs text-[var(--muted)]">
                      Bookings made with this account email will appear in your
                      profile.
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Phone (optional)</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    value={form.phone || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    autoComplete="tel"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Country (optional)</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    value={form.country || ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, country: e.target.value }))
                    }
                    autoComplete="country-name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {form.type === "tour" ? (
                  <div className="grid gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Tour package</label>
                    <select
                      className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                      value={form.tourId ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          tourId: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Select a tour</option>
                      {tours.map((tour) => (
                        <option key={tour.id} value={tour.id}>
                          {tour.title}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {form.type === "vehicle" ? (
                  <>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">Vehicle</label>
                      <select
                        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                        value={form.vehicleId ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            vehicleId: e.target.value ? Number(e.target.value) : null,
                          }))
                        }
                      >
                        <option value="">Select a vehicle</option>
                        {vehicles.map((vehicle) => (
                          <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-semibold">Hire days</label>
                      <input
                        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                        type="number"
                        min={1}
                        max={30}
                        value={form.hireDays ?? 1}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            hireDays: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </>
                ) : null}

                {form.type === "transfer" ? (
                  <div className="grid gap-2 md:col-span-2">
                    <label className="text-sm font-semibold">Pickup location</label>
                    <input
                      className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                      value={form.pickupLocation || ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pickupLocation: e.target.value }))
                      }
                      placeholder="Airport, hotel, or city"
                    />
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Travel date</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    type="date"
                    required
                    value={form.travelDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, travelDate: e.target.value }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Passengers</label>
                  <input
                    className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={form.numberOfPax}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        numberOfPax: Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Notes (optional)</label>
                <textarea
                  className="min-h-28 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  value={form.message || ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, message: e.target.value }))
                  }
                  placeholder="Tell us what you want to do, where you want to go, hotel preferences, etc."
                />
              </div>

              <div className="mt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:border-[var(--brand)]"
                  onClick={() => router.push("/tours")}
                >
                  Browse tours
                </button>
                <button className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]">
                  Continue
                </button>
              </div>
            </form>
          ) : null}

          {step === "review" ? (
            <div className="grid gap-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                  Final check
                </div>
                <h2 className="mt-1 text-2xl font-extrabold">Review your request</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  We will confirm the quote before you meet and pay.
                </p>
              </div>
              <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4 text-sm text-[var(--muted)] md:grid-cols-2">
                <div className="rounded-xl bg-[var(--surface)] p-3">
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    Type:
                  </span>{" "}
                  {bookingTypeLabels[summary.type]}
                </div>
                <div className="rounded-xl bg-[var(--surface)] p-3">
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    Date:
                  </span>{" "}
                  {summary.travelDate}
                </div>
                <div className="rounded-xl bg-[var(--surface)] p-3">
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    Passengers:
                  </span>{" "}
                  {summary.pax}
                </div>
                <div className="rounded-xl bg-[var(--surface)] p-3">
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    Name:
                  </span>{" "}
                  {summary.name}
                </div>
                <div className="rounded-xl bg-[var(--surface)] p-3 md:col-span-2">
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    Email:
                  </span>{" "}
                  {summary.email}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:border-[var(--brand)]"
                  onClick={() => setStep("details")}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
                  disabled={loading}
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      const res = await BookingsApi.create(bookingPayload);
                      setBookingRef(res.bookingRef);
                      setStep("success");
                    } catch (err: unknown) {
                      const msg =
                        err instanceof ApiError || err instanceof Error
                          ? err.message
                          : "Booking failed";
                      setError(msg);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  {loading ? "Submitting…" : "Submit booking request"}
                </button>
              </div>
            </div>
          ) : null}

          {step === "success" ? (
            <div className="mx-auto max-w-xl py-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-800">
                ✓
              </div>
              <div className="mt-3 text-2xl font-extrabold">Request sent</div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Our team will contact you soon. Keep this reference for your
                profile and WhatsApp follow-up.
              </p>
              <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-5 py-4 font-mono text-xl font-extrabold text-[var(--brand)]">
                {bookingRef}
              </div>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <button
                  className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:border-[var(--brand)]"
                  onClick={() => router.push("/")}
                >
                  Back home
                </button>
                {user ? (
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-6 font-semibold hover:border-[var(--brand)]"
                    onClick={() => router.push("/profile")}
                  >
                    Go to my profile
                  </button>
                ) : null}
                {bookingRef ? (
                  <button
                    className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]"
                    onClick={() =>
                      router.push(
                        `/booking-status?ref=${encodeURIComponent(bookingRef)}`
                      )
                    }
                  >
                    View booking
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="surface p-6 h-fit sticky top-20">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
            Trust flow
          </div>
          <div className="mt-1 text-lg font-extrabold">Pay after meeting</div>
          <ol className="mt-4 grid gap-3 text-sm">
            {[
              "We confirm availability and itinerary",
              "You receive a final quote",
              "You meet our driver or guide",
              "You pay safely after meeting",
            ].map((item, index) => (
              <li
                key={item}
                className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                <span className="text-[var(--muted)]">{item}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 rounded-xl border border-[var(--brand)] bg-[var(--brand-soft)] p-4 text-sm text-[var(--green-800)]">
            Admin confirms your request first, so there is no surprise payment
            before trust is built.
          </div>
        </aside>
      </div>
    </div>
  );
}
