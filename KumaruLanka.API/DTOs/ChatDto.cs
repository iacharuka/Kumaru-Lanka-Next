// ============================================================
// DTOs/ChatDto.cs
// ============================================================
using System.ComponentModel.DataAnnotations;

namespace KumaruLanka.API.DTOs;

public class ChatMessageDto
{
    public string Role    { get; set; } = string.Empty; // user|assistant
    public string Content { get; set; } = string.Empty;
}

public class ChatRequestDto
{
    [Required, MinLength(1), MaxLength(500)]
    public string Message { get; set; } = string.Empty;
    public List<ChatMessageDto> History { get; set; } = new();
}

public class ChatResponseDto
{
    public string Reply { get; set; } = string.Empty;
}