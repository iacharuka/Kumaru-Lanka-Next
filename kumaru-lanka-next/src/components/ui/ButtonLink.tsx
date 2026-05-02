import Link from "next/link";

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost";
}) {
  const base =
    "inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors";
  const cls =
    variant === "primary"
      ? "bg-[var(--brand)] text-white hover:bg-[var(--brand-dark)]"
      : variant === "outline"
        ? "border border-white/25 text-white hover:border-white/40"
        : "bg-white/10 text-white hover:bg-white/15";

  return (
    <Link href={href} className={`${base} ${cls}`}>
      {children}
    </Link>
  );
}

