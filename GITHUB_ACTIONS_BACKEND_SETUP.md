# GitHub Actions Backend Auto Deploy Setup

This repository includes an Azure deployment workflow:

- `.github/workflows/backend-deploy-azure.yml`

It deploys `KumaruLanka.API` on:

- Push to `main` when files under `KumaruLanka.API/**` change
- Manual run from GitHub Actions (`workflow_dispatch`)

## 1) Add required GitHub secrets

In GitHub repository settings -> Secrets and variables -> Actions -> New repository secret:

1. `AZURE_WEBAPP_NAME`
2. `AZURE_WEBAPP_PUBLISH_PROFILE`

### How to get publish profile

1. Open Azure Portal -> your App Service
2. Click `Get publish profile`
3. Downloaded file is XML
4. Copy full XML content and paste as `AZURE_WEBAPP_PUBLISH_PROFILE` secret

## 2) Configure backend app settings in Azure

Set these in Azure App Service Environment variables:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__ExpiryHours`
- `Anthropic__ApiKey`
- `Anthropic__Model`
- `Anthropic__MaxTokens`
- `Cloudinary__CloudName`
- `Cloudinary__ApiKey`
- `Cloudinary__ApiSecret`
- `Email__SmtpHost`
- `Email__SmtpPort`
- `Email__SenderEmail`
- `Email__SenderName`
- `Email__Password`
- `Stripe__SecretKey`
- `Stripe__PublishableKey`
- `Cors__AllowVercelPreview`
- `Cors__AllowedOrigins__0`
- `Cors__AllowedOrigins__1`
- `Cors__AllowedOrigins__2`
- `ASPNETCORE_ENVIRONMENT`

## 3) First deployment

1. Push to `main`, or run workflow manually in GitHub Actions.
2. Watch workflow logs and confirm deployment success.
3. Verify `https://<your-backend-domain>/swagger` is reachable.

## 4) Recommended next hardening

1. Move secrets to Azure Key Vault and reference them from App Service.
2. Enable staging slot and deploy there first.
3. Add health-check step in workflow after deploy.
