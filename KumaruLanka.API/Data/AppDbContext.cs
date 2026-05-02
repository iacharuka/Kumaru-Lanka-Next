using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Tour> Tours { get; set; }
    public DbSet<Destination> Destinations { get; set; }
    public DbSet<Vehicle> Vehicles { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Driver> Drivers { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<Itinerary> Itineraries { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        mb.Entity<Booking>()
            .HasOne(b => b.Tour)
            .WithMany(t => t.Bookings)
            .HasForeignKey(b => b.TourId)
            .OnDelete(DeleteBehavior.SetNull);

        mb.Entity<Booking>()
            .HasOne(b => b.Vehicle)
            .WithMany(v => v.Bookings)
            .HasForeignKey(b => b.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        mb.Entity<Booking>()
            .HasOne(b => b.Driver)
            .WithMany(d => d.Bookings)
            .HasForeignKey(b => b.DriverId)
            .OnDelete(DeleteBehavior.SetNull);

        mb.Entity<Driver>()
            .HasOne(d => d.Vehicle)
            .WithMany(v => v.Drivers)
            .HasForeignKey(d => d.VehicleId)
            .OnDelete(DeleteBehavior.SetNull);

        mb.Entity<Tour>().Property(t => t.Price).HasPrecision(10, 2);
        mb.Entity<Vehicle>().Property(v => v.PricePerDay).HasPrecision(10, 2);
        mb.Entity<Booking>().Property(b => b.TotalAmount).HasPrecision(10, 2);

        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();

        mb.Entity<Itinerary>()
            .HasOne(i => i.User)
            .WithMany()
            .HasForeignKey(i => i.UserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
