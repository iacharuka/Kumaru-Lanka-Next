using System.ComponentModel.DataAnnotations;
using System.Text.Json;

namespace KumaruLanka.API.DTOs;

public class ItineraryStopDto
{
    public string Id { get; set; } = string.Empty;
    [Range(1, 30)] public int Day { get; set; }
    public int Order { get; set; }
    [Required] public string Title { get; set; } = string.Empty;
    public string? Region { get; set; }
    public string? Category { get; set; }
    public string? Notes { get; set; }
    public double? DriveHours { get; set; }
}

public class SaveItineraryDto
{
    [Required] public string TripName { get; set; } = string.Empty;
    [Range(1, 30)] public int Days { get; set; }
    [Range(1, 30)] public int Travelers { get; set; }
    [Required] public string Pace { get; set; } = "balanced";
    public List<ItineraryStopDto> Stops { get; set; } = new();
}

public class ItineraryDto
{
    public int Id { get; set; }
    public string TripName { get; set; } = string.Empty;
    public int Days { get; set; }
    public int Travelers { get; set; }
    public string Pace { get; set; } = string.Empty;
    public List<ItineraryStopDto> Stops { get; set; } = new();
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public static List<ItineraryStopDto> ParseStops(string stopsJson)
    {
        try
        {
            return JsonSerializer.Deserialize<List<ItineraryStopDto>>(stopsJson) ?? new();
        }
        catch
        {
            return new();
        }
    }
}
