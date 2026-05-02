
// ============================================================
// Services/IDestinationService.cs + DestinationService.cs
// ============================================================
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Services;

public interface IDestinationService
{
    Task<List<Destination>> GetAllAsync(string? type);
    Task<Destination?>      GetByIdAsync(int id);
    Task<Destination>       CreateAsync(CreateDestinationDto dto);
    Task<bool>              UpdateAsync(int id, CreateDestinationDto dto);
    Task<bool>              DeleteAsync(int id);
}

public class DestinationService : IDestinationService
{
    private readonly AppDbContext _db;
    public DestinationService(AppDbContext db) => _db = db;

    public async Task<List<Destination>> GetAllAsync(string? type)
    {
        var q = _db.Destinations.Where(d => d.IsActive);
        if (!string.IsNullOrEmpty(type) && type != "all")
            q = q.Where(d => d.Type == type);
        return await q.OrderBy(d => d.Id).ToListAsync();
    }

    public async Task<Destination?> GetByIdAsync(int id) =>
        await _db.Destinations.FirstOrDefaultAsync(d => d.Id == id && d.IsActive);

    public async Task<Destination> CreateAsync(CreateDestinationDto dto)
    {
        var destination = new Destination();
        ApplyDto(destination, dto);

        _db.Destinations.Add(destination);
        await _db.SaveChangesAsync();
        return destination;
    }

    public async Task<bool> UpdateAsync(int id, CreateDestinationDto dto)
    {
        var destination = await _db.Destinations.FindAsync(id);
        if (destination is null) return false;

        ApplyDto(destination, dto);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var destination = await _db.Destinations.FindAsync(id);
        if (destination is null) return false;

        destination.IsActive = false;
        await _db.SaveChangesAsync();
        return true;
    }

    private static void ApplyDto(Destination destination, CreateDestinationDto dto)
    {
        destination.Name = dto.Name;
        destination.Subtitle = dto.Subtitle;
        destination.Region = dto.Region;
        destination.Badge = string.IsNullOrWhiteSpace(dto.Badge) ? null : dto.Badge;
        destination.ImageUrl = dto.ImageUrl;
        destination.Description = dto.Description;
        destination.BestTime = dto.BestTime;
        destination.Distance = dto.Distance;
        destination.Type = dto.Type;
    }
}
