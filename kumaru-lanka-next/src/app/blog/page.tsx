import { Badge } from "@/components/ui/Badge";

export const metadata = {
  title: "Blog — Kumaru Lanka",
  description: "Travel tips, destination guides, and planning advice for Sri Lanka.",
};

export default function BlogPage() {
  return (
    <div className="container py-10 md:py-14">
      <Badge tone="brand">SEO</Badge>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
        Blog
      </h1>
      <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
        We’ll add SEO-first blog posts here (great for Google ranking): guides,
        itineraries, “best time to visit”, and hidden gems.
      </p>
    </div>
  );
}

