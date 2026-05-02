
// ============================================================
// Services/IReviewService.cs + ReviewService.cs
// ============================================================
using KumaruLanka.API.Data;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;

namespace KumaruLanka.API.Services;

public interface IReviewService
{
    Task<List<Review>> GetAllAsync();
}

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;
    public ReviewService(AppDbContext db) => _db = db;

    public async Task<List<Review>> GetAllAsync() =>
        await _db.Reviews.Where(r => r.IsApproved).OrderByDescending(r => r.CreatedAt).ToListAsync();
}