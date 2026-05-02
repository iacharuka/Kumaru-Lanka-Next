
// ============================================================
// Services/IVehicleService.cs + VehicleService.cs
// ============================================================
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Services;

public interface IVehicleService
{
    Task<List<Vehicle>>      GetAllAsync();
    Task<Vehicle?>           GetByIdAsync(int id);
    Task<Vehicle>            CreateAsync(CreateVehicleDto dto);
    Task<bool>               UpdateAsync(int id, CreateVehicleDto dto);
    Task<bool>               DeleteAsync(int id);
    Task<PriceBreakdownDto?> CalculatePriceAsync(PriceCalculatorDto dto);
}

public class VehicleService : IVehicleService
{
    private readonly AppDbContext _db;

    // Extra prices per vehicle slug
    private static readonly Dictionary<string, Dictionary<string, decimal>> Extras = new()
    {
        ["tuk"] = new() { ["airportPickup"] = 10, ["nightSurcharge"] = 5 },
        ["car"] = new() { ["airportPickup"] = 15, ["nightSurcharge"] = 10, ["childSeat"] = 8 },
        ["van"] = new() { ["airportPickup"] = 20, ["nightSurcharge"] = 15, ["childSeat"] = 8, ["wifi"] = 5 },
        ["bus"] = new() { ["airportPickup"] = 30, ["nightSurcharge"] = 20, ["wifi"] = 5, ["guide"] = 40 }
    };
    private static readonly HashSet<string> DailyExtras = new() { "wifi", "guide" };

    public VehicleService(AppDbContext db) => _db = db;

    public async Task<List<Vehicle>> GetAllAsync() =>
        await _db.Vehicles.Where(v => v.IsActive).OrderBy(v => v.PricePerDay).ToListAsync();

    public async Task<Vehicle?> GetByIdAsync(int id) =>
        await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);

    public async Task<Vehicle> CreateAsync(CreateVehicleDto dto)
    {
        var vehicle = new Vehicle
        {
            Slug = dto.Slug,
            Name = dto.Name,
            Icon = dto.Icon,
            Tagline = dto.Tagline,
            Description = dto.Description,
            PricePerDay = dto.PricePerDay,
            Passengers = dto.Passengers,
            Luggage = dto.Luggage,
            HasAC = dto.HasAC,
            Features = dto.Features,
            IsActive = true
        };
        _db.Vehicles.Add(vehicle);
        await _db.SaveChangesAsync();
        return vehicle;
    }

    public async Task<bool> UpdateAsync(int id, CreateVehicleDto dto)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle is null) return false;

        vehicle.Slug = dto.Slug;
        vehicle.Name = dto.Name;
        vehicle.Icon = dto.Icon;
        vehicle.Tagline = dto.Tagline;
        vehicle.Description = dto.Description;
        vehicle.PricePerDay = dto.PricePerDay;
        vehicle.Passengers = dto.Passengers;
        vehicle.Luggage = dto.Luggage;
        vehicle.HasAC = dto.HasAC;
        vehicle.Features = dto.Features;

        _db.Vehicles.Update(vehicle);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id);
        if (vehicle is null) return false;

        _db.Vehicles.Remove(vehicle);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<PriceBreakdownDto?> CalculatePriceAsync(PriceCalculatorDto dto)
    {
        var vehicle = await _db.Vehicles.FirstOrDefaultAsync(v => v.Slug == dto.VehicleSlug && v.IsActive);
        if (vehicle is null) return null;

        var baseTotal   = vehicle.PricePerDay * dto.Days;
        var extrasBreak = new Dictionary<string, decimal>();
        decimal extrasTotal = 0;

        if (Extras.TryGetValue(dto.VehicleSlug, out var map))
        {
            foreach (var key in dto.SelectedExtras)
            {
                if (!map.TryGetValue(key, out var price)) continue;
                var amount = DailyExtras.Contains(key) ? price * dto.Days : price;
                extrasBreak[key] = amount;
                extrasTotal += amount;
            }
        }

        var subtotal = baseTotal + extrasTotal;
        var tax      = Math.Round(subtotal * 0.10m, 2);

        return new PriceBreakdownDto
        {
            VehicleName    = vehicle.Name,
            PricePerDay    = vehicle.PricePerDay,
            Days           = dto.Days,
            BaseTotal      = baseTotal,
            ExtrasTotal    = extrasTotal,
            ExtrasBreakdown = extrasBreak,
            Subtotal       = subtotal,
            Tax            = tax,
            Total          = subtotal + tax
        };
    }
}
