namespace KumaruLanka.API.DTOs;

public class CreateDestinationDto
{
    public string Name { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string? Badge { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string BestTime { get; set; } = string.Empty;
    public string Distance { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
}
