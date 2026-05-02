
// ============================================================
// Controllers/BookingsController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookings;
    public BookingsController(IBookingService bookings) => _bookings = bookings;

    // POST /api/bookings  (public — tourists submit booking)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBookingDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _bookings.CreateAsync(dto);
        return Ok(result);
    }

    // GET /api/bookings  [Admin only]
    [HttpGet, Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status) =>
        Ok(await _bookings.GetAllAsync(status));

    // GET /api/bookings/mine  [Logged-in user]
    [HttpGet("mine"), Authorize]
    public async Task<IActionResult> GetMine() =>
        Ok(await _bookings.GetMineAsync(User));

    // GET /api/bookings/CE-2025-1234
    [HttpGet("{bookingRef}")]
    public async Task<IActionResult> GetByRef(string bookingRef)
    {
        var normalizedRef = bookingRef.Trim().ToUpperInvariant();
        var booking = await _bookings.GetByRefAsync(normalizedRef);
        return booking is null ? NotFound() : Ok(booking);
    }

    // PATCH /api/bookings/5/status  [Admin only]
    [HttpPatch("{id:int}/status"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateBookingStatusDto dto) =>
        await _bookings.UpdateStatusAsync(id, dto.Status) ? NoContent() : NotFound();

    // PATCH /api/bookings/5/payment  [Admin only]
    [HttpPatch("{id:int}/payment"), Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdatePayment(int id, [FromBody] UpdateBookingPaymentDto dto) =>
        await _bookings.UpdatePaymentAsync(id, dto.IsPaid) ? NoContent() : NotFound();
}
