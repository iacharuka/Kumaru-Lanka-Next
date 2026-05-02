"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout, useAuthUser } from "@/lib/auth";

function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
        active
          ? "bg-white/10 text-white"
          : "text-white/75 hover:bg-white/5 hover:text-white"
      }`}
    >
      {children}
    </Link>
  );
}

export function SiteNav() {
  const user = useAuthUser();
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[rgba(10,30,20,0.94)] backdrop-blur">
      <div className="container flex min-h-16 flex-wrap items-center justify-between gap-3 py-2 md:min-h-[72px] md:flex-nowrap">
        <Link href="/" className="group flex items-center gap-3 text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-extrabold text-white">
            KL
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-wide">
              Kumaru<span className="text-[var(--brand)]">Lanka</span>
            </span>
            <span className="hidden text-xs font-semibold text-white/55 sm:block">
              Tours · transport · pay after meeting
            </span>
          </span>
        </Link>

        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-2 md:w-auto md:justify-center">
          <NavLink href="/tours" active={isActive("/tours")}>
            Tours
          </NavLink>
          <NavLink href="/destinations" active={isActive("/destinations")}>
            Destinations
          </NavLink>
          <NavLink href="/vehicles" active={isActive("/vehicles")}>
            Transport
          </NavLink>
          <NavLink href="/itinerary" active={isActive("/itinerary")}>
            Itinerary
          </NavLink>
          <NavLink href="/booking-status" active={isActive("/booking-status")}>
            Status
          </NavLink>
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3">
          {user ? (
            <>
              <Link
                href="/profile"
                className="hidden h-10 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-white/40 sm:inline-flex"
              >
                {user.fullName.split(" ")[0] || "Profile"}
              </Link>
              {user.role.toLowerCase() === "admin" ? (
                <Link
                  href="/admin"
                  className="hidden h-10 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-white/40 lg:inline-flex"
                >
                  Admin
                </Link>
              ) : null}
              <button
                className="hidden h-10 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-white/40 lg:inline-flex"
                onClick={() => {
                  logout();
                  window.location.assign("/auth/login");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="hidden h-10 items-center justify-center rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-white/40 sm:inline-flex"
            >
              Sign in
            </Link>
          )}
          <Link
            href="/book"
            className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--brand)] px-4 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
          >
            Request booking
          </Link>
        </div>
      </div>
    </header>
  );
}
