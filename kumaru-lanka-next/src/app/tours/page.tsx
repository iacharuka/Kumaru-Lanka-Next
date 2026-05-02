import { ServerTours } from "@/lib/serverApi";
import { TourCard } from "@/components/cards/TourCard";
import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Tours — Kumaru Lanka",
  description: "Browse handcrafted Sri Lanka tour packages with transparent pricing.",
};

export default async function ToursPage() {
  const tours = await ServerTours.list();

  return (
    <div className="container py-10 md:py-14">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <Badge tone="brand">Tour packages</Badge>
          <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
            Handcrafted experiences
          </h1>
          <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
            Filter by category, search by place, and book in minutes.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tours.map((t) => (
          <TourCard key={t.id} tour={t} />
        ))}
      </div>
    </div>
  );
}

