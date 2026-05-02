
// ============================================================
// DTOs/VehicleDto.cs
// ============================================================
namespace KumaruLanka.API.DTOs;

public class PriceCalculatorDto
{
    public string       VehicleSlug    { get; set; } = string.Empty;
    public int          Days           { get; set; } = 1;
    public List<string> SelectedExtras { get; set; } = new();
}

public class PriceBreakdownDto
{
    public string  VehicleName   { get; set; } = string.Empty;
    public decimal PricePerDay   { get; set; }
    public int     Days          { get; set; }
    public decimal BaseTotal     { get; set; }
    public decimal ExtrasTotal   { get; set; }
    public decimal Subtotal      { get; set; }
    public decimal Tax           { get; set; }
    public decimal Total         { get; set; }
    public Dictionary<string, decimal> ExtrasBreakdown { get; set; } = new();
}

public class CreateVehicleDto
{
    public string Slug { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal PricePerDay { get; set; }
    public string Passengers { get; set; } = string.Empty;
    public string Luggage { get; set; } = string.Empty;
    public bool HasAC { get; set; }
    public string Features { get; set; } = string.Empty;
}
