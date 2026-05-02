# Deploy Backend to Render (Free)

## Prerequisites

1. GitHub account
2. Render account (free): https://render.com
3. SQL database (use Railway free tier or cloud provider)

## Step 1: Prepare Database

### Option A: Use Railway for free Postgres (easy)

1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project → Add PostgreSQL
4. Get connection string

**Note:** You'll need to migrate from SQL Server to Postgres (simple for this API).

### Option B: Use existing SQL Server

If you have Azure SQL or external SQL Server, keep current connection string.

## Step 2: Push to GitHub

Make sure your repository is on GitHub:

```bash
cd /path/to/Kumaru_Lanka_repo
git add .
git commit -m "Add Docker support for Render deployment"
git push origin main
```

## Step 3: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Fill in:
   - **Name:** `kumaru-lanka-api`
   - **Root Directory:** `KumaruLanka.API`
   - **Environment:** Docker
   - **Branch:** main
   - **Plan:** Free

5. Click **Create Web Service**

## Step 4: Set Environment Variables

In Render dashboard → your web service → Environment:

Add these variables:

```
ConnectionStrings__DefaultConnection=your_sql_connection_string
Jwt__Key=your_32_char_secret_key
Jwt__Issuer=KumaruLanka
Jwt__Audience=KumaruLankaUsers
Jwt__ExpiryHours=24
Anthropic__ApiKey=your_anthropic_key
Anthropic__Model=claude-sonnet-4-20250514
Anthropic__MaxTokens=400
Cloudinary__CloudName=your_cloudinary_name
Cloudinary__ApiKey=your_cloudinary_key
Cloudinary__ApiSecret=your_cloudinary_secret
Email__SmtpHost=smtp.gmail.com
Email__SmtpPort=587
Email__SenderEmail=hello@kumarulanka.lk
Email__SenderName=Kumaru Lanka
Email__Password=your_email_app_password
Stripe__SecretKey=your_stripe_secret
Stripe__PublishableKey=your_stripe_publishable
Cors__AllowVercelPreview=true
Cors__AllowedOrigins__0=https://your-vercel-domain.vercel.app
ASPNETCORE_ENVIRONMENT=Production
```

## Step 5: Update Vercel Frontend

In Vercel project settings → Environment Variables:

```
KL_API_BASE=https://your-render-api-url/api
```

(Render will give you the deployed URL in dashboard)

## Step 6: Test

1. Wait for Render build to complete (5-10 mins)
2. Open Render logs to check for errors
3. Test: `curl https://your-render-url/api/tours`
4. Open frontend, verify API calls work

## Limitations (Free Tier)

- **Spins down after 15 mins inactivity** (auto-wakes on request)
- **512 MB RAM** (sufficient for this API)
- **No scheduled tasks**
- **Limited to 1 service free**

## Upgrade Later

When ready to go production:
- Upgrade to Render Paid ($7/month)
- Use Render Postgres ($15/month)
- Or stay on free tier for development

## Troubleshooting

### Build fails
- Check logs in Render dashboard
- Ensure Dockerfile is in root of repo or set Root Directory correctly

### API returns 500
- Check Render logs for database connection errors
- Verify connection string is correct
- Ensure database firewall allows Render IPs

### Vercel frontend can't reach API
- Check CORS settings in backend
- Verify `KL_API_BASE` env var in Vercel
- Open browser console for CORS errors
