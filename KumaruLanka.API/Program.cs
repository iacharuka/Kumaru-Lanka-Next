using System.Text;
using KumaruLanka.API.Data;
using KumaruLanka.API.Middleware;
using KumaruLanka.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using AspNetCoreRateLimit;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
Console.WriteLine("Startup checkpoint: builder created");

// ── Database ──────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sql => sql.CommandTimeout(10))
);

// ── JWT Authentication ────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = builder.Configuration["Jwt:Issuer"],
            ValidAudience            = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
        policy.WithOrigins(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5500",     // Live Server (VS Code)
            "http://127.0.0.1:5173",
            "http://127.0.0.1:5500",
            "https://kumarulanka.lk" // production domain
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
    );
});

// ── Rate Limiting ─────────────────────────────────────────
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule { Endpoint = "*:/api/*", Limit = 300, Period = "1m" },
        new RateLimitRule { Endpoint = "post:/api/chat", Limit = 20, Period = "1m" }
    };
});
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ── Application Services (Dependency Injection) ───────────
builder.Services.AddScoped<ITourService,        TourService>();
builder.Services.AddScoped<IBookingService,     BookingService>();
builder.Services.AddScoped<IVehicleService,     VehicleService>();
builder.Services.AddScoped<IDestinationService, DestinationService>();
builder.Services.AddScoped<IReviewService,      ReviewService>();
builder.Services.AddScoped<IAuthService,        AuthService>();
builder.Services.AddScoped<IChatService,        ChatService>();
builder.Services.AddScoped<IEmailService,       EmailService>();
builder.Services.AddScoped<IImageService,       ImageService>();
builder.Services.AddScoped<IItineraryService,   ItineraryService>();

// ── HttpClient for Anthropic API ──────────────────────────
builder.Services.AddHttpClient("AnthropicClient", client =>
{
    client.BaseAddress = new Uri("https://api.anthropic.com/");
    client.DefaultRequestHeaders.Add("x-api-key", builder.Configuration["Anthropic:ApiKey"]);
    client.DefaultRequestHeaders.Add("anthropic-version", "2023-06-01");
});

// ── Controllers + Swagger ─────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title   = "Kumaru Lanka API",
        Version = "v1",
        Description = "Sri Lanka Travel & Transport Platform API"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.ApiKey,
        Scheme       = "Bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {{
        new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }},
        Array.Empty<string>()
    }});
});

// ── Build ─────────────────────────────────────────────────
Console.WriteLine("Startup checkpoint: building app");
var app = builder.Build();
Console.WriteLine("Startup checkpoint: app built");

// ── Middleware Pipeline ───────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Kumaru Lanka API v1"));
}

app.UseIpRateLimiting();
app.UseHttpsRedirection();
app.UseCors("FrontendPolicy");
app.UseAuthentication();
app.UseAuthorization();

// Serve the static frontend files (HTML/CSS/JS) from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();

app.Lifetime.ApplicationStarted.Register(() =>
{
    Console.WriteLine("Startup checkpoint: application started");
    _ = Task.Run(async () =>
    {
        using var scope = app.Services.CreateScope();
        var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");

        try
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.EnsureCreatedAsync();
            await DbSeeder.SeedAsync(db);
            logger.LogInformation("Database initialized.");
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Database initialization skipped because the SQL Server container is unavailable or the connection string is invalid.");
        }
    });
});

Console.WriteLine("Startup checkpoint: running app");
app.Run();
