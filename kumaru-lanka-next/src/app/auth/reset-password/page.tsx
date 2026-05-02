import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-10 md:py-14">
          <div className="mx-auto max-w-md surface p-6 md:p-8 text-sm text-[var(--muted)]">
            Loading…
          </div>
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}

