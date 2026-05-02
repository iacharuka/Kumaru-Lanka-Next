
// ============================================================
// Controllers/DestinationsController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DestinationsController : ControllerBase
{
    private readonly IDestinationService _destinations;
    public DestinationsController(IDestinationService destinations) => _destinations = destinations;

    // GET /api/destinations?type=heritage
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? type) =>
        Ok(await _destinations.GetAllAsync(type));

    // GET /api/destinations/3
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dest = await _destinations.GetByIdAsync(id);
        return dest is null ? NotFound() : Ok(dest);
    }

    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateDestinationDto dto)
    {
        var created = await _destinations.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromBody] CreateDestinationDto dto) =>
        await _destinations.UpdateAsync(id, dto) ? NoContent() : NotFound();

    [HttpDelete("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id) =>
        await _destinations.DeleteAsync(id) ? NoContent() : NotFound();
}
