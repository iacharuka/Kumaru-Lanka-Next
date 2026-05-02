
// ============================================================
// Services/IBookingService.cs + BookingService.cs
// ============================================================
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace KumaruLanka.API.Services;

public interface IBookingService
{
    Task<BookingResponseDto> CreateAsync(CreateBookingDto dto);
    Task<List<BookingAdminDto>> GetAllAsync(string? status);
    Task<List<BookingAdminDto>> GetMineAsync(ClaimsPrincipal user);
    Task<BookingStatusDto?> GetByRefAsync(string bookingRef);
    Task<bool>               UpdateStatusAsync(int id, string status);
    Task<bool>               UpdatePaymentAsync(int id, bool isPaid);
}

public class BookingService : IBookingService
{
    private static readonly HashSet<string> AllowedStatuses = new(StringComparer.OrdinalIgnoreCase)
    {
        "pending", "confirmed", "met_customer", "completed", "cancelled"
    };

    private readonly AppDbContext  _db;
    private readonly IEmailService _email;
    public BookingService(AppDbContext db, IEmailService email) { _db = db; _email = email; }

    public async Task<BookingResponseDto> CreateAsync(CreateBookingDto dto)
    {
        var booking = new Booking
        {
            BookingRef    = GenerateRef(),
            Type          = dto.Type,
            FullName      = dto.FullName,
            Email         = dto.Email,
            Phone         = dto.Phone,
            Country       = dto.Country,
            TravelDate    = dto.TravelDate,
            NumberOfPax   = dto.NumberOfPax,
            Message       = dto.Message,
            TourId        = dto.TourId,
            VehicleId     = dto.VehicleId,
            HireDays      = dto.HireDays,
            PickupLocation = dto.PickupLocation,
            Extras        = dto.Extras.Any() ? JsonSerializer.Serialize(dto.Extras) : null,
            Status        = "pending"
        };

        // Calculate total for vehicle hire
        if (dto.VehicleId.HasValue && dto.HireDays.HasValue)
        {
            var vehicle = await _db.Vehicles.FindAsync(dto.VehicleId.Value);
            if (vehicle is not null)
                booking.TotalAmount = vehicle.PricePerDay * dto.HireDays.Value;
        }
        else if (dto.TourId.HasValue)
        {
            var tour = await _db.Tours.FindAsync(dto.TourId.Value);
            if (tour is not null)
                booking.TotalAmount = tour.Price * dto.NumberOfPax;
        }

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync();

        // Send confirmation emails (fire and forget)
        _ = Task.Run(() => _email.SendBookingConfirmationAsync(booking));

        return new BookingResponseDto
        {
            Id          = booking.Id,
            BookingRef  = booking.BookingRef,
            Status      = booking.Status,
            TotalAmount = booking.TotalAmount,
            IsPaid      = booking.IsPaid,
            Message     = $"Booking request received! Ref: {booking.BookingRef}. No online payment is required now. We'll contact you within 2 hours."
        };
    }

    public async Task<List<BookingAdminDto>> GetAllAsync(string? status)
    {
        var q = _db.Bookings.AsQueryable();
        if (!string.IsNullOrWhiteSpace(status))
        {
            var normalizedStatus = status.Trim().ToLowerInvariant();
            q = q.Where(b => b.Status.ToLower() == normalizedStatus);
        }
        return await q
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingAdminDto
            {
                Id = b.Id,
                BookingRef = b.BookingRef,
                Type = b.Type,
                FullName = b.FullName,
                Email = b.Email,
                Phone = b.Phone,
                Country = b.Country,
                TravelDate = b.TravelDate,
                NumberOfPax = b.NumberOfPax,
                Message = b.Message,
                Status = b.Status,
                TotalAmount = b.TotalAmount,
                IsPaid = b.IsPaid,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<List<BookingAdminDto>> GetMineAsync(ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email);
        if (string.IsNullOrWhiteSpace(email)) return new();

        var normalizedEmail = email.Trim().ToLowerInvariant();
        return await _db.Bookings
            .Where(b => b.Email.ToLower() == normalizedEmail)
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => new BookingAdminDto
            {
                Id = b.Id,
                BookingRef = b.BookingRef,
                Type = b.Type,
                FullName = b.FullName,
                Email = b.Email,
                Phone = b.Phone,
                Country = b.Country,
                TravelDate = b.TravelDate,
                NumberOfPax = b.NumberOfPax,
                Message = b.Message,
                Status = b.Status,
                TotalAmount = b.TotalAmount,
                IsPaid = b.IsPaid,
                CreatedAt = b.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<BookingStatusDto?> GetByRefAsync(string bookingRef) =>
        await _db.Bookings
            .Where(b => b.BookingRef == bookingRef)
            .Select(b => new BookingStatusDto
            {
                Id = b.Id,
                BookingRef = b.BookingRef,
                Type = b.Type,
                FullName = b.FullName,
                TravelDate = b.TravelDate,
                Status = b.Status,
                TotalAmount = b.TotalAmount,
                IsPaid = b.IsPaid,
                Message = $"Booking {b.BookingRef} is currently {b.Status}."
            })
            .FirstOrDefaultAsync();

    public async Task<bool> UpdateStatusAsync(int id, string status)
    {
        var normalizedStatus = status.Trim().ToLowerInvariant();
        if (!AllowedStatuses.Contains(normalizedStatus)) return false;

        var b = await _db.Bookings.FindAsync(id);
        if (b is null) return false;
        b.Status = normalizedStatus;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UpdatePaymentAsync(int id, bool isPaid)
    {
        var b = await _db.Bookings.FindAsync(id);
        if (b is null) return false;

        b.IsPaid = isPaid;
        await _db.SaveChangesAsync();
        return true;
    }

    private static string GenerateRef() =>
        $"CE-{DateTime.UtcNow:yyyy}-{Random.Shared.Next(1000, 9999)}";
}
