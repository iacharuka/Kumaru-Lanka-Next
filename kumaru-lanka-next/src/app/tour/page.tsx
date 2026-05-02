import { Suspense } from "react";
import TourClient from "./TourClient";

export default function TourPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 md:py-14">
          <div className="surface p-6 text-sm text-[var(--muted)]">Loading…</div>
        </div>
      }
    >
      <TourClient />
    </Suspense>
  );
}

