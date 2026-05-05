using System.Text;
using System.Text.Json;
using KumaruLanka.API.Data;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Services;

public class WhatsAppService : IWhatsAppService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly ILogger<WhatsAppService> _logger;

    private string TwilioPhoneNumber => _config["WhatsApp:TwilioPhoneNumber"] ?? string.Empty;
    private string TwilioAccountSid => _config["WhatsApp:TwilioAccountSid"] ?? string.Empty;
    private string TwilioAuthToken => _config["WhatsApp:TwilioAuthToken"] ?? string.Empty;
    private bool IsConfigured => !string.IsNullOrEmpty(TwilioAccountSid) && !string.IsNullOrEmpty(TwilioAuthToken);

    public WhatsAppService(IHttpClientFactory httpClientFactory, IConfiguration config, AppDbContext db, ILogger<WhatsAppService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _config = config;
        _db = db;
        _logger = logger;
    }

    public async Task<bool> SendBookingConfirmationAsync(string phoneNumber, string bookingRef, string tourName, DateTime travelDate, int numberOfPax, decimal totalAmount)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("WhatsApp service not configured");
            return false;
        }

        string message = $@"🎉 *Booking Confirmation - Kumaru Lanka*

Booking Reference: {bookingRef}
Package: {tourName}
Travel Date: {travelDate:dd MMM yyyy}
Number of Guests: {numberOfPax}
Total Amount: LKR {totalAmount:N2}

Thank you for booking with us! 🙏

Your trip is confirmed. We'll contact you soon with more details.

Questions? Reply to this message!";

        return await SendMessageAsync(phoneNumber, message);
    }

    public async Task<bool> SendPackageListAsync(string phoneNumber)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("WhatsApp service not configured");
            return false;
        }

        var tours = await _db.Tours.Where(t => t.IsActive).Take(10).ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("🏝️ *Kumaru Lanka Tour Packages*\n");
        sb.AppendLine("Reply with the package number to book:\n");

        int index = 1;
        foreach (var tour in tours)
        {
            sb.AppendLine($"{index}. *{tour.Title}*");
            sb.AppendLine($"   Duration: {tour.Duration}");
            sb.AppendLine($"   Price: LKR {tour.Price:N0}");
            sb.AppendLine($"   Rating: ⭐ {tour.Rating}/5\n");
            index++;
        }

        sb.AppendLine("💬 Reply with:\n- Package number\n- Your name\n- Number of people\n- Preferred travel date");

        return await SendMessageAsync(phoneNumber, sb.ToString());
    }

    public async Task<bool> SendMessageAsync(string phoneNumber, string message)
    {
        if (!IsConfigured)
        {
            _logger.LogWarning("WhatsApp service not configured");
            return false;
        }

        try
        {
            string toWhatsAppNumber = FormatPhoneNumber(phoneNumber);
            string fromWhatsAppNumber = FormatPhoneNumber(TwilioPhoneNumber);

            var client = _httpClientFactory.CreateClient();
            var auth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{TwilioAccountSid}:{TwilioAuthToken}"));
            client.DefaultRequestHeaders.Add("Authorization", $"Basic {auth}");

            var payload = new
            {
                From = fromWhatsAppNumber,
                To = toWhatsAppNumber,
                Body = message
            };

            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var url = $"https://api.twilio.com/2010-04-01/Accounts/{TwilioAccountSid}/Messages.json";
            
            var response = await client.PostAsync(url, content);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation($"WhatsApp message sent to {toWhatsAppNumber}");
                return true;
            }

            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError($"WhatsApp send failed: {response.StatusCode} - {errorContent}");
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending WhatsApp message");
            return false;
        }
    }

    public async Task<WhatsAppBookingRequest?> ParseBookingMessageAsync(string messageBody, string phoneNumber)
    {
        try
        {
            // Simple parsing logic - can be enhanced with AI/NLP later
            var parts = messageBody.Trim().Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries);
            
            if (parts.Length < 3)
                return null;

            // Expected format:
            // 1. Package number or name
            // 2. Your name
            // 3. Number of people
            // 4. Preferred date (optional)

            var tours = await _db.Tours.Where(t => t.IsActive).Take(10).ToListAsync();
            
            int packageNumber = 0;
            int selectedTourId = 0;
            
            if (int.TryParse(parts[0].Trim(), out packageNumber) && packageNumber > 0 && packageNumber <= tours.Count)
            {
                selectedTourId = tours[packageNumber - 1].Id;
            }
            else
            {
                return null; // Invalid package selection
            }

            string name = parts[1].Trim();
            if (!int.TryParse(parts[2].Trim(), out int numberOfPax))
                numberOfPax = 1;

            DateTime travelDate = DateTime.Now.AddDays(7); // Default to 7 days from now
            if (parts.Length > 3)
            {
                if (DateTime.TryParse(parts[3].Trim(), out var parsedDate))
                    travelDate = parsedDate;
            }

            return new WhatsAppBookingRequest
            {
                PhoneNumber = phoneNumber,
                FullName = name,
                TourId = selectedTourId,
                NumberOfPax = numberOfPax,
                TravelDate = travelDate,
                Message = $"Booked via WhatsApp"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing WhatsApp booking message");
            return null;
        }
    }

    private string FormatPhoneNumber(string phoneNumber)
    {
        // Ensure phone number is in E.164 format: +1234567890
        var cleaned = System.Text.RegularExpressions.Regex.Replace(phoneNumber, @"\D", "");
        
        if (!cleaned.StartsWith("1") && cleaned.Length == 10)
            cleaned = "1" + cleaned; // US/Canada
        
        if (!cleaned.StartsWith("94") && cleaned.Length == 9)
            cleaned = "94" + cleaned; // Sri Lanka
        
        return "whatsapp:+" + cleaned;
    }
}
