
// ============================================================
// DTOs/TourDto.cs
// ============================================================
namespace KumaruLanka.API.DTOs;

public class TourDto
{
    public int      Id            { get; set; }
    public string   Title         { get; set; } = string.Empty;
    public string   Category      { get; set; } = string.Empty;
    public string   Duration      { get; set; } = string.Empty;
    public string   PaxRange      { get; set; } = string.Empty;
    public string   Accommodation { get; set; } = string.Empty;
    public decimal  Price         { get; set; }
    public double   Rating        { get; set; }
    public int      ReviewCount   { get; set; }
    public string   ImageUrl      { get; set; } = string.Empty;
    public List<string> Tags      { get; set; } = new();
    public string   Description   { get; set; } = string.Empty;
    public List<string> Highlights { get; set; } = new();
    public List<string> Includes  { get; set; } = new();
}

public class CreateTourDto
{
    public string   Title         { get; set; } = string.Empty;
    public string   Category      { get; set; } = string.Empty;
    public string   Duration      { get; set; } = string.Empty;
    public string   PaxRange      { get; set; } = string.Empty;
    public string   Accommodation { get; set; } = string.Empty;
    public decimal  Price         { get; set; }
    public string   Description   { get; set; } = string.Empty;
    public List<string> Tags      { get; set; } = new();
    public List<string> Highlights { get; set; } = new();
    public List<string> Includes  { get; set; } = new();
    public IFormFile? Image       { get; set; }
}
