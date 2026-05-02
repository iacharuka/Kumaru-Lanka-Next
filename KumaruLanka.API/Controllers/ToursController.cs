
// ============================================================
// Controllers/ToursController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ToursController : ControllerBase
{
    private readonly ITourService  _tours;
    private readonly IImageService _images;
    public ToursController(ITourService tours, IImageService images)
    { _tours = tours; _images = images; }

    // GET /api/tours?category=cultural&search=sigiriya
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? category, [FromQuery] string? search) =>
        Ok(await _tours.GetAllAsync(category, search));

    // GET /api/tours/5
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var tour = await _tours.GetByIdAsync(id);
        return tour is null ? NotFound() : Ok(tour);
    }

    // POST /api/tours  [Admin only]
    [HttpPost, Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromForm] CreateTourDto dto)
    {
        string? imageUrl = null;
        if (dto.Image is not null)
            imageUrl = await _images.UploadAsync(dto.Image, "tours");
        var created = await _tours.CreateAsync(dto, imageUrl);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    // PUT /api/tours/5  [Admin only]
    [HttpPut("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Update(int id, [FromForm] CreateTourDto dto)
    {
        string? imageUrl = null;
        if (dto.Image is not null)
            imageUrl = await _images.UploadAsync(dto.Image, "tours");
        return await _tours.UpdateAsync(id, dto, imageUrl) ? NoContent() : NotFound();
    }

    // DELETE /api/tours/5  [Admin only]
    [HttpDelete("{id:int}"), Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id) =>
        await _tours.DeleteAsync(id) ? NoContent() : NotFound();
}
