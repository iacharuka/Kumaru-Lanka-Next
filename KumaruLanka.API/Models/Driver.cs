namespace KumaruLanka.API.Models;

public class Driver
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string LicenseNo { get; set; } = string.Empty;
    public string Languages { get; set; } = string.Empty;
    public double Rating { get; set; } = 5.0;
    public bool IsAvailable { get; set; } = true;
    public int? VehicleId { get; set; }
    public Vehicle? Vehicle { get; set; }

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
