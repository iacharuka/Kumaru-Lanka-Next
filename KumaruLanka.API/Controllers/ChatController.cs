
// ============================================================
// Controllers/ChatController.cs
// ============================================================
using KumaruLanka.API.DTOs;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace KumaruLanka.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IChatService _chat;
    public ChatController(IChatService chat) => _chat = chat;

    // POST /api/chat
    [HttpPost]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var reply = await _chat.GetReplyAsync(dto);
        return Ok(new ChatResponseDto { Reply = reply });
    }
}