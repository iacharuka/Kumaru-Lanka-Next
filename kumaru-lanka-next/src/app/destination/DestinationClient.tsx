"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, DestinationsApi, Destination } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function DestinationClient() {
  const sp = useSearchParams();
  const id = useMemo(() => sp.get("id") || "", [sp]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dest, setDest] = useState<Destination | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
      setDest(null);
    });
    DestinationsApi.get(Number(id))
      .then((d) => setDest(d))
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load destination";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const mapSrc = dest
    ? `https://www.openstreetmap.org/export/embed.html?search=${encodeURIComponent(
        `${dest.name}, Sri Lanka`
      )}`
    : null;

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="container py-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/destinations"
              className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
            >
              ← Back to destinations
            </Link>
            {dest ? <Badge tone="brand">{dest.type}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-[var(--green-800)] dark:text-white">
            {dest?.name || "Destination"}
          </h1>
          {dest ? (
            <p className="mt-2 max-w-3xl text-sm md:text-base text-[var(--muted)]">
              {dest.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container py-10 md:py-14">
        {!id ? (
          <div className="surface p-6 text-sm text-[var(--muted)]">
            Missing destination id.
          </div>
        ) : null}
        {loading ? (
          <div className="surface p-6 text-sm text-[var(--muted)]">Loading…</div>
        ) : null}
        {error ? (
          <div className="surface p-6 text-sm text-red-700 border border-red-200 bg-red-50">
            {error}
          </div>
        ) : null}

        {dest ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full h-[280px] md:h-[420px] object-cover rounded-3xl border border-[var(--border)]"
              />

              <div className="mt-6 surface p-6">
                <div className="text-sm font-extrabold">About</div>
                <p className="mt-3 text-sm md:text-base text-[var(--muted)] leading-7">
                  {dest.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--muted)]">
                  <span>📍 {dest.region}</span>
                  <span>•</span>
                  <span>🗓 Best time: {dest.bestTime}</span>
                  <span>•</span>
                  <span>🚗 {dest.distance}</span>
                </div>
              </div>

              {mapSrc ? (
                <div className="mt-6 surface p-0 overflow-hidden">
                  <div className="p-6 border-b border-[var(--border)]">
                    <div className="text-sm font-extrabold">Map</div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      Map teaser now; later we’ll add itinerary routing.
                    </div>
                  </div>
                  <iframe
                    title="Map"
                    src={mapSrc}
                    className="w-full h-[320px]"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>

            <aside className="surface p-6 h-fit sticky top-20">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Next step
              </div>
              <div className="mt-2 text-lg font-extrabold">
                Build an itinerary around {dest.name}
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Save places, add days, and get a trip plan.
              </p>
              <Link
                href={`/itinerary`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]"
              >
                Open itinerary builder
              </Link>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

