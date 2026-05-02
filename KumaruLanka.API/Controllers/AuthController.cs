// ============================================================
// Controllers/AuthController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    // POST /api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _auth.LoginAsync(dto);
        return result is null
            ? Unauthorized(new { message = "Invalid email or password" })
            : Ok(result);
    }

    // POST /api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _auth.RegisterAsync(dto);
        if (result.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            return Conflict(new { message = result.Message });

        return Ok(new { message = result.Message });
    }

    // POST /api/auth/forgot-password
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
    {
        var baseUrl = $"{Request.Scheme}://{Request.Host}";
        var resetLinkBase = $"{baseUrl}/pages/reset-password.html";

        var result = await _auth.ForgotPasswordAsync(dto, resetLinkBase);
        return Ok(new { message = result.Message });
    }

    // POST /api/auth/reset-password
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var result = await _auth.ResetPasswordAsync(dto);
        return result is null
            ? BadRequest(new { message = "Invalid or expired reset token" })
            : Ok(new { message = result.Message });
    }
}
