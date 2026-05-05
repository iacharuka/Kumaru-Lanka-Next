using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WhatsAppController : ControllerBase
{
    private readonly IWhatsAppService _whatsApp;
    private readonly IBookingService _bookings;
    private readonly ILogger<WhatsAppController> _logger;

    public WhatsAppController(IWhatsAppService whatsApp, IBookingService bookings, ILogger<WhatsAppController> logger)
    {
        _whatsApp = whatsApp;
        _bookings = bookings;
        _logger = logger;
    }

    // GET /api/whatsapp/packages?phone=+1234567890
    [HttpGet("packages")]
    public async Task<IActionResult> GetPackages([FromQuery] string phone)
    {
        if (string.IsNullOrEmpty(phone))
            return BadRequest("Phone number required");

        var success = await _whatsApp.SendPackageListAsync(phone);
        return success 
            ? Ok(new { message = "Package list sent to WhatsApp" })
            : BadRequest("Failed to send WhatsApp message");
    }

    // POST /api/whatsapp/webhook (Twilio sends incoming messages here)
    [HttpPost("webhook")]
    public async Task<IActionResult> ReceiveMessage([FromForm] WhatsAppIncomingDto dto)
    {
        try
        {
            _logger.LogInformation($"Incoming WhatsApp from {dto.From}: {dto.Body}");

            // Validate webhook is from Twilio (in production, verify Twilio signature)
            if (string.IsNullOrEmpty(dto.From) || string.IsNullOrEmpty(dto.Body))
                return BadRequest("Invalid message data");

            // Check if user is asking for packages or booking
            string messageBody = dto.Body.ToLower().Trim();

            if (messageBody.Contains("package") || messageBody.Contains("tour") || messageBody == "1" || messageBody == "2")
            {
                // Send package list
                await _whatsApp.SendPackageListAsync(dto.From);
                return Ok();
            }

            // Try to parse as a booking request
            var bookingRequest = await _whatsApp.ParseBookingMessageAsync(dto.Body, dto.From);
            
            if (bookingRequest != null)
            {
                // Create booking from WhatsApp request
                var createBookingDto = new CreateBookingDto
                {
                    Type = "tour",
                    FullName = bookingRequest.FullName,
                    Email = $"{System.Text.RegularExpressions.Regex.Replace(bookingRequest.PhoneNumber, @"\D", "")}@whatsapp.kumaru-lanka.com",
                    Phone = bookingRequest.PhoneNumber,
                    Country = "Sri Lanka",
                    TravelDate = bookingRequest.TravelDate,
                    NumberOfPax = bookingRequest.NumberOfPax,
                    Message = "WhatsApp Booking",
                    TourId = bookingRequest.TourId
                };

                var bookingResponse = await _bookings.CreateAsync(createBookingDto);

                // Send confirmation
                var bookingDetails = await _bookings.GetByRefAsync(bookingResponse.BookingRef);
                if (bookingDetails != null)
                {
                    var tourName = "Your Selected Package";
                    // You can fetch the tour name from database if needed
                    
                    await _whatsApp.SendBookingConfirmationAsync(
                        dto.From,
                        bookingResponse.BookingRef,
                        tourName,
                        bookingRequest.TravelDate,
                        bookingRequest.NumberOfPax,
                        bookingResponse.TotalAmount
                    );
                }

                return Ok();
            }

            // Default response
            await _whatsApp.SendPackageListAsync(dto.From);
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing WhatsApp message");
            return StatusCode(500, "Internal server error");
        }
    }

    // POST /api/whatsapp/send-confirmation
    [HttpPost("send-confirmation/{bookingRef}")]
    public async Task<IActionResult> SendConfirmation(string bookingRef)
    {
        try
        {
            var booking = await _bookings.GetByRefAsync(bookingRef.ToUpperInvariant());
            if (booking == null)
                return NotFound("Booking not found");

            var success = await _whatsApp.SendBookingConfirmationAsync(
                booking.Phone,
                booking.BookingRef,
                "Your Selected Package",
                booking.TravelDate,
                1, // You may need to fetch from full booking object
                booking.TotalAmount
            );

            return success
                ? Ok(new { message = "Confirmation sent" })
                : BadRequest("Failed to send message");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending confirmation");
            return StatusCode(500, "Internal server error");
        }
    }
}

public class WhatsAppIncomingDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string MessageSid { get; set; } = string.Empty;
}
