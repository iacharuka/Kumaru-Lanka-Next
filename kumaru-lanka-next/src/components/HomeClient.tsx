"use client";

import { useEffect, useState } from "react";
import { ToursApi, DestinationsApi } from "@/lib/api";
import { TourCard } from "@/components/cards/TourCard";
import { DestinationCard } from "@/components/cards/DestinationCard";

export default function HomeClient() {
  const [tours, setTours] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [t, d] = await Promise.all([ToursApi.list(), DestinationsApi.list()]);
        if (!mounted) return;
        setTours(t || []);
        setDestinations(d || []);
      } catch (err) {
        console.error("Failed to load home data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredTours = tours.slice(0, 3);
  const featuredDestinations = destinations.slice(0, 3);

  return (
    <>
      <section className="container pb-12 md:pb-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Popular plans
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Featured tours
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-[var(--muted)]">Loading...</div>
        ) : featuredTours.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Tours are not available right now. Please try again in a moment.
          </div>
        )}
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Where travellers go
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Popular destinations
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-[var(--muted)]">Loading...</div>
        ) : featuredDestinations.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map((dest) => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Destinations are not available right now. Please try again in a moment.
          </div>
        )}
      </section>
    </>
  );
}
