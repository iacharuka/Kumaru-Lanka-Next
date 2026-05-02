// ============================================================
// Controllers/ReviewsController.cs
// ============================================================
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviews;
    public ReviewsController(IReviewService reviews) => _reviews = reviews;

    // GET /api/reviews
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _reviews.GetAllAsync());
}
