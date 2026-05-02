"use client";

import { useEffect, useState } from "react";
import { AdminItinerariesApi, Itinerary } from "@/lib/api";

export function ItinerariesManagement() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await AdminItinerariesApi.list();
        if (!cancelled) {
          setItineraries(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load itineraries");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="text-center py-8">Loading itineraries...</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold">Saved itineraries</h3>
        <span className="text-sm text-[var(--muted)]">
          {itineraries.length} total
        </span>
      </div>

      {error ? (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      {itineraries.length === 0 ? (
        <div className="text-center py-8 text-[var(--muted)]">
          No saved itineraries yet
        </div>
      ) : (
        <div className="grid gap-4">
          {itineraries.map((itinerary) => {
            const isOpen = openId === itinerary.id;
            const driveHours = itinerary.stops.reduce(
              (sum, stop) => sum + (stop.driveHours || 0),
              0
            );

            return (
              <div
                key={itinerary.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-base font-extrabold">
                      {itinerary.tripName}
                    </div>
                    <div className="mt-1 text-sm text-[var(--muted)]">
                      {itinerary.ownerName} · {itinerary.ownerEmail}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
                      <span>{itinerary.days} days</span>
                      <span>{itinerary.travelers} travelers</span>
                      <span>{itinerary.pace}</span>
                      <span>{itinerary.stops.length} stops</span>
                      <span>{driveHours.toFixed(1)} drive hrs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-[var(--muted)]">
                      {new Date(itinerary.updatedAt).toLocaleString()}
                    </div>
                    <button
                      className="h-9 rounded-full border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)]"
                      onClick={() => setOpenId(isOpen ? null : itinerary.id)}
                    >
                      {isOpen ? "Hide" : "View"}
                    </button>
                  </div>
                </div>

                {isOpen ? (
                  <div className="mt-4 grid gap-3">
                    {Array.from({ length: itinerary.days }, (_, index) => index + 1).map(
                      (day) => {
                        const stops = itinerary.stops
                          .filter((stop) => stop.day === day)
                          .sort((a, b) => a.order - b.order);

                        return (
                          <div
                            key={day}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                          >
                            <div className="text-sm font-extrabold">Day {day}</div>
                            {stops.length === 0 ? (
                              <div className="mt-1 text-sm text-[var(--muted)]">
                                Free day
                              </div>
                            ) : (
                              <ul className="mt-2 grid gap-2">
                                {stops.map((stop) => (
                                  <li key={stop.id} className="text-sm">
                                    <span className="font-semibold">{stop.title}</span>
                                    {stop.region ? (
                                      <span className="text-[var(--muted)]">
                                        {" "}
                                        · {stop.region}
                                      </span>
                                    ) : null}
                                    {stop.notes ? (
                                      <div className="text-xs text-[var(--muted)]">
                                        {stop.notes}
                                      </div>
                                    ) : null}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      }
                    )}
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
