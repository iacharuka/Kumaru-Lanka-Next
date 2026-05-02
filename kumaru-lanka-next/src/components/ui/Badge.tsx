export function Badge({
  children,
  tone = "brand",
}: {
  children: React.ReactNode;
  tone?: "brand" | "green" | "neutral";
}) {
  const cls =
    tone === "brand"
      ? "bg-[var(--brand-soft)] text-[var(--brand)] border-[var(--brand-soft)]"
      : tone === "green"
        ? "bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-900/40"
        : "bg-[var(--surface-2)] text-[var(--muted)] border-[var(--border)]";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${cls}`}
    >
      {children}
    </span>
  );
}

