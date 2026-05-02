
// ============================================================
// Services/IChatService.cs + ChatService.cs
// ============================================================
using KumaruLanka.API.DTOs;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace KumaruLanka.API.Services;

public interface IChatService
{
    Task<string> GetReplyAsync(ChatRequestDto request);
}

public class ChatService : IChatService
{
    private readonly IHttpClientFactory _factory;
    private readonly IConfiguration     _config;
    private const string SystemPrompt =
        "You are Sena, a friendly and knowledgeable Sri Lanka travel assistant for Kumaru Lanka — " +
        "a premium travel and tourist transport service based in Sri Lanka. " +
        "Help tourists plan trips, recommend destinations, suggest tours, advise on best times to visit, " +
        "and answer questions about hiring vehicles with drivers. Keep responses concise (2-4 sentences max). " +
        "If someone is ready to book, encourage them to click 'Book Now' or contact via WhatsApp.";

    public ChatService(IHttpClientFactory factory, IConfiguration config)
    { _factory = factory; _config = config; }

    public async Task<string> GetReplyAsync(ChatRequestDto request)
    {
        var client = _factory.CreateClient("AnthropicClient");

        var messages = request.History
            .TakeLast(10) // limit context window
            .Select(m => new { role = m.Role, content = m.Content })
            .ToList();
        messages.Add(new { role = "user", content = request.Message });

        var body = new
        {
            model      = _config["Anthropic:Model"],
            max_tokens = int.Parse(_config["Anthropic:MaxTokens"] ?? "400"),
            system     = SystemPrompt,
            messages
        };

        var json     = JsonSerializer.Serialize(body);
        var content  = new StringContent(json, Encoding.UTF8, "application/json");
        var response = await client.PostAsync("v1/messages", content);
        response.EnsureSuccessStatusCode();

        var raw  = await response.Content.ReadAsStringAsync();
        var doc  = JsonDocument.Parse(raw);
        return doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? "I'm having trouble right now — please try again!";
    }
}
