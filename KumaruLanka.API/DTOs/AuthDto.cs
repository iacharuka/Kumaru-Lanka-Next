
// ============================================================
// DTOs/AuthDto.cs
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace KumaruLanka.API.DTOs;

public class LoginDto
{
    [Required, EmailAddress] public string Email    { get; set; } = string.Empty;
    [Required] public string Password { get; set; } = string.Empty;
}

public class RegisterDto
{
    [Required] public string FirstName { get; set; } = string.Empty;
    [Required] public string LastName  { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    [Required, MinLength(8)] public string Password { get; set; } = string.Empty;
    public bool SubscribeNewsletter { get; set; }
}

public class ForgotPasswordDto
{
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDto
{
    [Required] public string Token { get; set; } = string.Empty;
    [Required, MinLength(8)] public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token     { get; set; } = string.Empty;
    public string FullName  { get; set; } = string.Empty;
    public string Email     { get; set; } = string.Empty;
    public string Role      { get; set; } = string.Empty;
    public DateTime Expiry  { get; set; }
}

public class MessageResponseDto
{
    public string Message { get; set; } = string.Empty;
}