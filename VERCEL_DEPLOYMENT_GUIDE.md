# Vercel Frontend Deployment Guide

## Overview
Deploy the kumaru-lanka-next frontend to Vercel with Azure backend integration.

**Frontend URL (after deployment):** `https://kumaru-lanka-next.vercel.app` (or custom domain)
**Backend URL:** `https://kumaru-lanka-api.azurewebsites.net/api` (Azure, already deployed)

---

## Step 1: Push Code to GitHub

First, ensure all code changes are committed and pushed to GitHub (this enables GitHub Actions for backend auto-deploy and allows Vercel to pull from GitHub):

```bash
cd /Users/ishankacharuka/Desktop/2026project/Kumaru\ Lanka\ project\ copy/Kumaru\ Lanka/Untitled

# Check git status
git status

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat: Add Azure backend integration, Vercel config, mobile hero background"

# Push to main branch
git push origin main
```

**Expected output:** `main -> main` (or if already up-to-date, no changes needed)

---

## Step 2: Connect GitHub Repository to Vercel

### Option A: Sign Up / Log In to Vercel

1. Go to **https://vercel.com**
2. Click **Sign Up** (or **Log In** if you have an account)
3. Choose **Continue with GitHub**
4. Authorize Vercel to access your GitHub account
5. Select **Install** (if prompted to install the Vercel GitHub App)

### Option B: Already Have Vercel Account

1. Go to **https://vercel.com/dashboard**
2. Click **Add New...** → **Project**
3. Select **Import Git Repository**

---

## Step 3: Import the kumaru-lanka-next Project

1. In the Vercel dashboard, search for **iacharuka/Kumaru-Lanka-Next** (or your repo name)
2. Click **Select** to import
3. Vercel will auto-detect **Next.js** framework
4. Leave **Build Settings** as default (Vercel auto-reads package.json scripts)
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Click **Environment Variables** section

---

## Step 4: Set Environment Variables in Vercel

In the **Environment Variables** section, add:

| Name | Value | Scope |
|------|-------|-------|
| `NEXT_PUBLIC_API_BASE` | `https://kumaru-lanka-api.azurewebsites.net/api` | Production, Preview, Development |
| `KL_API_BASE` | `https://kumaru-lanka-api.azurewebsites.net/api` | Production, Preview, Development |

**Steps:**
1. Enter **Name:** `NEXT_PUBLIC_API_BASE`
2. Enter **Value:** `https://kumaru-lankapi.azurewebsites.net/api`
3. Check all three scopes: **Production**, **Preview**, **Development**
4. Click **Add**
5. Repeat for `KL_API_BASE`

---

## Step 5: Deploy

1. Click **Deploy** button
2. Vercel will:
   - Build the Next.js project (`npm run build`)
   - Install dependencies
   - Compile with Turbopack
   - Deploy to edge network
3. Wait for deployment to complete (~2-3 minutes)

**Expected Result:** Green checkmark with message:
```
✓ Deployed to https://kumaru-lanka-next.vercel.app
```

---

## Step 6: Verify Frontend ↔ Backend Connectivity

Once deployed, test the frontend:

1. **Open frontend:** https://kumaru-lanka-next.vercel.app
2. **Check browser DevTools Console** (F12 → Console tab)
3. **Expected behavior:**
   - Homepage loads without errors
   - Hero section displays with mobile background image
   - Tours section should show cards (fetched from Azure API)
   - No CORS errors in console

### Quick API Test
If tours don't appear, check connectivity:

```bash
curl -s https://kumaru-lanka-api.azurewebsites.net/api/tours | jq '.[] | .title' | head -3
```

Expected output: Tour titles (e.g., "Cultural Triangle Discovery")

---

## Step 7: (Optional) Set Up Custom Domain

If you want a custom domain (e.g., kumaru-lanka.com):

1. Go to Vercel project settings
2. Click **Domains**
3. Add your domain
4. Follow DNS configuration steps (depends on your registrar)

---

## Step 8: (Optional) Set GitHub Actions Secrets for Auto-Deploy

To enable automatic backend re-deployment when you push changes to `KumaruLanka.API`:

1. Go to GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name:** `AZURE_WEBAPP_NAME`
   - **Value:** `kumaru-lanka-api`
4. Click **Add secret**
5. Repeat for **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Value:** [Retrieve from Azure Portal]

To get the publish profile:
```bash
az webapp deployment list-publishing-profiles \
  --resource-group kumaru-lanka-rg \
  --name kumaru-lanka-api \
  --query "[0].publishUrl" -o tsv
```

---

## Troubleshooting

### Frontend Builds but Shows Errors
- **Check:** Environment variables set in Vercel dashboard
- **Check:** Backend API is responding: `curl https://kumaru-lanka-api.azurewebsites.net/api/health`

### CORS Errors in Browser Console
- **Cause:** Browser blocked cross-origin API request
- **Fix:** Backend CORS already configured for `*.vercel.app`; verify with:
```bash
curl -I -H "Origin: https://kumaru-lanka-next.vercel.app" \
  https://kumaru-lankapi.azurewebsites.net/api/tours
```

### Build Fails with "out of memory"
- **Cause:** Turbopack memory limit exceeded during build
- **Fix:** Go to Vercel project settings → **Build & Development Settings** → increase memory if available, or optimize imports

### API Calls Return 404
- **Cause:** Backend endpoint URL incorrect or tour data not seeded
- **Fix:** Check Azure API status: `curl https://kumaru-lankapi.azurewebsites.net/api/tours`

---

## Next Steps

1. ✅ Monitor Vercel deployments for any build failures
2. ✅ Share Vercel URL with team/stakeholders
3. ✅ Set up Vercel project analytics (optional)
4. ✅ Configure production domain if needed

---

## Quick Reference

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | Deployed | https://kumaru-lanka-next.vercel.app |
| Backend | Deployed | https://kumaru-lankapi.azurewebsites.net/api |
| Database | Provisioned | Azure SQL Server (kumaru-lanka-db) |
| CI/CD | Active | GitHub Actions (auto-deploy backend on push) |

