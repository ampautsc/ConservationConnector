# Azure Setup Quick Start

## What Has Been Done

Your repository is now configured for Azure Static Web Apps deployment with:

✅ GitHub Actions workflow (`.github/workflows/azure-static-web-apps-deploy.yml`)  
✅ Azure Static Web Apps configuration (`staticwebapp.config.json`)  
✅ Comprehensive deployment guide (`DEPLOYMENT.md`)  
✅ Build tested and verified (outputs to `dist/`)  

## What You Need To Do

### Step 1: Create Azure Static Web App Resource

1. Go to https://portal.azure.com
2. Click **"Create a resource"**
3. Search for **"Static Web Apps"** and select it
4. Click **"Create"**
5. Configure with these settings:

   | Setting | Value |
   |---------|-------|
   | **Subscription** | Your Azure subscription |
   | **Resource Group** | Create new or select existing |
   | **Name** | `conservation-connector` (or your choice) |
   | **Plan type** | Free (upgrade later if needed) |
   | **Region** | Choose closest to your users |
   | **Source** | GitHub |
   | **Organization** | `ampautsc` |
   | **Repository** | `ConservationConnector` |
   | **Branch** | `main` |
   | **Build Presets** | React |
   | **App location** | `/` |
   | **Api location** | (leave empty) |
   | **Output location** | `dist` |

6. Click **"Review + create"** then **"Create"**

### Step 2: Configure GitHub Secret

1. In Azure Portal, go to your new Static Web App → **"Overview"**
2. Click **"Manage deployment token"**
3. **Copy** the deployment token
4. Go to https://github.com/ampautsc/ConservationConnector/settings/secrets/actions
5. Click **"New repository secret"**
6. Enter:
   - **Name:** `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Value:** (paste the deployment token)
7. Click **"Add secret"**

### Step 3: Deploy

Once the secret is added, you can deploy by either:

**Option A: Merge this PR**
- Merge this pull request to `main` branch
- GitHub Actions will automatically deploy

**Option B: Push to main**
- Push any changes to the `main` branch
- Automatic deployment will trigger

### Step 4: Get Your Deployment URL

Find your live application URL:
- Azure Portal → Your Static Web App → **Overview** → **URL**
- Example: `https://conservation-connector.azurestaticapps.net`

## Information You Need to Provide

Please provide the following information once setup is complete:

1. **Azure Static Web App Name:** ___________________________
2. **Deployment URL:** ___________________________
3. **GitHub Secret Status:** ❏ AZURE_STATIC_WEB_APPS_API_TOKEN added

## Troubleshooting

### If deployment fails:

1. **Check GitHub Actions logs:**
   - Go to https://github.com/ampautsc/ConservationConnector/actions
   - Click on the failed workflow run
   - Review the error messages

2. **Verify the secret:**
   - Ensure `AZURE_STATIC_WEB_APPS_API_TOKEN` is exactly this name (case-sensitive)
   - The token should match what Azure provides

3. **Check Azure Portal:**
   - Go to your Static Web App → Deployments
   - Check for error messages

### Common Issues:

❌ **"azure_static_web_apps_api_token not found"**
   → The GitHub secret is missing or has wrong name

❌ **"Build failed"**
   → Ensure Node.js version 20+ is being used (required by Vite 7)
   → The workflow is configured to use Node.js 20

❌ **"Deployment hangs at polling"**
   → This issue has been fixed in the workflow
   → The app is now built in GitHub Actions (not Azure Oryx)
   → Uses `skip_app_build: true` to upload pre-built artifacts

❌ **"Application not loading"**
   → Verify `staticwebapp.config.json` is present and valid
   → Check browser console for errors

## Next Steps After Deployment

- [ ] Test the application at the Azure URL
- [ ] Verify map loads correctly
- [ ] Test adding conservation areas
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring alerts

## Need More Details?

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive documentation including:
- Custom domain setup
- Monitoring configuration
- Rollback procedures
- Cost considerations
- Production checklist

## Questions?

Common questions answered in DEPLOYMENT.md:
- How do I add a custom domain?
- What's included in the Free tier?
- How do I rollback a deployment?
- How do I monitor the application?
