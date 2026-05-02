using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItinerariesController : ControllerBase
{
    private readonly IItineraryService _itineraries;

    public ItinerariesController(IItineraryService itineraries)
    {
        _itineraries = itineraries;
    }

    [HttpPost, Authorize]
    public async Task<IActionResult> Save([FromBody] SaveItineraryDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        return Ok(await _itineraries.SaveAsync(dto, User));
    }

    [HttpGet("mine"), Authorize]
    public async Task<IActionResult> GetMine() => Ok(await _itineraries.GetMineAsync(User));

    [HttpGet, Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll() => Ok(await _itineraries.GetAllAsync());
}
