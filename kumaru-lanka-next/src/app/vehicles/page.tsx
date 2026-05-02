import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import type { Vehicle } from "@/lib/api";
import { ServerVehicles } from "@/lib/serverApi";
import { VehicleEstimator } from "./VehicleEstimator";

export const metadata = {
  title: "Transport — Kumaru Lanka",
  description:
    "Hire a vehicle with an expert driver in Sri Lanka. Transparent pricing and easy booking.",
};

const fallbackVehicles: Vehicle[] = [
  {
    id: 1,
    slug: "tuk",
    name: "Tuk-Tuk",
    icon: "Tuk",
    tagline: "Authentic Sri Lankan city rides",
    description: "Best for Colombo food crawls, short hops, and breezy local routes.",
    pricePerDay: 25,
    passengers: "1-3",
    luggage: "Small bags",
    hasAC: false,
    features: JSON.stringify(["City tours", "Short trips", "Easy parking"]),
    isActive: true,
  },
  {
    id: 2,
    slug: "car",
    name: "Private Car",
    icon: "Car",
    tagline: "Comfortable inter-city travel",
    description: "A quiet AC sedan for couples, solo travellers, and small families.",
    pricePerDay: 55,
    passengers: "1-4",
    luggage: "2 large bags",
    hasAC: true,
    features: JSON.stringify(["Full AC", "Phone charger", "Comfortable seats"]),
    isActive: true,
  },
  {
    id: 3,
    slug: "van",
    name: "AC Van",
    icon: "Van",
    tagline: "Room for families and groups",
    description: "Spacious transport for multi-day tours with luggage and comfort.",
    pricePerDay: 75,
    passengers: "5-8",
    luggage: "4-6 large bags",
    hasAC: true,
    features: JSON.stringify(["Full AC", "Large luggage space", "USB charging"]),
    isActive: true,
  },
  {
    id: 4,
    slug: "bus",
    name: "Mini Bus",
    icon: "Bus",
    tagline: "Large groups and corporate tours",
    description: "A practical choice for teams, school trips, and extended families.",
    pricePerDay: 110,
    passengers: "9-20",
    luggage: "Group luggage",
    hasAC: true,
    features: JSON.stringify(["Full AC", "PA system", "Large storage"]),
    isActive: true,
  },
];

function parseFeatures(features: string) {
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed.slice(0, 4) : [];
  } catch {
    return features
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);
  }
}

export default async function VehiclesPage() {
  const apiVehicles = await ServerVehicles.list();
  const vehicles = apiVehicles.length ? apiVehicles : fallbackVehicles;

  return (
    <div>
      <section className="bg-[var(--surface-2)]">
        <div className="container grid gap-8 py-10 md:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <Badge tone="brand">Private transport</Badge>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--green-800)] dark:text-white md:text-5xl">
              Hire a vehicle with a trusted Sri Lankan driver
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base md:leading-7">
              Airport pickups, day trips, multi-day tours, and group transfers
              with clear pricing, flexible stops, and local drivers who know the
              roads beyond the map.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/book?type=vehicle">Book transport</ButtonLink>
              <Link
                className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-5 text-sm font-semibold text-[var(--green-800)] hover:border-[var(--brand)] dark:text-white"
                href="/tours"
              >
                Pair with a tour
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                ["24/7", "Airport pickup"],
                ["4", "Vehicle types"],
                ["10%", "Tax shown"],
              ].map(([value, label]) => (
                <div
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
                  key={label}
                >
                  <div className="text-xl font-extrabold text-[var(--green-800)] dark:text-white md:text-2xl">
                    {value}
                  </div>
                  <div className="mt-1 text-xs text-[var(--muted)]">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <VehicleEstimator vehicles={vehicles} />
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <Badge tone="green">Fleet</Badge>
            <h2 className="mt-3 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Choose the right ride
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[var(--muted)]">
            Every option includes a driver. Pick by comfort, luggage, group
            size, and the kind of route you are planning.
          </p>
        </div>

        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {vehicles.map((vehicle) => (
            <article className="surface p-5" key={vehicle.slug}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-extrabold text-[var(--green-800)] dark:text-white">
                    {vehicle.name}
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[var(--brand)]">
                    {vehicle.tagline}
                  </p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-2)] px-3 py-2 text-sm font-extrabold">
                  {vehicle.icon}
                </div>
              </div>

              <p className="mt-4 min-h-16 text-sm leading-6 text-[var(--muted)]">
                {vehicle.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[var(--surface-2)] p-3">
                  <div className="text-xs text-[var(--muted)]">Passengers</div>
                  <div className="mt-1 font-extrabold">{vehicle.passengers}</div>
                </div>
                <div className="rounded-xl bg-[var(--surface-2)] p-3">
                  <div className="text-xs text-[var(--muted)]">Luggage</div>
                  <div className="mt-1 font-extrabold">{vehicle.luggage}</div>
                </div>
              </div>

              <ul className="mt-5 grid gap-2 text-sm text-[var(--muted)]">
                {parseFeatures(vehicle.features).map((feature) => (
                  <li className="flex items-center gap-2" key={feature}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--brand)]" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-end justify-between border-t border-[var(--border)] pt-4">
                <div>
                  <div className="text-xs text-[var(--muted)]">From</div>
                  <div className="text-2xl font-extrabold text-[var(--green-800)] dark:text-white">
                    ${vehicle.pricePerDay}
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      /day
                    </span>
                  </div>
                </div>
                <div className="rounded-full bg-[var(--surface-2)] px-3 py-1 text-xs font-bold">
                  {vehicle.hasAC ? "AC" : "Open air"}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            [
              "Airport and hotel transfers",
              "Meet-and-greet pickups, luggage help, and direct routes after long flights.",
            ],
            [
              "Flexible day trips",
              "Plan Sigiriya, Kandy, Galle, Ella, or custom stops at your own pace.",
            ],
            [
              "Multi-day island routes",
              "Keep the same driver across the trip for smoother timing and better local context.",
            ],
          ].map(([title, copy]) => (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5" key={title}>
              <div className="text-base font-extrabold text-[var(--green-800)] dark:text-white">
                {title}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl bg-[var(--green-800)] p-6 text-white md:p-8">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="text-2xl font-extrabold">
                Need transport for a tour, transfer, or custom itinerary?
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                Send the route, travel date, passenger count, and luggage notes.
                Kumaru Lanka will confirm the best vehicle and final quote.
              </p>
            </div>
            <ButtonLink href="/book?type=vehicle" variant="outline">
              Start booking
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
}
