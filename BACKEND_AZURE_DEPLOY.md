# Backend Hosting Guide (Azure App Service)

This guide deploys `KumaruLanka.API` (.NET 8) and connects it to SQL Server/Azure SQL.

## 1) Create Azure resources

1. Create a Resource Group.
2. Create an App Service Plan.
3. Create a Web App:
   - Runtime: .NET 8 (LTS)
   - OS: Linux or Windows
4. Create Azure SQL Database (recommended) or prepare an external SQL Server.

## 2) Publish API locally

From `KumaruLanka.API`:

```bash
dotnet publish -c Release -o ./publish
```

## 3) Deploy to Azure App Service

Use one of these:

- VS Code Azure App Service extension: deploy folder `KumaruLanka.API/publish`
- GitHub Actions deployment from repository

## 4) Configure App Service environment variables

Set these in Azure Portal -> Web App -> Settings -> Environment variables.

### Connection string

- `ConnectionStrings__DefaultConnection`

Example format:

```text
Server=tcp:<server-name>.database.windows.net,1433;Initial Catalog=<db-name>;Persist Security Info=False;User ID=<db-user>;Password=<db-password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### JWT

- `Jwt__Key` (32+ chars, strong secret)
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpiryHours`

### Anthropic

- `Anthropic__ApiKey`
- `Anthropic__Model`
- `Anthropic__MaxTokens`

### Cloudinary

- `Cloudinary__CloudName`
- `Cloudinary__ApiKey`
- `Cloudinary__ApiSecret`

### Email

- `Email__SmtpHost`
- `Email__SmtpPort`
- `Email__SenderEmail`
- `Email__SenderName`
- `Email__Password`

### Stripe

- `Stripe__SecretKey`
- `Stripe__PublishableKey`

### Runtime

- `ASPNETCORE_ENVIRONMENT=Production`

## 5) CORS for Vercel frontend

Backend CORS now supports:

- Explicit domains from config (`Cors:AllowedOrigins`)
- Optional Vercel previews (`Cors:AllowVercelPreview=true` allows `*.vercel.app`)

Set these in config/env vars:

- `Cors__AllowVercelPreview=true`
- `Cors__AllowedOrigins__0=https://kumarulanka.lk`
- `Cors__AllowedOrigins__1=https://www.kumarulanka.lk`
- `Cors__AllowedOrigins__2=https://<your-production-vercel-domain>`

## 6) Configure frontend to call backend

In Vercel project env vars:

- `KL_API_BASE=https://<your-backend-domain>/api`

Redeploy frontend after updating env vars.

## 7) Verify deployment

1. Open `https://<your-backend-domain>/swagger`
2. Test one API endpoint from Swagger.
3. Open frontend and test login + data fetch.
4. Confirm browser network requests return `2xx` and no CORS errors.

## 8) Recommended production hardening

1. Use Azure Key Vault for secrets.
2. Restrict SQL firewall access.
3. Enable App Service HTTPS Only.
4. Enable Application Insights logging.
5. Rotate JWT and API secrets periodically.
