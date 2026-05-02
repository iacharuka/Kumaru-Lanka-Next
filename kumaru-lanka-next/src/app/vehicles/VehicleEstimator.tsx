"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Vehicle } from "@/lib/api";

const extras = [
  { key: "airportPickup", label: "Airport pickup", price: 18, daily: false },
  { key: "nightSurcharge", label: "Late-night driving", price: 12, daily: false },
  { key: "childSeat", label: "Child seat", price: 8, daily: false },
  { key: "wifi", label: "Travel Wi-Fi", price: 5, daily: true },
  { key: "guide", label: "Licensed guide", price: 40, daily: true },
];

export function VehicleEstimator({ vehicles }: { vehicles: Vehicle[] }) {
  const [vehicleSlug, setVehicleSlug] = useState(vehicles[0]?.slug || "");
  const [days, setDays] = useState(3);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([
    "airportPickup",
  ]);

  const vehicle =
    vehicles.find((item) => item.slug === vehicleSlug) || vehicles[0];

  const quote = useMemo(() => {
    if (!vehicle) {
      return { base: 0, extrasTotal: 0, tax: 0, total: 0 };
    }

    const base = vehicle.pricePerDay * days;
    const extrasTotal = extras.reduce((sum, extra) => {
      if (!selectedExtras.includes(extra.key)) return sum;
      return sum + (extra.daily ? extra.price * days : extra.price);
    }, 0);
    const tax = Math.round((base + extrasTotal) * 0.1);

    return {
      base,
      extrasTotal,
      tax,
      total: base + extrasTotal + tax,
    };
  }, [days, selectedExtras, vehicle]);

  if (!vehicle) return null;

  return (
    <div className="surface p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-[var(--green-800)] dark:text-white">
            Quick estimate
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Pricing adjusts by vehicle, hire days, and selected extras.
          </p>
        </div>
        <div className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-bold text-[var(--brand)]">
          USD
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Vehicle
          <select
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
            value={vehicle.slug}
            onChange={(event) => setVehicleSlug(event.target.value)}
          >
            {vehicles.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.name} - ${item.pricePerDay}/day
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Hire days
          <input
            className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
            min={1}
            max={30}
            type="number"
            value={days}
            onChange={(event) =>
              setDays(Math.max(1, Number(event.target.value) || 1))
            }
          />
        </label>

        <div className="grid gap-2">
          <div className="text-sm font-semibold">Extras</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {extras.map((extra) => (
              <label
                className="flex min-h-11 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm"
                key={extra.key}
              >
                <input
                  type="checkbox"
                  checked={selectedExtras.includes(extra.key)}
                  onChange={(event) => {
                    setSelectedExtras((current) =>
                      event.target.checked
                        ? [...current, extra.key]
                        : current.filter((key) => key !== extra.key)
                    );
                  }}
                />
                <span className="flex-1">{extra.label}</span>
                <span className="text-xs text-[var(--muted)]">
                  ${extra.price}
                  {extra.daily ? "/day" : ""}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4">
        <div className="flex justify-between text-sm">
          <span className="text-[var(--muted)]">Base hire</span>
          <span className="font-semibold">${quote.base}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-[var(--muted)]">Extras</span>
          <span className="font-semibold">${quote.extrasTotal}</span>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-[var(--muted)]">Tax estimate</span>
          <span className="font-semibold">${quote.tax}</span>
        </div>
        <div className="mt-3 flex items-end justify-between border-t border-[var(--border)] pt-3">
          <span className="text-sm font-extrabold">Estimated total</span>
          <span className="text-3xl font-extrabold text-[var(--green-800)] dark:text-white">
            ${quote.total}
          </span>
        </div>
      </div>

      <Link
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
        href={`/book?type=vehicle&vehicleId=${vehicle.id}&hireDays=${days}`}
      >
        Request this vehicle
      </Link>
    </div>
  );
}
