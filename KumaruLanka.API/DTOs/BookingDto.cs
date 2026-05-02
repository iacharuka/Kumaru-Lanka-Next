// ============================================================
// DTOs/BookingDto.cs
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace KumaruLanka.API.DTOs;

public class CreateBookingDto
{
    [Required] public string Type           { get; set; } = string.Empty; // tour|vehicle|transfer
    [Required] public string FullName       { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    public string  Phone         { get; set; } = string.Empty;
    public string  Country       { get; set; } = string.Empty;
    [Required] public DateTime TravelDate   { get; set; }
    [Range(1, 50)] public int NumberOfPax   { get; set; } = 1;
    public string  Message       { get; set; } = string.Empty;
    public int?    TourId        { get; set; }
    public int?    VehicleId     { get; set; }
    public int?    HireDays      { get; set; }
    public string? PickupLocation { get; set; }
    public List<string> Extras   { get; set; } = new();
}

public class BookingResponseDto
{
    public int      Id          { get; set; }
    public string   BookingRef  { get; set; } = string.Empty;
    public string   Status      { get; set; } = string.Empty;
    public decimal  TotalAmount { get; set; }
    public bool     IsPaid      { get; set; }
    public string   Message     { get; set; } = string.Empty;
}

public class BookingStatusDto
{
    public int Id { get; set; }
    public string BookingRef { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime TravelDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class BookingAdminDto
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
    public string Status { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class UpdateBookingStatusDto
{
    [Required] public string Status { get; set; } = string.Empty;
}

public class UpdateBookingPaymentDto
{
    public bool IsPaid { get; set; }
}
