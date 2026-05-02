# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS builder

WORKDIR /src

# Copy project file
COPY ["KumaruLanka.API.csproj", "./"]

# Restore dependencies
RUN dotnet restore "KumaruLanka.API.csproj"

# Copy remaining source code
COPY . .

# Build
RUN dotnet build "KumaruLanka.API.csproj" -c Release -o /app/build

# Publish
RUN dotnet publish "KumaruLanka.API.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app

# Copy published app from builder
COPY --from=builder /app/publish .

# Set environment to production
ENV ASPNETCORE_ENVIRONMENT=Production

# Expose port (Render assigns PORT env var, default to 5080)
EXPOSE 5080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD dotnet /app/KumaruLanka.API.dll --health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "KumaruLanka.API.dll"]
