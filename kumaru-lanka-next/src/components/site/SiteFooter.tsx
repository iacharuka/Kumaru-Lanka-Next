import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[var(--green-900)] text-white/75">
      <div className="container py-12 md:py-14">
        <div className="grid gap-8 border-b border-white/10 pb-10 lg:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Sri Lanka travel, made simple
            </div>
            <div className="mt-2 text-2xl font-extrabold text-white">
              Kumaru<span className="text-[var(--brand)]">Lanka</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
              Request tours, vehicles, transfers, and itinerary help with a
              trust-first flow. We confirm the plan first, you meet your driver
              or guide, then pay safely after meeting.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href="/book"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 text-sm font-semibold text-white hover:bg-[var(--brand-dark)]"
            >
              Request booking
            </Link>
            <Link
              href="/booking-status"
              className="inline-flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-sm font-semibold text-white hover:border-white/40"
            >
              Check status
            </Link>
          </div>
        </div>

        <div className="grid gap-10 py-10 md:grid-cols-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Travel
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:text-[var(--brand)]" href="/tours">
                  Tour packages
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/destinations">
                  Destinations
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/vehicles">
                  Vehicle hire
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/itinerary">
                  Itinerary builder
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Booking
            </div>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link className="hover:text-[var(--brand)]" href="/book">
                  Request booking
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/booking-status">
                  Booking status
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/profile">
                  My profile
                </Link>
              </li>
              <li>
                <Link className="hover:text-[var(--brand)]" href="/admin">
                  Admin
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Trust
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>Admin confirms every request</li>
              <li>No online payment required now</li>
              <li>Pay safely after meeting</li>
              <li>Profile booking history</li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Contact
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>WhatsApp: +94 77 123 4567</li>
              <li>Email: hello@kumarulanka.lk</li>
              <li>Colombo, Sri Lanka</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Kumaru Lanka. All rights reserved.</div>
          <div>Private tours · trusted drivers · pay after meeting</div>
        </div>
      </div>
    </footer>
  );
}
