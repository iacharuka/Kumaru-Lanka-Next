namespace KumaruLanka.API.Services;

public interface IWhatsAppService
{
    Task<bool> SendBookingConfirmationAsync(string phoneNumber, string bookingRef, string tourName, DateTime travelDate, int numberOfPax, decimal totalAmount);
    Task<bool> SendPackageListAsync(string phoneNumber);
    Task<bool> SendMessageAsync(string phoneNumber, string message);
    Task<WhatsAppBookingRequest?> ParseBookingMessageAsync(string messageBody, string phoneNumber);
}

public class WhatsAppBookingRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public int TourId { get; set; }
    public int NumberOfPax { get; set; }
    public DateTime TravelDate { get; set; }
    public string Message { get; set; } = string.Empty;
}
