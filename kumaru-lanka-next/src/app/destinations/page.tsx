import { ServerDestinations } from "@/lib/serverApi";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Destinations — Kumaru Lanka",
  description: "Explore Sri Lanka destinations: beaches, culture, wildlife, and hidden gems.",
};

export default async function DestinationsPage() {
  const dests = await ServerDestinations.list();

  return (
    <div className="container py-10 md:py-14">
      <Badge tone="brand">Explore Sri Lanka</Badge>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
        Popular destinations
      </h1>
      <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
        From ancient kingdoms to turquoise coastlines — plan by region and vibe.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {dests.map((d) => (
          <DestinationCard key={d.id} dest={d} />
        ))}
      </div>
    </div>
  );
}

