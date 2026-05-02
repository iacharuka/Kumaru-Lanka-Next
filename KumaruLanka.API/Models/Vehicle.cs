namespace KumaruLanka.API.Models;

public class Vehicle
{
    public int Id { get; set; }
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
    public bool IsActive { get; set; } = true;

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
}
