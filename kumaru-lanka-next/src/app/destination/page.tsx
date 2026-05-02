import { Suspense } from "react";
import DestinationClient from "./DestinationClient";

export default function DestinationPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 md:py-14">
          <div className="surface p-6 text-sm text-[var(--muted)]">Loading…</div>
        </div>
      }
    >
      <DestinationClient />
    </Suspense>
  );
}

