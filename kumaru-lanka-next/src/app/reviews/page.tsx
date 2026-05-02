import { Badge } from "@/components/ui/Badge";
import { ServerReviews } from "@/lib/serverApi";

export const metadata = {
  title: "Reviews — Kumaru Lanka",
  description: "Real traveller stories from around the world.",
};

export default async function ReviewsPage() {
  const reviews = await ServerReviews.list();

  return (
    <div className="container py-10 md:py-14">
      <Badge tone="brand">Traveller stories</Badge>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
        Reviews
      </h1>
      <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
        Real experiences from travellers around the world.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews
          .filter((r) => r.isApproved)
          .slice(0, 18)
          .map((r) => (
            <div
              key={r.id}
              className="surface p-5"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-11 w-11 rounded-full flex items-center justify-center text-white font-extrabold"
                  style={{ background: r.avatarColor || "#e07b39" }}
                >
                  {r.avatar || "★"}
                </div>
                <div>
                  <div className="font-extrabold">{r.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {r.flag} {r.country} · {r.reviewDate}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-sm font-semibold">
                {"★".repeat(Math.max(0, Math.min(5, r.rating)))}
                <span className="text-[var(--muted)]">
                  {" "}
                  {"☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, r.rating))))}
                </span>
              </div>

              <p className="mt-3 text-sm text-[var(--muted)] leading-6">
                “{r.text}”
              </p>

              <div className="mt-3 text-xs font-bold text-[var(--brand)]">
                {r.tourTitle}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

