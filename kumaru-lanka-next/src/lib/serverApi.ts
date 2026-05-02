import type { Destination, Review, Tour, Vehicle } from "@/lib/api";

const API_BASE =
  process.env.KL_API_BASE?.replace(/\/$/, "") || "http://localhost:5080/api";

export async function serverFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `API request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const ServerTours = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    return serverFetch<Tour[]>(`/tours${qs.toString() ? `?${qs}` : ""}`).catch(
      () => []
    );
  },
  get: (id: number) =>
    serverFetch<Tour>(`/tours/${id}`).catch(() => null as unknown as Tour),
};

export const ServerDestinations = {
  list: (params?: { type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    return serverFetch<Destination[]>(
      `/destinations${qs.toString() ? `?${qs}` : ""}`
    ).catch(() => []);
  },
  get: (id: number) =>
    serverFetch<Destination>(`/destinations/${id}`).catch(
      () => null as unknown as Destination
    ),
};

export const ServerReviews = {
  list: () => serverFetch<Review[]>(`/reviews`).catch(() => []),
};

export const ServerVehicles = {
  list: () => serverFetch<Vehicle[]>(`/vehicles`).catch(() => []),
};
