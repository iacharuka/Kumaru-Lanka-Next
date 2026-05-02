import Link from "next/link";
import type { Tour } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      href={`/tour?id=${tour.id}`}
      className="group overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] transition hover:-translate-y-0.5"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tour.imageUrl}
        alt={tour.title}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {tour.tags?.slice(0, 3).map((t) => (
            <Badge key={t} tone="neutral">
              {t}
            </Badge>
          ))}
        </div>
        <div className="mt-3 text-lg font-extrabold text-[var(--green-800)] dark:text-white">
          {tour.title}
        </div>
        <div className="mt-1 text-sm text-[var(--muted)]">
          {tour.duration} · {tour.paxRange} · {tour.accommodation}
        </div>
        <div className="mt-3 flex items-end justify-between gap-3">
          <div>
            <div className="text-xl font-extrabold text-[var(--brand)]">
              ${tour.price}
              <span className="ml-1 text-xs font-semibold text-[var(--muted)]">
                /person
              </span>
            </div>
            <div className="text-xs text-[var(--muted)]">
              {tour.rating.toFixed(1)}★ · {tour.reviewCount} reviews
            </div>
          </div>
          <span className="text-sm font-semibold text-[var(--green-800)] dark:text-white group-hover:text-[var(--brand)]">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

