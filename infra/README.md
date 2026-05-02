# Azure Provisioning Scripts

This folder contains a helper script to provision an Azure Resource Group, Azure SQL Server + Database, App Service Plan and Web App using the Azure CLI.

Prerequisites
- `az` CLI installed and logged in: `az login`
- Enough subscription permissions to create resources

Quick start (edit variables or pass env vars):

```bash
# Set variables (example values)
export AZ_SUBSCRIPTION_ID="<your-subscription-id>"
export RESOURCE_GROUP="kumaru-lanka-rg"
export LOCATION="eastus"
export APP_LOCATION="southeastasia"
export APP_NAME="kumaru-lanka-api"
export PLAN_NAME="kumaru-lanka-plan"
export SQL_SERVER_NAME="kumaru-lanka-sql"
export SQL_ADMIN_USER="sqladmin"
export SQL_ADMIN_PASSWORD="StrongP@ssw0rd123"

# Run script
AZ_SUBSCRIPTION_ID=$AZ_SUBSCRIPTION_ID RESOURCE_GROUP=$RESOURCE_GROUP LOCATION=$LOCATION APP_LOCATION=$APP_LOCATION APP_NAME=$APP_NAME PLAN_NAME=$PLAN_NAME SQL_SERVER_NAME=$SQL_SERVER_NAME SQL_ADMIN_USER=$SQL_ADMIN_USER SQL_ADMIN_PASSWORD=$SQL_ADMIN_PASSWORD bash ./azure-setup.sh
```

What the script does
- Creates a Resource Group
- Creates an Azure SQL Server and database
- Opens the firewall for Azure services (0.0.0.0)
- Creates an App Service plan and Web App (Windows, .NET 8 runtime)
- Sets `DefaultConnection` connection string in Web App configuration
- Adds placeholder App Settings; replace them in Azure Portal with real secrets
- Prints publish profile XML for use with GitHub Actions

Security notes
- The script prints the DB password and connection string to stdout. Treat these as secrets.
- For production, use Azure Key Vault and managed identities instead of plaintext app settings.

Next steps
- Replace placeholder app settings in the Azure Portal
- Update the `AZURE_WEBAPP_PUBLISH_PROFILE` secret in GitHub to enable auto-deploy via the existing workflow
- Update CORS `Cors__AllowedOrigins__0` with your Vercel domain
