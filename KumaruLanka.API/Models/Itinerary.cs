namespace KumaruLanka.API.Models;

public class Itinerary
{
    public int Id { get; set; }
    public string TripName { get; set; } = string.Empty;
    public int Days { get; set; }
    public int Travelers { get; set; }
    public string Pace { get; set; } = "balanced";
    public string StopsJson { get; set; } = "[]";
    public string OwnerName { get; set; } = string.Empty;
    public string OwnerEmail { get; set; } = string.Empty;
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
