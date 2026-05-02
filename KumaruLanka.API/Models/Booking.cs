namespace KumaruLanka.API.Models;

public class Booking
{
    public int Id { get; set; }
    public string BookingRef { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public DateTime TravelDate { get; set; }
    public int NumberOfPax { get; set; }
    public string Message { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public string? StripePaymentId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int? TourId { get; set; }
    public Tour? Tour { get; set; }
    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }
    public int? DriverId { get; set; }
    public Driver? Driver { get; set; }

    public int? HireDays { get; set; }
    public string? PickupLocation { get; set; }
    public string? Extras { get; set; }
}
