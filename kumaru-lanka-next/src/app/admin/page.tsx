"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { getUser } from "@/lib/auth";
import { ToursManagement } from "@/components/admin/ToursManagement";
import { DestinationsManagement } from "@/components/admin/DestinationsManagement";
import { VehiclesManagement } from "@/components/admin/VehiclesManagement";
import { BookingsManagement } from "@/components/admin/BookingsManagement";
import { ItinerariesManagement } from "@/components/admin/ItinerariesManagement";

type Tab = "overview" | "tours" | "destinations" | "vehicles" | "bookings" | "itineraries" | "reviews";

function TabBtn({
  tab,
  active,
  onClick,
  children,
}: {
  tab: Tab;
  active: Tab;
  onClick: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const isActive = tab === active;
  return (
    <button
      onClick={() => onClick(tab)}
      className={`inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-semibold border transition ${
        isActive
          ? "bg-[var(--brand)] text-white border-[var(--brand)]"
          : "bg-[var(--surface)] border-[var(--border)] hover:border-[var(--brand)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const u = getUser();
    setIsAdmin((u?.role || "").toLowerCase() === "admin");
    setIsHydrated(true);
  }, []);

  return (
    <div className="container py-10 md:py-14">
      <Badge tone="brand">CMS / Admin</Badge>
      <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-[var(--green-800)] dark:text-white">
        Admin dashboard
      </h1>
      <p className="mt-2 text-sm md:text-base text-[var(--muted)]">
        Manage tours, destinations, vehicles, and track bookings.
      </p>

      {isHydrated && !isAdmin ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          You're not logged in as an admin yet. Sign in with an admin account to
          enable protected CRUD actions.
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-2">
        <TabBtn tab="overview" active={tab} onClick={setTab}>
          Overview
        </TabBtn>
        <TabBtn tab="tours" active={tab} onClick={setTab}>
          Tours
        </TabBtn>
        <TabBtn tab="destinations" active={tab} onClick={setTab}>
          Destinations
        </TabBtn>
        <TabBtn tab="vehicles" active={tab} onClick={setTab}>
          Vehicles
        </TabBtn>
        <TabBtn tab="bookings" active={tab} onClick={setTab}>
          Bookings
        </TabBtn>
        <TabBtn tab="itineraries" active={tab} onClick={setTab}>
          Itineraries
        </TabBtn>
        <TabBtn tab="reviews" active={tab} onClick={setTab}>
          Reviews
        </TabBtn>
      </div>

      <div className="mt-6 surface p-6">
        {tab === "overview" ? (
          <div className="grid gap-3">
            <div className="text-sm font-extrabold">Dashboard Features</div>
            <ul className="text-sm text-[var(--muted)] space-y-2">
              <li>✅ Tours - Create, edit, delete with image upload</li>
              <li>✅ Destinations - Full CRUD management</li>
              <li>✅ Vehicles - Manage fleet with pricing</li>
              <li>✅ Bookings - View and update booking status</li>
              <li>✅ Itineraries - View saved customer trip plans</li>
              <li>⏳ Reviews - Moderation coming soon</li>
            </ul>
          </div>
        ) : null}

        {tab === "tours" && isAdmin ? (
          <ToursManagement />
        ) : tab === "tours" ? (
          <div className="text-center py-8 text-[var(--muted)]">Admin access required</div>
        ) : null}

        {tab === "destinations" && isAdmin ? (
          <DestinationsManagement />
        ) : tab === "destinations" ? (
          <div className="text-center py-8 text-[var(--muted)]">Admin access required</div>
        ) : null}

        {tab === "vehicles" && isAdmin ? (
          <VehiclesManagement />
        ) : tab === "vehicles" ? (
          <div className="text-center py-8 text-[var(--muted)]">Admin access required</div>
        ) : null}

        {tab === "bookings" && isAdmin ? (
          <BookingsManagement />
        ) : tab === "bookings" ? (
          <div className="text-center py-8 text-[var(--muted)]">Admin access required</div>
        ) : null}

        {tab === "itineraries" && isAdmin ? (
          <ItinerariesManagement />
        ) : tab === "itineraries" ? (
          <div className="text-center py-8 text-[var(--muted)]">Admin access required</div>
        ) : null}

        {tab === "reviews" ? (
          <div>
            <div className="text-sm font-extrabold">Review moderation</div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              Coming soon: approve/hide reviews and moderate traveler submissions.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
