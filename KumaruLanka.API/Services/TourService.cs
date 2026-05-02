// ============================================================
// Services/ITourService.cs + TourService.cs
// ============================================================
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace KumaruLanka.API.Services;

public interface ITourService
{
    Task<List<TourDto>> GetAllAsync(string? category, string? search);
    Task<TourDto?>      GetByIdAsync(int id);
    Task<TourDto>       CreateAsync(CreateTourDto dto, string? imageUrl);
    Task<bool>          UpdateAsync(int id, CreateTourDto dto, string? imageUrl);
    Task<bool>          DeleteAsync(int id);
}

public class TourService : ITourService
{
    private readonly AppDbContext _db;
    public TourService(AppDbContext db) => _db = db;

    public async Task<List<TourDto>> GetAllAsync(string? category, string? search)
    {
        var q = _db.Tours.Where(t => t.IsActive);
        if (!string.IsNullOrEmpty(category) && category != "all")
            q = q.Where(t => t.Category == category);
        if (!string.IsNullOrEmpty(search))
            q = q.Where(t => t.Title.Contains(search) || t.Description.Contains(search));
        return await q.OrderBy(t => t.Id).Select(t => MapToDto(t)).ToListAsync();
    }

    public async Task<TourDto?> GetByIdAsync(int id)
    {
        var t = await _db.Tours.FirstOrDefaultAsync(x => x.Id == id && x.IsActive);
        return t is null ? null : MapToDto(t);
    }

    public async Task<TourDto> CreateAsync(CreateTourDto dto, string? imageUrl)
    {
        var tour = new Tour
        {
            Title         = dto.Title,
            Category      = dto.Category,
            Duration      = dto.Duration,
            PaxRange      = dto.PaxRange,
            Accommodation = dto.Accommodation,
            Price         = dto.Price,
            Description   = dto.Description,
            ImageUrl      = imageUrl ?? string.Empty,
            Tags          = JsonSerializer.Serialize(dto.Tags),
            Highlights    = JsonSerializer.Serialize(dto.Highlights),
            Includes      = JsonSerializer.Serialize(dto.Includes)
        };
        _db.Tours.Add(tour);
        await _db.SaveChangesAsync();
        return MapToDto(tour);
    }

    public async Task<bool> UpdateAsync(int id, CreateTourDto dto, string? imageUrl)
    {
        var tour = await _db.Tours.FindAsync(id);
        if (tour is null) return false;
        tour.Title         = dto.Title;
        tour.Category      = dto.Category;
        tour.Duration      = dto.Duration;
        tour.PaxRange      = dto.PaxRange;
        tour.Accommodation = dto.Accommodation;
        tour.Price         = dto.Price;
        tour.Description   = dto.Description;
        tour.Tags          = JsonSerializer.Serialize(dto.Tags);
        tour.Highlights    = JsonSerializer.Serialize(dto.Highlights);
        tour.Includes      = JsonSerializer.Serialize(dto.Includes);
        if (imageUrl is not null) tour.ImageUrl = imageUrl;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var tour = await _db.Tours.FindAsync(id);
        if (tour is null) return false;
        tour.IsActive = false; // soft delete
        await _db.SaveChangesAsync();
        return true;
    }

    private static TourDto MapToDto(Tour t) => new()
    {
        Id            = t.Id,
        Title         = t.Title,
        Category      = t.Category,
        Duration      = t.Duration,
        PaxRange      = t.PaxRange,
        Accommodation = t.Accommodation,
        Price         = t.Price,
        Rating        = t.Rating,
        ReviewCount   = t.ReviewCount,
        ImageUrl      = t.ImageUrl,
        Description   = t.Description,
        Tags          = JsonSerializer.Deserialize<List<string>>(t.Tags)      ?? new(),
        Highlights    = JsonSerializer.Deserialize<List<string>>(t.Highlights) ?? new(),
        Includes      = JsonSerializer.Deserialize<List<string>>(t.Includes)   ?? new()
    };
}
