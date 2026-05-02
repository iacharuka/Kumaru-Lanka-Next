namespace KumaruLanka.API.Models;

public class Tour
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Duration { get; set; } = string.Empty;
    public string PaxRange { get; set; } = string.Empty;
    public string Accommodation { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string Tags { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Highlights { get; set; } = string.Empty;
    public string Includes { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
