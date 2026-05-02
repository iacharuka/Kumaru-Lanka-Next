
// ============================================================
// Services/IAuthService.cs + AuthService.cs
// ============================================================
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Security.Claims;
using System.Text;
using KumaruLanka.API.Data;
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace KumaruLanka.API.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
    Task<MessageResponseDto> RegisterAsync(RegisterDto dto);
    Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto, string resetLinkBase);
    Task<MessageResponseDto?> ResetPasswordAsync(ResetPasswordDto dto);
}

public class AuthService : IAuthService
{
    private readonly AppDbContext  _db;
    private readonly IConfiguration _config;
    private readonly IEmailService _email;
    public AuthService(AppDbContext db, IConfiguration config, IEmailService email)
    {
        _db = db;
        _config = config;
        _email = email;
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return null;

        user.LastLogin = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var expiry  = DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpiryHours"] ?? "24"));
        var key     = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds   = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims  = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email,          user.Email),
            new Claim(ClaimTypes.Role,           user.Role)
        };
        var token = new JwtSecurityToken(
            _config["Jwt:Issuer"], _config["Jwt:Audience"],
            claims, expires: expiry, signingCredentials: creds);

        return new AuthResponseDto
        {
            Token    = new JwtSecurityTokenHandler().WriteToken(token),
            FullName = user.FullName,
            Email    = user.Email,
            Role     = user.Role,
            Expiry   = expiry
        };
    }

    public async Task<MessageResponseDto> RegisterAsync(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == email);
        if (exists)
            return new MessageResponseDto { Message = "An account with this email already exists." };

        var fullName = $"{dto.FirstName} {dto.LastName}".Trim();
        var user = new User
        {
            FullName = fullName,
            Email = email,
            Phone = string.IsNullOrWhiteSpace(dto.Phone) ? null : dto.Phone.Trim(),
            SubscribeNewsletter = dto.SubscribeNewsletter,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "User",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new MessageResponseDto { Message = "Account created successfully." };
    }

    public async Task<MessageResponseDto> ForgotPasswordAsync(ForgotPasswordDto dto, string resetLinkBase)
    {
        // Always return success to avoid account enumeration
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email && u.IsActive);
        if (user is null)
            return new MessageResponseDto { Message = "If that email exists, a reset link has been sent." };

        var rawToken = GenerateResetToken();
        user.PasswordResetTokenHash = HashToken(rawToken);
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(30);
        await _db.SaveChangesAsync();

        var link = $"{resetLinkBase}?token={Uri.EscapeDataString(rawToken)}";
        await _email.SendPasswordResetAsync(user.Email, link);

        return new MessageResponseDto { Message = "If that email exists, a reset link has been sent." };
    }

    public async Task<MessageResponseDto?> ResetPasswordAsync(ResetPasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Token))
            return null;

        var tokenHash = HashToken(dto.Token);
        var now = DateTime.UtcNow;

        var user = await _db.Users.FirstOrDefaultAsync(u =>
            u.PasswordResetTokenHash == tokenHash &&
            u.PasswordResetTokenExpiresAt != null &&
            u.PasswordResetTokenExpiresAt > now &&
            u.IsActive
        );

        if (user is null)
            return null;

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.PasswordResetTokenHash = null;
        user.PasswordResetTokenExpiresAt = null;

        await _db.SaveChangesAsync();

        return new MessageResponseDto { Message = "Password updated successfully." };
    }

    private static string GenerateResetToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Base64UrlEncode(bytes);
    }

    private static string HashToken(string rawToken)
    {
        var bytes = Encoding.UTF8.GetBytes(rawToken);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }

    private static string Base64UrlEncode(byte[] input)
    {
        return Convert.ToBase64String(input)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }
}
