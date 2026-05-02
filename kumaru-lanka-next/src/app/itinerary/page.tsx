"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ApiError, ItinerariesApi } from "@/lib/api";
import { getToken } from "@/lib/auth";

type Pace = "relaxed" | "balanced" | "packed";

type DestinationSuggestion = {
  name: string;
  region: string;
  category: "Culture" | "Beach" | "Wildlife" | "Hill Country" | "City";
  nights: number;
  driveHours: number;
  highlight: string;
};

type ItineraryStop = {
  id: string;
  day: number;
  order: number;
  title: string;
  region?: string;
  category?: string;
  notes?: string;
  driveHours?: number;
};

type ItineraryState = {
  tripName: string;
  days: number;
  travelers: number;
  pace: Pace;
  stops: ItineraryStop[];
};

const STORAGE_KEY = "kl_itinerary_v2";

const SUGGESTIONS: DestinationSuggestion[] = [
  {
    name: "Colombo",
    region: "Western Province",
    category: "City",
    nights: 1,
    driveHours: 0.5,
    highlight: "Street food, Pettah market, sunset at Galle Face",
  },
  {
    name: "Sigiriya",
    region: "Cultural Triangle",
    category: "Culture",
    nights: 2,
    driveHours: 4.5,
    highlight: "Lion Rock, Dambulla caves, village lunch",
  },
  {
    name: "Kandy",
    region: "Central Province",
    category: "Culture",
    nights: 1,
    driveHours: 3,
    highlight: "Temple of the Tooth, botanical gardens",
  },
  {
    name: "Nuwara Eliya",
    region: "Hill Country",
    category: "Hill Country",
    nights: 1,
    driveHours: 2.5,
    highlight: "Tea estates, cool climate, Gregory Lake",
  },
  {
    name: "Ella",
    region: "Uva Province",
    category: "Hill Country",
    nights: 2,
    driveHours: 3,
    highlight: "Nine Arches Bridge, Little Adam's Peak",
  },
  {
    name: "Yala National Park",
    region: "Southern Province",
    category: "Wildlife",
    nights: 1,
    driveHours: 2.5,
    highlight: "Leopard safari and lakeside wildlife",
  },
  {
    name: "Mirissa",
    region: "South Coast",
    category: "Beach",
    nights: 2,
    driveHours: 2.5,
    highlight: "Whale watching, Secret Beach, coconut hill",
  },
  {
    name: "Galle Fort",
    region: "Southern Province",
    category: "Culture",
    nights: 1,
    driveHours: 1.5,
    highlight: "Dutch Fort lanes, cafes, lighthouse walk",
  },
  {
    name: "Trincomalee",
    region: "Eastern Province",
    category: "Beach",
    nights: 2,
    driveHours: 5.5,
    highlight: "Nilaveli beach, snorkeling, Koneswaram temple",
  },
];

const DEFAULT_STATE: ItineraryState = {
  tripName: "Sri Lanka discovery",
  days: 7,
  travelers: 2,
  pace: "balanced",
  stops: [
    createStop(1, 1, SUGGESTIONS[0]),
    createStop(2, 1, SUGGESTIONS[1]),
    createStop(3, 2, SUGGESTIONS[1]),
    createStop(4, 1, SUGGESTIONS[2]),
    createStop(5, 1, SUGGESTIONS[4]),
    createStop(6, 1, SUGGESTIONS[6]),
    createStop(7, 1, SUGGESTIONS[7]),
  ],
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function createStop(
  day: number,
  order: number,
  suggestion: DestinationSuggestion
): ItineraryStop {
  return {
    id: uid(),
    day,
    order,
    title: suggestion.name,
    region: suggestion.region,
    category: suggestion.category,
    notes: suggestion.highlight,
    driveHours: suggestion.driveHours,
  };
}

function loadInitial(): ItineraryState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return DEFAULT_STATE;

  try {
    const parsed = JSON.parse(raw) as Partial<ItineraryState>;
    return {
      tripName: parsed.tripName || DEFAULT_STATE.tripName,
      days:
        typeof parsed.days === "number" && parsed.days > 0
          ? Math.min(parsed.days, 30)
          : DEFAULT_STATE.days,
      travelers:
        typeof parsed.travelers === "number" && parsed.travelers > 0
          ? Math.min(parsed.travelers, 30)
          : DEFAULT_STATE.travelers,
      pace:
        parsed.pace === "relaxed" ||
        parsed.pace === "balanced" ||
        parsed.pace === "packed"
          ? parsed.pace
          : DEFAULT_STATE.pace,
      stops: Array.isArray(parsed.stops) ? parsed.stops : DEFAULT_STATE.stops,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function clampDay(value: number, days: number) {
  if (Number.isNaN(value)) return 1;
  return Math.min(Math.max(value, 1), days);
}

function paceLabel(pace: Pace) {
  if (pace === "relaxed") return "Relaxed";
  if (pace === "packed") return "Packed";
  return "Balanced";
}

export default function ItineraryPage() {
  const [tripName, setTripName] = useState(() => loadInitial().tripName);
  const [days, setDays] = useState(() => loadInitial().days);
  const [travelers, setTravelers] = useState(() => loadInitial().travelers);
  const [pace, setPace] = useState<Pace>(() => loadInitial().pace);
  const [stops, setStops] = useState<ItineraryStop[]>(() => loadInitial().stops);
  const [selectedDay, setSelectedDay] = useState(1);
  const [customPlace, setCustomPlace] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [loadMessage, setLoadMessage] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tripName, days, travelers, pace, stops })
    );
  }, [tripName, days, travelers, pace, stops]);

  const grouped = useMemo(() => {
    const map = new Map<number, ItineraryStop[]>();
    for (let day = 1; day <= days; day++) map.set(day, []);
    for (const stop of stops) {
      const safeDay = clampDay(stop.day, days);
      map.get(safeDay)?.push({ ...stop, day: safeDay });
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.order - b.order);
    }
    return map;
  }, [days, stops]);

  const filteredSuggestions = useMemo(() => {
    return category === "All"
      ? SUGGESTIONS
      : SUGGESTIONS.filter((item) => item.category === category);
  }, [category]);

  const summary = useMemo(() => {
    const totalStops = stops.length;
    const routeHours = stops.reduce((sum, stop) => sum + (stop.driveHours || 0), 0);
    const busyDays = Array.from(grouped.values()).filter((items) => items.length > 0).length;
    return { totalStops, routeHours, busyDays };
  }, [grouped, stops]);

  function addSuggestion(suggestion: DestinationSuggestion) {
    setStops((current) => {
      const dayStops = current.filter((stop) => stop.day === selectedDay);
      return [
        ...current,
        createStop(selectedDay, dayStops.length + 1, suggestion),
      ];
    });
  }

  function addCustomStop() {
    const title = customPlace.trim();
    if (!title) return;

    setStops((current) => {
      const dayStops = current.filter((stop) => stop.day === selectedDay);
      return [
        ...current,
        {
          id: uid(),
          day: selectedDay,
          order: dayStops.length + 1,
          title,
          notes: customNotes.trim() || undefined,
        },
      ];
    });
    setCustomPlace("");
    setCustomNotes("");
  }

  function moveStop(id: string, direction: -1 | 1) {
    setStops((current) =>
      current.map((stop) =>
        stop.id === id
          ? { ...stop, day: clampDay(stop.day + direction, days) }
          : stop
      )
    );
  }

  function removeStop(id: string) {
    setStops((current) => current.filter((stop) => stop.id !== id));
  }

  function buildClassicRoute() {
    setTripName("Classic Sri Lanka loop");
    setDays(7);
    setPace("balanced");
    setStops(DEFAULT_STATE.stops);
    setSelectedDay(1);
  }

  function buildBeachRoute() {
    const route = [
      SUGGESTIONS[0],
      SUGGESTIONS[7],
      SUGGESTIONS[6],
      SUGGESTIONS[6],
      SUGGESTIONS[8],
      SUGGESTIONS[8],
    ];
    setTripName("South coast and east beach break");
    setDays(6);
    setPace("relaxed");
    setStops(route.map((item, index) => createStop(index + 1, 1, item)));
    setSelectedDay(1);
  }

  async function copySummary() {
    const text = Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const items = grouped.get(day) || [];
      const lineItems =
        items.length === 0
          ? "Free day"
          : items
              .map((stop) => `${stop.title}${stop.notes ? ` - ${stop.notes}` : ""}`)
              .join("; ");
      return `Day ${day}: ${lineItems}`;
    }).join("\n");

    await window.navigator.clipboard?.writeText(`${tripName}\n${text}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  async function saveToAccount() {
    if (!getToken()) {
      setSaveMessage("Please sign in before saving this itinerary.");
      return;
    }

    setSaving(true);
    setSaveMessage(null);
    try {
      const saved = await ItinerariesApi.save({
        tripName,
        days,
        travelers,
        pace,
        stops,
      });
      setSaveMessage(`Saved itinerary #${saved.id}. Admin can see it now.`);
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not save itinerary.";
      setSaveMessage(message);
    } finally {
      setSaving(false);
    }
  }

  async function loadLatestFromAccount() {
    if (!getToken()) {
      setLoadMessage("Please sign in before loading saved itineraries.");
      return;
    }

    setLoadMessage(null);
    try {
      const saved = await ItinerariesApi.mine();
      const latest = saved[0];
      if (!latest) {
        setLoadMessage("No saved itinerary found for this account yet.");
        return;
      }

      setTripName(latest.tripName);
      setDays(latest.days);
      setTravelers(latest.travelers);
      setPace(latest.pace);
      setStops(latest.stops);
      setSelectedDay(1);
      setLoadMessage(`Loaded itinerary #${latest.id}.`);
    } catch (error) {
      const message =
        error instanceof ApiError || error instanceof Error
          ? error.message
          : "Could not load itinerary.";
      setLoadMessage(message);
    }
  }

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="brand">Trip planner</Badge>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
            Itinerary builder
          </h1>
          <p className="mt-2 max-w-2xl text-sm md:text-base text-[var(--muted)]">
            Build a day-by-day Sri Lanka route, save it locally, and turn it
            into a booking plan when you are ready.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:border-[var(--brand)]"
            onClick={buildClassicRoute}
          >
            Classic 7 days
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:border-[var(--brand)]"
            onClick={buildBeachRoute}
          >
            Beach route
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:border-[var(--brand)]"
            onClick={loadLatestFromAccount}
          >
            Load saved
          </button>
          <button
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)] disabled:opacity-60"
            disabled={saving}
            onClick={saveToAccount}
          >
            {saving ? "Saving..." : "Save to account"}
          </button>
        </div>
      </div>

      {(saveMessage || loadMessage) && (
        <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--muted)]">
          {saveMessage || loadMessage}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[330px_1fr_320px]">
        <aside className="surface p-5">
          <div className="text-sm font-extrabold">Trip settings</div>
          <div className="mt-4 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold">
              Trip name
              <input
                className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
                value={tripName}
                onChange={(event) => setTripName(event.target.value)}
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm font-semibold">
                Days
                <input
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
                  type="number"
                  min={1}
                  max={30}
                  value={days}
                  onChange={(event) => {
                    const nextDays = clampDay(Number(event.target.value), 30);
                    setDays(nextDays);
                    setSelectedDay((value) => clampDay(value, nextDays));
                    setStops((current) =>
                      current.map((stop) => ({
                        ...stop,
                        day: clampDay(stop.day, nextDays),
                      }))
                    );
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Travelers
                <input
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
                  type="number"
                  min={1}
                  max={30}
                  value={travelers}
                  onChange={(event) =>
                    setTravelers(clampDay(Number(event.target.value), 30))
                  }
                />
              </label>
            </div>

            <div>
              <div className="text-sm font-semibold">Pace</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["relaxed", "balanced", "packed"] as Pace[]).map((option) => (
                  <button
                    key={option}
                    className={`h-10 rounded-full border px-2 text-xs font-semibold ${
                      pace === option
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--border)] hover:border-[var(--brand)]"
                    }`}
                    onClick={() => setPace(option)}
                  >
                    {paceLabel(option)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-[var(--border)] pt-5">
            <div className="text-sm font-extrabold">Add custom stop</div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-2 text-sm font-semibold">
                Day
                <select
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(Number(event.target.value))}
                >
                  {Array.from({ length: days }, (_, index) => index + 1).map(
                    (day) => (
                      <option key={day} value={day}>
                        Day {day}
                      </option>
                    )
                  )}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Place
                <input
                  className="h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 font-normal"
                  value={customPlace}
                  onChange={(event) => setCustomPlace(event.target.value)}
                  placeholder="Anuradhapura"
                />
              </label>
              <label className="grid gap-2 text-sm font-semibold">
                Notes
                <textarea
                  className="min-h-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-normal"
                  value={customNotes}
                  onChange={(event) => setCustomNotes(event.target.value)}
                  placeholder="Temple visit, lunch stop, hotel area..."
                />
              </label>
              <button
                className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--brand)] px-5 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
                onClick={addCustomStop}
              >
                Add stop
              </button>
            </div>
          </div>
        </aside>

        <main className="grid gap-6">
          <section className="surface p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm font-extrabold">Timeline</div>
                <div className="mt-1 text-sm text-[var(--muted)]">
                  {summary.totalStops} stops across {summary.busyDays} planned days
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--border)] px-4 text-sm font-semibold hover:border-[var(--brand)]"
                  onClick={copySummary}
                >
                  {copied ? "Copied" : "Copy summary"}
                </button>
                <button
                  className="inline-flex h-10 items-center justify-center rounded-full border border-red-200 px-4 text-sm font-semibold text-red-700 hover:border-red-400"
                  onClick={() => setStops([])}
                >
                  Clear all
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {Array.from({ length: days }, (_, index) => index + 1).map((day) => {
                const items = grouped.get(day) || [];
                return (
                  <div
                    key={day}
                    className={`rounded-2xl border p-4 ${
                      selectedDay === day
                        ? "border-[var(--brand)] bg-[var(--brand-soft)] text-[#32190c]"
                        : "border-[var(--border)] bg-[var(--surface-2)]"
                    }`}
                  >
                    <button
                      className="flex w-full items-center justify-between gap-3 text-left"
                      onClick={() => setSelectedDay(day)}
                    >
                      <span className="text-sm font-extrabold">Day {day}</span>
                      <span className="text-xs font-semibold text-[var(--muted)]">
                        {items.length || "No"} stop{items.length === 1 ? "" : "s"}
                      </span>
                    </button>

                    {items.length === 0 ? (
                      <div className="mt-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">
                        Select this day and add a destination from the planner.
                      </div>
                    ) : (
                      <ol className="mt-3 grid gap-3">
                        {items.map((stop, index) => (
                          <li
                            key={stop.id}
                            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-extrabold">
                                  {index + 1}. {stop.title}
                                </div>
                                <div className="mt-1 text-xs text-[var(--muted)]">
                                  {[stop.region, stop.category]
                                    .filter(Boolean)
                                    .join(" · ") || "Custom stop"}
                                </div>
                              </div>
                              <button
                                className="text-xs font-bold text-red-600 hover:opacity-80"
                                onClick={() => removeStop(stop.id)}
                              >
                                Remove
                              </button>
                            </div>
                            {stop.notes ? (
                              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                {stop.notes}
                              </p>
                            ) : null}
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                className="h-8 rounded-full border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)] disabled:opacity-40"
                                disabled={stop.day === 1}
                                onClick={() => moveStop(stop.id, -1)}
                              >
                                Previous day
                              </button>
                              <button
                                className="h-8 rounded-full border border-[var(--border)] px-3 text-xs font-semibold hover:border-[var(--brand)] disabled:opacity-40"
                                disabled={stop.day === days}
                                onClick={() => moveStop(stop.id, 1)}
                              >
                                Next day
                              </button>
                            </div>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>

        <aside className="grid gap-6 content-start">
          <section className="surface p-5">
            <div className="text-sm font-extrabold">Destination planner</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["All", "Culture", "Hill Country", "Beach", "Wildlife", "City"].map(
                (item) => (
                  <button
                    key={item}
                    className={`h-9 rounded-full border px-3 text-xs font-semibold ${
                      category === item
                        ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                        : "border-[var(--border)] hover:border-[var(--brand)]"
                    }`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                )
              )}
            </div>

            <div className="mt-4 grid gap-3">
              {filteredSuggestions.map((item) => (
                <div
                  key={item.name}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold">{item.name}</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">
                        {item.region} · {item.category}
                      </div>
                    </div>
                    <button
                      className="h-8 rounded-full bg-[var(--green-800)] px-3 text-xs font-semibold text-white hover:bg-[var(--green-700)]"
                      onClick={() => addSuggestion(item)}
                    >
                      Add
                    </button>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                    {item.highlight}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="surface overflow-hidden">
            <div className="p-5">
              <div className="text-sm font-extrabold">Route snapshot</div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[var(--surface-2)] p-3">
                  <div className="text-lg font-extrabold">{days}</div>
                  <div className="text-xs text-[var(--muted)]">Days</div>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-3">
                  <div className="text-lg font-extrabold">{travelers}</div>
                  <div className="text-xs text-[var(--muted)]">Guests</div>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-3">
                  <div className="text-lg font-extrabold">
                    {summary.routeHours.toFixed(1)}
                  </div>
                  <div className="text-xs text-[var(--muted)]">Drive hrs</div>
                </div>
              </div>
            </div>

            <div className="relative h-72 overflow-hidden border-t border-[var(--border)] bg-[#dbeed8]">
              <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(30deg,rgba(255,255,255,.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.5)_87.5%,rgba(255,255,255,.5)),linear-gradient(150deg,rgba(255,255,255,.5)_12%,transparent_12.5%,transparent_87%,rgba(255,255,255,.5)_87.5%,rgba(255,255,255,.5))] [background-size:48px_84px]" />
              <div className="absolute left-8 top-8 h-56 w-40 rounded-[60%_45%_55%_45%] bg-[#5fad72] shadow-[inset_-18px_-18px_0_rgba(0,0,0,.08)]" />
              <div className="absolute left-24 top-12 h-44 w-24 rounded-[45%_55%_50%_50%] bg-[#7ec98c]" />
              <div className="absolute left-20 top-12 h-48 w-1 rounded-full bg-white/80" />
              {Array.from(new Set(stops.map((stop) => stop.title)))
                .slice(0, 7)
                .map((title, index) => (
                  <div
                    key={`${title}-${index}`}
                    className="absolute flex items-center gap-2"
                    style={{
                      left: `${52 + (index % 2) * 58}px`,
                      top: `${36 + index * 30}px`,
                    }}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-extrabold text-white">
                      {index + 1}
                    </span>
                    <span className="max-w-32 truncate rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#1a2e1a] shadow">
                      {title}
                    </span>
                  </div>
                ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
