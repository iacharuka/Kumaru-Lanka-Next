using System.Security.Claims;
using System.Text.Json;
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Services;

public interface IItineraryService
{
    Task<ItineraryDto> SaveAsync(SaveItineraryDto dto, ClaimsPrincipal user);
    Task<List<ItineraryDto>> GetMineAsync(ClaimsPrincipal user);
    Task<List<ItineraryDto>> GetAllAsync();
}

public class ItineraryService : IItineraryService
{
    private readonly AppDbContext _db;

    public ItineraryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ItineraryDto> SaveAsync(SaveItineraryDto dto, ClaimsPrincipal user)
    {
        var userId = GetUserId(user);
        var email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty;
        var dbUser = userId.HasValue ? await _db.Users.FindAsync(userId.Value) : null;

        var itinerary = new Itinerary
        {
            TripName = dto.TripName.Trim(),
            Days = dto.Days,
            Travelers = dto.Travelers,
            Pace = dto.Pace.Trim().ToLowerInvariant(),
            StopsJson = JsonSerializer.Serialize(dto.Stops),
            OwnerName = dbUser?.FullName ?? email,
            OwnerEmail = dbUser?.Email ?? email,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Itineraries.Add(itinerary);
        await _db.SaveChangesAsync();

        return ToDto(itinerary);
    }

    public async Task<List<ItineraryDto>> GetMineAsync(ClaimsPrincipal user)
    {
        var userId = GetUserId(user);
        var email = user.FindFirstValue(ClaimTypes.Email) ?? string.Empty;

        return await _db.Itineraries
            .Where(i => (userId.HasValue && i.UserId == userId.Value) || i.OwnerEmail == email)
            .OrderByDescending(i => i.UpdatedAt)
            .Select(i => ToDto(i))
            .ToListAsync();
    }

    public async Task<List<ItineraryDto>> GetAllAsync() =>
        await _db.Itineraries
            .OrderByDescending(i => i.UpdatedAt)
            .Select(i => ToDto(i))
            .ToListAsync();

    private static int? GetUserId(ClaimsPrincipal user)
    {
        var value = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var id) ? id : null;
    }

    private static ItineraryDto ToDto(Itinerary itinerary) => new()
    {
        Id = itinerary.Id,
        TripName = itinerary.TripName,
        Days = itinerary.Days,
        Travelers = itinerary.Travelers,
        Pace = itinerary.Pace,
        Stops = ItineraryDto.ParseStops(itinerary.StopsJson),
        OwnerName = itinerary.OwnerName,
        OwnerEmail = itinerary.OwnerEmail,
        CreatedAt = itinerary.CreatedAt,
        UpdatedAt = itinerary.UpdatedAt
    };
}
