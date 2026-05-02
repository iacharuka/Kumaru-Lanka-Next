import { Suspense } from "react";
import BookingStatusClient from "./BookingStatusClient";

export default function BookingStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 md:py-14">
          <div className="surface p-6 text-sm text-[var(--muted)]">Loading…</div>
        </div>
      }
    >
      <BookingStatusClient />
    </Suspense>
  );
}

