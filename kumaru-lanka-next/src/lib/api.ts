import { getToken } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text().catch(() => "");
  if (!text) return res.statusText || "Request failed";
  try {
    const json = JSON.parse(text) as { message?: string };
    return json.message || res.statusText || "Request failed";
  } catch {
    return text;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new ApiError(await readErrorMessage(res), res.status);
  }

  if (res.status === 204) return null as T;
  return (await res.json()) as T;
}

// ---- Types (matching backend DTOs) ----
export type Tour = {
  id: number;
  title: string;
  category: string;
  duration: string;
  paxRange: string;
  accommodation: string;
  price: number;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  tags: string[];
  description: string;
  highlights: string[];
  includes: string[];
};

export type Destination = {
  id: number;
  name: string;
  subtitle: string;
  region: string;
  badge?: string | null;
  imageUrl: string;
  description: string;
  bestTime: string;
  distance: string;
  type: string;
};

export type PriceBreakdown = {
  vehicleName: string;
  pricePerDay: number;
  days: number;
  baseTotal: number;
  extrasTotal: number;
  subtotal: number;
  tax: number;
  total: number;
  extrasBreakdown: Record<string, number>;
};

export type BookingCreate = {
  type: "tour" | "vehicle" | "transfer";
  fullName: string;
  email: string;
  phone?: string;
  country?: string;
  travelDate: string; // ISO date
  numberOfPax: number;
  message?: string;
  tourId?: number | null;
  vehicleId?: number | null;
  hireDays?: number | null;
  pickupLocation?: string | null;
  extras?: string[];
};

export type BookingResponse = {
  id: number;
  bookingRef: string;
  status: string;
  totalAmount: number;
  isPaid: boolean;
  message: string;
};

export type AuthResponse = {
  token: string;
  fullName: string;
  email: string;
  role: string;
  expiry: string;
};

export type Review = {
  id: number;
  name: string;
  country: string;
  flag: string;
  avatar: string;
  avatarColor: string;
  rating: number;
  text: string;
  tourTitle: string;
  reviewDate: string;
  isApproved: boolean;
  createdAt: string;
};

export type ItineraryStop = {
  id: string;
  day: number;
  order: number;
  title: string;
  region?: string;
  category?: string;
  notes?: string;
  driveHours?: number;
};

export type ItinerarySave = {
  tripName: string;
  days: number;
  travelers: number;
  pace: "relaxed" | "balanced" | "packed";
  stops: ItineraryStop[];
};

export type Itinerary = ItinerarySave & {
  id: number;
  ownerName: string;
  ownerEmail: string;
  createdAt: string;
  updatedAt: string;
};

// ---- API modules ----
export const ToursApi = {
  list: (params?: { category?: string; search?: string }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.search) qs.set("search", params.search);
    return apiFetch<Tour[]>(`/tours${qs.toString() ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiFetch<Tour>(`/tours/${id}`),
};

export const DestinationsApi = {
  list: (params?: { type?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    return apiFetch<Destination[]>(`/destinations${qs.toString() ? `?${qs}` : ""}`);
  },
  get: (id: number) => apiFetch<Destination>(`/destinations/${id}`),
};

export const VehiclesApi = {
  list: () => apiFetch<Vehicle[]>(`/vehicles`),
  price: (dto: { vehicleSlug: string; days: number; selectedExtras: string[] }) =>
    apiFetch<PriceBreakdown>(`/vehicles/calculate-price`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
};

export const BookingsApi = {
  create: (dto: BookingCreate) =>
    apiFetch<BookingResponse>(`/bookings`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  getByRef: (ref: string) => apiFetch<BookingResponse>(`/bookings/${ref}`),
  mine: () =>
    apiFetch<Booking[]>(`/bookings/mine`, {
      auth: true,
    }),
};

export const AuthApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>(`/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (dto: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    subscribeNewsletter?: boolean;
  }) =>
    apiFetch<{ message: string }>(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(dto),
    }),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string }>(`/auth/forgot-password`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, password: string) =>
    apiFetch<{ message: string }>(`/auth/reset-password`, {
      method: "POST",
      body: JSON.stringify({ token, password }),
    }),
};

export const ReviewsApi = {
  list: () => apiFetch<Review[]>(`/reviews`),
};

export const ItinerariesApi = {
  save: (dto: ItinerarySave) =>
    apiFetch<Itinerary>(`/itineraries`, {
      method: "POST",
      body: JSON.stringify(dto),
      auth: true,
    }),
  mine: () =>
    apiFetch<Itinerary[]>(`/itineraries/mine`, {
      auth: true,
    }),
};

export type Vehicle = {
  id: number;
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  pricePerDay: number;
  passengers: string;
  luggage: string;
  hasAC: boolean;
  features: string;
  isActive: boolean;
};

export type Booking = {
  id: number;
  bookingRef: string;
  type: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  travelDate: string;
  numberOfPax: number;
  message: string;
  status: string;
  totalAmount: number;
  isPaid: boolean;
  createdAt: string;
};

// ---- Admin APIs ----
export const AdminToursApi = {
  create: (dto: {
    title: string;
    category: string;
    duration: string;
    paxRange: string;
    accommodation: string;
    price: number;
    description: string;
    tags: string[];
    highlights: string[];
    includes: string[];
  }, image?: File) => {
    const formData = new FormData();
    formData.append("title", dto.title);
    formData.append("category", dto.category);
    formData.append("duration", dto.duration);
    formData.append("paxRange", dto.paxRange);
    formData.append("accommodation", dto.accommodation);
    formData.append("price", dto.price.toString());
    formData.append("description", dto.description);
    formData.append("tags", JSON.stringify(dto.tags));
    formData.append("highlights", JSON.stringify(dto.highlights));
    formData.append("includes", JSON.stringify(dto.includes));
    if (image) formData.append("image", image);
    return apiFetch<Tour>(`/tours`, {
      method: "POST",
      body: formData,
      auth: true,
    });
  },
  update: (id: number, dto: {
    title: string;
    category: string;
    duration: string;
    paxRange: string;
    accommodation: string;
    price: number;
    description: string;
    tags: string[];
    highlights: string[];
    includes: string[];
  }, image?: File) => {
    const formData = new FormData();
    formData.append("title", dto.title);
    formData.append("category", dto.category);
    formData.append("duration", dto.duration);
    formData.append("paxRange", dto.paxRange);
    formData.append("accommodation", dto.accommodation);
    formData.append("price", dto.price.toString());
    formData.append("description", dto.description);
    formData.append("tags", JSON.stringify(dto.tags));
    formData.append("highlights", JSON.stringify(dto.highlights));
    formData.append("includes", JSON.stringify(dto.includes));
    if (image) formData.append("image", image);
    return apiFetch<Tour>(`/tours/${id}`, {
      method: "PUT",
      body: formData,
      auth: true,
    });
  },
  delete: (id: number) =>
    apiFetch<void>(`/tours/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};

export const AdminDestinationsApi = {
  create: (dto: {
    name: string;
    subtitle: string;
    region: string;
    badge?: string;
    imageUrl: string;
    description: string;
    bestTime: string;
    distance: string;
    type: string;
  }) =>
    apiFetch<Destination>(`/destinations`, {
      method: "POST",
      body: JSON.stringify(dto),
      auth: true,
    }),
  update: (
    id: number,
    dto: {
      name: string;
      subtitle: string;
      region: string;
      badge?: string;
      imageUrl: string;
      description: string;
      bestTime: string;
      distance: string;
      type: string;
    }
  ) =>
    apiFetch<Destination>(`/destinations/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      auth: true,
    }),
  delete: (id: number) =>
    apiFetch<void>(`/destinations/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};

export const AdminVehiclesApi = {
  create: (dto: {
    slug: string;
    name: string;
    icon: string;
    tagline: string;
    description: string;
    pricePerDay: number;
    passengers: string;
    luggage: string;
    hasAC: boolean;
    features: string;
  }) =>
    apiFetch<Vehicle>(`/vehicles`, {
      method: "POST",
      body: JSON.stringify(dto),
      auth: true,
    }),
  update: (
    id: number,
    dto: {
      slug: string;
      name: string;
      icon: string;
      tagline: string;
      description: string;
      pricePerDay: number;
      passengers: string;
      luggage: string;
      hasAC: boolean;
      features: string;
    }
  ) =>
    apiFetch<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
      auth: true,
    }),
  delete: (id: number) =>
    apiFetch<void>(`/vehicles/${id}`, {
      method: "DELETE",
      auth: true,
    }),
};

export const AdminBookingsApi = {
  list: (status?: string) => {
    const qs = new URLSearchParams();
    if (status) qs.set("status", status);
    return apiFetch<Booking[]>(`/bookings${qs.toString() ? `?${qs}` : ""}`, {
      auth: true,
    });
  },
  updateStatus: (id: number, status: string) =>
    apiFetch<void>(`/bookings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      auth: true,
    }),
  updatePayment: (id: number, isPaid: boolean) =>
    apiFetch<void>(`/bookings/${id}/payment`, {
      method: "PATCH",
      body: JSON.stringify({ isPaid }),
      auth: true,
    }),
};

export const AdminItinerariesApi = {
  list: () =>
    apiFetch<Itinerary[]>(`/itineraries`, {
      auth: true,
    }),
};
