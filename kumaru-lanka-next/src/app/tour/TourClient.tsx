"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, ToursApi, Tour } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export default function TourClient() {
  const sp = useSearchParams();
  const id = useMemo(() => sp.get("id") || "", [sp]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tour, setTour] = useState<Tour | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.resolve().then(() => {
      setLoading(true);
      setError(null);
      setTour(null);
    });
    ToursApi.get(Number(id))
      .then((t) => setTour(t))
      .catch((err: unknown) => {
        const msg =
          err instanceof ApiError || err instanceof Error
            ? err.message
            : "Failed to load tour";
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-[var(--surface-2)]">
        <div className="container py-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/tours"
              className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--brand)]"
            >
              ← Back to tours
            </Link>
            {tour ? <Badge tone="brand">{tour.category}</Badge> : null}
          </div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold text-[var(--green-800)] dark:text-white">
            {tour?.title || "Tour"}
          </h1>
          {tour ? (
            <p className="mt-2 max-w-3xl text-sm md:text-base text-[var(--muted)]">
              {tour.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="container py-10 md:py-14">
        {!id ? (
          <div className="surface p-6 text-sm text-[var(--muted)]">
            Missing tour id.
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

        {tour ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-full h-[280px] md:h-[420px] object-cover rounded-3xl border border-[var(--border)]"
              />
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <div className="surface p-6">
                  <div className="text-sm font-extrabold">Highlights</div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {tour.highlights?.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                </div>
                <div className="surface p-6">
                  <div className="text-sm font-extrabold">Includes</div>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                    {tour.includes?.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <aside className="surface p-6 h-fit sticky top-20">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                Price
              </div>
              <div className="mt-1 text-3xl font-extrabold text-[var(--brand)]">
                ${tour.price}
                <span className="ml-1 text-sm font-semibold text-[var(--muted)]">
                  /person
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                <div>
                  Duration:{" "}
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    {tour.duration}
                  </span>
                </div>
                <div>
                  Pax:{" "}
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    {tour.paxRange}
                  </span>
                </div>
                <div>
                  Stay:{" "}
                  <span className="font-semibold text-[var(--fg)] dark:text-white">
                    {tour.accommodation}
                  </span>
                </div>
              </div>

              <Link
                href={`/book?type=tour&tourId=${tour.id}`}
                className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]"
              >
                Book this tour
              </Link>
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}

