# Deployment Guide

## Azure Static Web Apps Deployment

### Prerequisites
- Azure account with an active subscription
- GitHub repository access with appropriate permissions

### Setup Steps

#### 1. Create Azure Static Web App Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Static Web Apps" and select it
4. Click "Create"
5. Fill in the following details:
   - **Subscription**: Select your Azure subscription
   - **Resource Group**: Create new or select existing
   - **Name**: `conservation-connector` (or your preferred name)
   - **Plan type**: Free (or Standard for custom domains and more features)
   - **Region**: Choose the closest region to your users
   - **Source**: GitHub
   - **GitHub account**: Authenticate with GitHub
   - **Organization**: `ampautsc`
   - **Repository**: `ConservationConnector`
   - **Branch**: `main`
   
6. Under Build Details:
   - **Build Presets**: Select "React"
   - **App location**: `/` (root of repository)
   - **Api location**: Leave empty (no backend API)
   - **Output location**: `dist`

7. Click "Review + create"
8. Click "Create"

#### 2. Configure GitHub Secret

Azure automatically creates a GitHub Actions workflow and adds a secret to your repository. However, you need to ensure the secret name matches your workflow file.

1. After Azure creates the resource, go to "Overview" in the Azure Portal
2. Click on "Manage deployment token"
3. Copy the deployment token
4. Go to your GitHub repository: `https://github.com/ampautsc/ConservationConnector`
5. Navigate to Settings → Secrets and variables → Actions
6. Click "New repository secret"
7. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
8. Value: Paste the deployment token from Azure
9. Click "Add secret"

**Important**: The workflow file in this repository uses the secret name `AZURE_STATIC_WEB_APPS_API_TOKEN`. Make sure this matches the secret you create in GitHub.

#### 3. Deploy

Once the secret is configured:

1. Push any changes to the `main` branch, or
2. Merge a pull request to the `main` branch

GitHub Actions will automatically:
- Build the application using Vite
- Deploy to Azure Static Web Apps
- Provide a deployment URL in the Azure Portal

Your app will be available at: `https://<your-app-name>.azurestaticapps.net`

You can find the URL in:
- Azure Portal → Your Static Web App → Overview → URL
- GitHub Actions workflow logs

### What You Need to Provide

To complete the deployment setup, you'll need to:

1. **Create the Azure Static Web App resource** following the steps above
2. **Add the deployment token** as a GitHub secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`
3. **Note the deployment URL** from Azure Portal to share with users

### Configuration Files Explained

This repository includes the following deployment configuration files:

#### `.github/workflows/azure-static-web-apps-deploy.yml`
- GitHub Actions workflow that automatically builds and deploys the app
- Triggers on push to `main` branch or when pull requests are opened/updated
- Uses the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret for authentication

#### `staticwebapp.config.json`
- Azure Static Web Apps configuration
- Handles client-side routing (single-page application support)
- Sets appropriate cache headers for assets and data files
- Ensures JavaScript module files (.js, .mjs, .jsx) are served with correct MIME type (application/javascript)
- Ensures CSS files are served with correct MIME type (text/css)
- Ensures `/data/*.json` files are served correctly with proper MIME types

### Custom Domain (Optional)

To add a custom domain:

1. Go to your Static Web App in Azure Portal
2. Select "Custom domains" from the left menu
3. Click "Add"
4. Choose "Custom domain on other DNS"
5. Enter your domain name
6. Configure DNS records as instructed:
   - Add a CNAME record pointing to your Azure Static Web Apps URL
   - Or add TXT record for domain verification
7. Wait for DNS propagation (can take up to 48 hours)
8. SSL certificate will be automatically provisioned

### Monitoring and Troubleshooting

#### Monitor Your Application

Access monitoring in Azure Portal:
- Go to your Static Web App → Insights
- View traffic, performance metrics, and errors
- Set up alerts for critical issues

#### Troubleshooting Common Issues

**Build Fails**
- Check GitHub Actions logs for specific errors
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed in `package.json`
- Confirm Node.js version 20+ is being used (required by Vite 7)

**Deployment Fails**
- Verify the `AZURE_STATIC_WEB_APPS_API_TOKEN` secret is set correctly
- Check that the secret name matches the workflow file
- Review Azure Portal deployment logs

**Deployment Hangs at "Polling on deployment"**
- This was a known issue with Azure's Oryx build system using Node.js 18 with Vite 7
- **Solution**: The workflow now builds the app in GitHub Actions with Node.js 20+ and uses `skip_app_build: true`
- If you still experience this issue, ensure the workflow file has been updated with the latest changes

**Application Not Loading**
- Check browser console for errors
- Verify build was successful in GitHub Actions
- Check Azure Portal deployment status
- Ensure `staticwebapp.config.json` is present

**MIME Type Error for Module Scripts**
- **Error**: "Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of 'application/octet-stream'"
- **Cause**: Azure Static Web Apps may not automatically set correct MIME types for JavaScript modules, or may default to application/octet-stream
- **Solution**: The `staticwebapp.config.json` includes:
  - Explicit `mimeTypes` configuration mapping `.js`, `.mjs`, and `.jsx` to `application/javascript`
  - Explicit route-specific `Content-Type: application/javascript` headers for `/assets/*.js` and `/assets/*.mjs` files
  - Explicit `Content-Type: text/css` headers for `/assets/*.css` files
- **Important**: After pushing changes to `staticwebapp.config.json`, wait for the GitHub Actions deployment to complete and verify the file is deployed to Azure
- If you still see this error after deployment:
  1. Check the GitHub Actions workflow logs to confirm successful deployment
  2. Clear your browser cache or try in an incognito/private window
  3. Verify the configuration file is present at your Azure Static Web Apps URL: `https://your-app.azurestaticapps.net/staticwebapp.config.json`

**Data Files Not Loading**
- Verify files are in `public/data/` directory
- Check that `staticwebapp.config.json` includes `/data/*` route
- Ensure files are included in the build output (`dist/data/`)

### Rollback to Previous Version

If you need to rollback:

**Option 1: Using GitHub**
1. Go to GitHub Actions
2. Find a successful previous deployment
3. Click "Re-run all jobs"

**Option 2: Using Git**
1. Identify the commit to rollback to
2. Create a new commit that reverts changes:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

### Local Development

For local development without deployment:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Application runs at http://localhost:5173
```

### Production Checklist

Before going live:

- [ ] Azure Static Web App resource created
- [ ] GitHub secret `AZURE_STATIC_WEB_APPS_API_TOKEN` configured
- [ ] Test deployment by pushing to main branch
- [ ] Verify application loads at Azure URL
- [ ] Test all features work correctly
- [ ] Verify map tiles load properly
- [ ] Test adding and submitting conservation areas
- [ ] Check mobile responsiveness
- [ ] Set up custom domain (if applicable)
- [ ] Configure monitoring and alerts
- [ ] Update README with production URL

### Cost Considerations

**Free Tier** includes:
- 100 GB bandwidth per month
- Custom domain and SSL
- Global distribution
- GitHub integration
- Basic authentication

**Standard Tier** adds:
- 1 TB bandwidth per month
- Increased concurrent requests
- Production and staging environments
- Custom authentication providers

For most small to medium projects, the Free tier is sufficient.

### Support and Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Vite Documentation](https://vitejs.dev/)
- [React Leaflet Documentation](https://react-leaflet.js.org/)

### Next Steps After Deployment

1. Share the deployment URL with team members
2. Test all functionality in the production environment
3. Monitor initial usage and performance
4. Consider adding analytics (Google Analytics, Azure Application Insights)
5. Set up alerts for errors and downtime
6. Plan for regular updates and maintenance
