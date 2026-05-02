#!/usr/bin/env bash
set -euo pipefail

# Usage: AZ_SUBSCRIPTION_ID=... ./azure-setup.sh
# This script creates an Azure resource group, Azure SQL server+db, App Service plan and Web App.
# It requires the Azure CLI to be installed and you to be logged in (`az login`).

# === Configuration (override with env vars) ===
RESOURCE_GROUP=${RESOURCE_GROUP:-kumaru-lanka-rg}
LOCATION=${LOCATION:-eastus}
APP_LOCATION=${APP_LOCATION:-$LOCATION}
APP_NAME=${APP_NAME:-kumaru-lanka-api}
PLAN_NAME=${PLAN_NAME:-kumaru-lanka-plan}
DB_NAME=${DB_NAME:-kumaru_lanka_db}
SQL_SERVER_NAME=${SQL_SERVER_NAME:-kumaru-lanka-sql}
SQL_ADMIN_USER=${SQL_ADMIN_USER:-sqladmin}
SQL_ADMIN_PASSWORD=${SQL_ADMIN_PASSWORD:-"$(openssl rand -base64 16)"}
SKU=${SKU:-B1}

echo "Using resource group: ${RESOURCE_GROUP} (location: ${LOCATION})"

if [ -n "${AZ_SUBSCRIPTION_ID:-}" ]; then
  az account set --subscription "$AZ_SUBSCRIPTION_ID"
fi

if az group show --name "$RESOURCE_GROUP" >/dev/null 2>&1; then
  echo "Resource group already exists; reusing it."
else
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION"
fi

echo "Creating SQL Server: $SQL_SERVER_NAME"
az sql server create --name "$SQL_SERVER_NAME" --resource-group "$RESOURCE_GROUP" --location "$LOCATION" --admin-user "$SQL_ADMIN_USER" --admin-password "$SQL_ADMIN_PASSWORD"

echo "Creating SQL Database: $DB_NAME"
az sql db create --resource-group "$RESOURCE_GROUP" --server "$SQL_SERVER_NAME" --name "$DB_NAME" --service-objective S0

echo "Allow Azure services to access SQL server (firewall rule)"
az sql server firewall-rule create --resource-group "$RESOURCE_GROUP" --server "$SQL_SERVER_NAME" -n AllowAzureIPs --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0

# Build connection string
CONN="Server=tcp:${SQL_SERVER_NAME}.database.windows.net,1433;Initial Catalog=${DB_NAME};Persist Security Info=False;User ID=${SQL_ADMIN_USER};Password=${SQL_ADMIN_PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

echo "Creating App Service plan: $PLAN_NAME"
az appservice plan create --name "$PLAN_NAME" --resource-group "$RESOURCE_GROUP" --location "$APP_LOCATION" --sku $SKU

echo "Creating Web App: $APP_NAME"
az webapp create --resource-group "$RESOURCE_GROUP" --plan "$PLAN_NAME" --name "$APP_NAME" --runtime "dotnet:8"

# Set Connection String in Web App
echo "Setting connection string 'DefaultConnection' on web app"
az webapp config connection-string set --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --settings DefaultConnection="$CONN" --connection-string-type SQLAzure

# Set placeholder app settings (update real secrets later)
echo "Configuring placeholder app settings (replace values in Azure Portal or via az)
"
az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$APP_NAME" --settings \
  Jwt__Key="YOUR_SUPER_SECRET_KEY_MIN_32_CHARS_LONG" \
  Jwt__Issuer="KumaruLanka" \
  Jwt__Audience="KumaruLankaUsers" \
  Jwt__ExpiryHours="24" \
  Anthropic__ApiKey="" \
  Anthropic__Model="claude-sonnet-4-20250514" \
  Anthropic__MaxTokens="400" \
  Cloudinary__CloudName="" \
  Cloudinary__ApiKey="" \
  Cloudinary__ApiSecret="" \
  Email__SmtpHost="smtp.gmail.com" \
  Email__SmtpPort="587" \
  Email__SenderEmail="hello@kumarulanka.lk" \
  Email__SenderName="Kumaru Lanka" \
  Email__Password="" \
  Stripe__SecretKey="" \
  Stripe__PublishableKey="" \
  Cors__AllowVercelPreview="true" \
  ASPNETCORE_ENVIRONMENT="Production"

# Output publish profile (for GitHub Actions secret if needed)
echo "Retrieving publish profile (copy and paste into GitHub secret AZURE_WEBAPP_PUBLISH_PROFILE)"
az webapp deployment list-publishing-profiles --name "$APP_NAME" --resource-group "$RESOURCE_GROUP" --xml

echo "DONE"
echo "Connection string (DefaultConnection):"
echo "$CONN"

echo "Next steps:
 - Open Azure Portal to fill real secrets under Configuration > Application settings
 - Add AZURE_WEBAPP_NAME and AZURE_WEBAPP_PUBLISH_PROFILE to GitHub secrets (if using GitHub Actions)
 - Deploy using the existing GitHub Actions workflow or via 'az webapp deploy'"
