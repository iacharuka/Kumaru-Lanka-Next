import Link from "next/link";
import type { Destination } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";

export function DestinationCard({ dest }: { dest: Destination }) {
  return (
    <Link
      href={`/destination?id=${dest.id}`}
      className="group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dest.imageUrl}
        alt={dest.name}
        className="h-44 w-full object-cover transition group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="text-lg font-extrabold text-white">{dest.name}</div>
          {dest.badge ? <Badge tone="brand">{dest.badge}</Badge> : null}
        </div>
        <div className="mt-1 text-sm text-white/80">{dest.subtitle}</div>
      </div>
    </Link>
  );
}

