import { Booking } from "@/lib/api";

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  met_customer: "Met customer",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function buildCustomerBookingMessage(booking: Booking) {
  const amountLine =
    booking.totalAmount > 0
      ? `Estimated total: $${booking.totalAmount}`
      : "Estimated total: our team will confirm the final quote.";

  return [
    `Hi ${booking.fullName},`,
    "",
    `Your Kumaru Lanka booking request is received.`,
    `Reference: ${booking.bookingRef}`,
    `Trip type: ${booking.type}`,
    `Travel date: ${formatDate(booking.travelDate)}`,
    `Passengers: ${booking.numberOfPax}`,
    `Status: ${statusLabels[booking.status] || booking.status}`,
    amountLine,
    "",
    "Payment: no online payment is required now. You can pay safely after meeting our driver or guide.",
    "",
    "We will contact you soon to confirm availability, route details, and the final quote.",
    "",
    "Thank you,",
    "Kumaru Lanka",
  ].join("\n");
}

export function buildAdminBookingMessage(booking: Booking) {
  return [
    "New booking follow-up",
    "",
    `Reference: ${booking.bookingRef}`,
    `Customer: ${booking.fullName}`,
    `Email: ${booking.email}`,
    `Phone: ${booking.phone || "Not provided"}`,
    `Country: ${booking.country || "Not provided"}`,
    `Trip type: ${booking.type}`,
    `Travel date: ${formatDate(booking.travelDate)}`,
    `Passengers: ${booking.numberOfPax}`,
    `Status: ${statusLabels[booking.status] || booking.status}`,
    `Payment: ${booking.isPaid ? "Paid" : "Pay after meeting / not paid yet"}`,
    `Estimated total: $${booking.totalAmount}`,
    "",
    `Customer notes: ${booking.message || "No notes provided."}`,
  ].join("\n");
}
