
// ============================================================
// Services/IEmailService.cs + EmailService.cs
// ============================================================
using KumaruLanka.API.Models;
using System.Net;
using System.Net.Mail;

namespace KumaruLanka.API.Services;

public interface IEmailService
{
    Task SendBookingConfirmationAsync(Booking booking);
    Task SendPasswordResetAsync(string toEmail, string resetLink);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    public EmailService(IConfiguration config) => _config = config;

  private async Task SendHtmlEmailAsync(string toEmail, string subject, string html)
  {
    var fromEmail = _config["Email:SenderEmail"];
    var fromName = _config["Email:SenderName"];
    var password = _config["Email:Password"];
    var host = _config["Email:SmtpHost"];
    var port = int.Parse(_config["Email:SmtpPort"] ?? "587");

    using var msg = new MailMessage
    {
      From = new MailAddress(fromEmail ?? string.Empty, fromName),
      Subject = subject,
      Body = html,
      IsBodyHtml = true,
    };
    msg.To.Add(toEmail);

    using var smtp = new SmtpClient(host, port)
    {
      EnableSsl = true,
      Credentials = new NetworkCredential(fromEmail, password),
    };

    await smtp.SendMailAsync(msg);
  }

    public async Task SendBookingConfirmationAsync(Booking booking)
    {
        try
        {
        await SendHtmlEmailAsync(
          booking.Email,
          $"Booking Request Received - {booking.BookingRef} | Kumaru Lanka",
          BuildEmailHtml(booking));
        }
        catch { /* log in production */ }
    }

    public async Task SendPasswordResetAsync(string toEmail, string resetLink)
    {
        try
        {
        await SendHtmlEmailAsync(
          toEmail,
          "Reset your password — Kumaru Lanka",
          BuildPasswordResetHtml(resetLink));
        }
        catch { /* log in production */ }
    }

    private static string BuildEmailHtml(Booking b) => $"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1a4a2e;padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0">Kumaru<span style="color:#e07b39">Lanka</span></h1>
          </div>
          <div style="padding:32px;background:#fff">
            <h2 style="color:#1a2e1a">Booking Request Received</h2>
            <p>Dear {b.FullName},</p>
            <p>Thank you for sending your request to Kumaru Lanka. Your reference number is:</p>
            <div style="background:#fef3eb;padding:16px;border-radius:8px;text-align:center;margin:20px 0">
              <span style="font-size:24px;font-weight:800;color:#e07b39">{b.BookingRef}</span>
            </div>
            <table style="width:100%;border-collapse:collapse">
              <tr><td style="padding:8px;color:#666">Travel Date</td><td style="padding:8px;font-weight:600">{b.TravelDate:dd MMM yyyy}</td></tr>
              <tr><td style="padding:8px;color:#666">Passengers</td><td style="padding:8px;font-weight:600">{b.NumberOfPax}</td></tr>
              <tr><td style="padding:8px;color:#666">Total Amount</td><td style="padding:8px;font-weight:600;color:#e07b39">${b.TotalAmount:F2}</td></tr>
              <tr><td style="padding:8px;color:#666">Status</td><td style="padding:8px;font-weight:600;color:#1a7a3a">Pending Confirmation</td></tr>
              <tr><td style="padding:8px;color:#666">Payment</td><td style="padding:8px;font-weight:600">Pay safely after meeting your driver or guide</td></tr>
            </table>
            <p>No online payment is required now. Our team will contact you within <strong>2 hours</strong> to confirm availability, route details, and the final quote.</p>
            <p style="color:#666">Questions? WhatsApp us at <strong>+94 77 123 4567</strong></p>
          </div>
          <div style="background:#f8f9f4;padding:16px;text-align:center;font-size:12px;color:#999">
            Kumaru Lanka · 42 Galle Road, Colombo 03, Sri Lanka
          </div>
        </div>
        """;

    private static string BuildPasswordResetHtml(string resetLink) => $"""
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1a4a2e;padding:24px;text-align:center">
            <h1 style="color:#fff;margin:0">Kumaru<span style="color:#e07b39">Lanka</span></h1>
          </div>
          <div style="padding:32px;background:#fff">
            <h2 style="color:#1a2e1a">Reset your password</h2>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <p style="text-align:center;margin:24px 0">
              <a href="{resetLink}"
                 style="display:inline-block;background:#e07b39;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">
                Reset Password
              </a>
            </p>
            <p style="color:#666;font-size:13px;line-height:1.5">
              If you didn’t request this, you can safely ignore this email.
              This link will expire soon for your security.
            </p>
            <p style="color:#666;font-size:12px;word-break:break-all">
              Or copy and paste this link into your browser:<br/>
              {resetLink}
            </p>
          </div>
          <div style="background:#f8f9f4;padding:16px;text-align:center;font-size:12px;color:#999">
            Kumaru Lanka · Colombo, Sri Lanka
          </div>
        </div>
        """;
}
