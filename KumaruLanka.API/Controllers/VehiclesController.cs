// ============================================================
// Controllers/VehiclesController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiclesController : ControllerBase
{
    private readonly IVehicleService _vehicles;
    public VehiclesController(IVehicleService vehicles) => _vehicles = vehicles;

    // GET /api/vehicles
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _vehicles.GetAllAsync());

    // GET /api/vehicles/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var vehicle = await _vehicles.GetByIdAsync(id);
        return vehicle is null ? NotFound() : Ok(vehicle);
    }

    // POST /api/vehicles  [Admin only]
    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateVehicleDto dto)
    {
        var created = await _vehicles.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/vehicles/5  [Admin only]
    [HttpPut("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateVehicleDto dto) =>
        await _vehicles.UpdateAsync(id, dto) ? NoContent() : NotFound();

    // DELETE /api/vehicles/5  [Admin only]
    [HttpDelete("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id) =>
        await _vehicles.DeleteAsync(id) ? NoContent() : NotFound();

    // POST /api/vehicles/calculate-price
    [HttpPost("calculate-price")]
    public async Task<IActionResult> CalculatePrice([FromBody] PriceCalculatorDto dto)
    {
        var result = await _vehicles.CalculatePriceAsync(dto);
        return result is null ? NotFound("Vehicle not found") : Ok(result);
    }
}