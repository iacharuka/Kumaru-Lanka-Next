import Link from "next/link";
import Image from "next/image";
import { TourCard } from "@/components/cards/TourCard";
import { DestinationCard } from "@/components/cards/DestinationCard";
import { ServerDestinations, ServerTours } from "@/lib/serverApi";

export default async function Home() {
  const [tours, destinations] = await Promise.all([
    ServerTours.list(),
    ServerDestinations.list(),
  ]);
  const featuredTours = tours.slice(0, 3);
  const featuredDestinations = destinations.slice(0, 3);

  return (
    <div>
      <section className="relative min-h-[calc(100vh-72px)] overflow-hidden text-white">
        <Image
          src="/images/kumaru-lanka-hero.png"
          alt="Sri Lanka coast, tea hills, train, and Sigiriya landscape"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,32,16,.88)_0%,rgba(13,32,16,.66)_46%,rgba(13,32,16,.18)_100%)]" />
        <div className="relative container flex min-h-[calc(100vh-72px)] flex-col justify-center py-14 md:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold tracking-wide backdrop-blur">
              Private tours, trusted drivers, pay after meeting
            </div>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-6xl">
              Kumaru Lanka
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
              Plan your Sri Lanka trip with local support: tours, private
              vehicles, airport transfers, itinerary help, and booking status
              updates in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]"
              >
                Request booking
              </Link>
              <Link
                href="/itinerary"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 font-semibold text-white backdrop-blur hover:border-white/50"
              >
                Build itinerary
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["No upfront payment", "Pay safely after meeting your guide"],
              ["Admin confirmed", "Your request is reviewed before travel"],
              ["Live profile status", "Track booking and payment progress"],
              ["Local route help", "Tours, transfers, and vehicles together"],
            ].map(([title, copy]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/15 bg-black/20 p-4 backdrop-blur"
              >
                <div className="font-extrabold">{title}</div>
                <div className="mt-1 text-xs leading-5 text-white/70">{copy}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Start here
            </div>
            <h2 className="mt-2 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Choose how you want to travel
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)] md:text-base">
              Keep it simple: request a booking, plan an itinerary, or browse
              tours and destinations before you decide.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--brand)] bg-[var(--brand-soft)] p-5 text-[var(--green-800)]">
            <div className="text-sm font-extrabold">Trust-first booking</div>
            <p className="mt-1 text-sm leading-6">
              Admin confirms availability and quote first. You meet the driver
              or guide, then pay safely after meeting.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["/book", "Request booking", "Tours, vehicles, or transfers with profile tracking."],
            ["/tours", "Explore tours", "Cultural, wildlife, coast, highlands, and custom trips."],
            ["/vehicles", "Hire vehicle", "Private driver support for flexible travel days."],
            ["/booking-status", "Check status", "Use your reference to see progress anytime."],
          ].map(([href, title, copy]) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-2)] p-5 transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
            >
              <div className="text-lg font-extrabold">{title}</div>
              <div className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {copy}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Popular plans
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Featured tours
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--brand)] hover:underline"
            href="/tours"
          >
            View all tours
          </Link>
        </div>

        {featuredTours.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Tours are not available right now. Please try again in a moment.
          </div>
        )}
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
              Where travellers go
            </div>
            <h2 className="mt-1 text-2xl font-extrabold text-[var(--green-800)] dark:text-white md:text-3xl">
              Popular destinations
            </h2>
          </div>
          <Link
            className="text-sm font-semibold text-[var(--brand)] hover:underline"
            href="/destinations"
          >
            View all destinations
          </Link>
        </div>

        {featuredDestinations.length ? (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredDestinations.map((dest) => (
              <DestinationCard key={dest.id} dest={dest} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
            Destinations are not available right now. Please try again in a moment.
          </div>
        )}
      </section>

      <section className="container pb-12 md:pb-16">
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--green-800)] text-white">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="p-6 md:p-10">
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--brand)]">
                Ready when you are
              </div>
              <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                Send your request, meet first, pay after.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
                Your booking gets a reference, appears in your profile, and can
                be tracked from confirmation to payment and completion.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/book"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--brand)] px-6 font-semibold text-white hover:bg-[var(--brand-dark)]"
                >
                  Request booking
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 px-6 font-semibold text-white hover:border-white/50"
                >
                  Create profile
                </Link>
              </div>
            </div>
            <Image
              src="https://images.unsplash.com/photo-1566296314736-6eaea1755728?w=900&q=85"
              alt="Sigiriya rock fortress in Sri Lanka"
              width={900}
              height={720}
              sizes="(min-width: 1024px) 420px, 100vw"
              className="h-72 w-full object-cover lg:h-full"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
