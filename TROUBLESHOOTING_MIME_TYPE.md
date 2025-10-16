# Troubleshooting MIME Type Issues

## Problem Description

Error: `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`

## What We've Done

### PR #13 - Initial MIME Type Fix
- Changed MIME types from `application/javascript` to `text/javascript` in `staticwebapp.config.json`
- This aligns with HTML spec recommendations for module scripts

### PR #14 - Comprehensive MIME Type Routes
- Added explicit route rules for `/*.js` and `/*.mjs` files
- Added `.jsx` to mimeTypes mapping
- Ensured routes are ordered correctly (most specific first)

## How Azure Static Web Apps Handles MIME Types

Azure Static Web Apps determines MIME types in this order:
1. **Route-specific headers** (highest priority)
2. **mimeTypes section** in staticwebapp.config.json
3. **Default Azure MIME mappings** (lowest priority)

Our configuration now covers all three levels:
- Explicit headers for `/assets/*.js` (bundled app code)
- Explicit headers for `/*.js` (fallback for any JS at root)
- mimeTypes mappings for `.js`, `.mjs`, `.jsx`, `.css`, `.json`

## Verification Steps

### 1. Check Deployment
After merging this PR, verify the deployment completes:
```bash
# In GitHub Actions, look for:
# "Build And Deploy" job -> "Deploy to Azure Static Web Apps"
```

### 2. Verify Configuration Deployed
Check that staticwebapp.config.json exists on Azure:
```
https://[your-app].azurestaticapps.net/staticwebapp.config.json
```

### 3. Check Headers
Use browser DevTools Network tab to verify response headers for JavaScript files:
```
Content-Type: text/javascript; charset=UTF-8
```

### 4. Clear Browser Cache
The error might persist due to cached files:
- Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
- Or use incognito/private browsing mode

## Expected File Structure in Production

After build, the `dist` folder should contain:
```
dist/
├── index.html                    # References /assets/index-XXX.js
├── staticwebapp.config.json      # MIME type configuration
├── assets/
│   ├── index-XXX.js              # Bundled JavaScript (with hash)
│   └── index-XXX.css             # Bundled CSS (with hash)
└── data/
    └── conservation-areas.json   # Data file
```

**Important:** There should be NO `/src/` directory in dist. All source files are bundled into `/assets/`.

## Common Issues and Solutions

### Issue: Browser Still Shows "application/octet-stream"
**Solution:** 
- Clear browser cache completely
- Try incognito/private browsing
- Wait 5-10 minutes for Azure CDN cache to clear

### Issue: Error Says "from main.jsx:1"
**Solution:**
This is the error SOURCE, not the file being loaded. The actual file is `/assets/index-XXX.js`.
Check the Network tab in DevTools to see which file failed to load.

### Issue: Files Not Found (404)
**Solution:**
Ensure GitHub Actions workflow completed successfully and deployed to Azure.
Check Azure Static Web Apps portal for deployment status.

## Testing Locally

To test the production build locally:
```bash
# Build the application
npm run build

# Preview the built application
npm run preview
```

This serves the `dist` folder using Vite's preview server, which simulates production.

## Additional Azure Configuration

If issues persist, check Azure Portal settings:
1. Navigate to your Static Web App resource
2. Go to "Configuration"
3. Verify "Custom domains" are correct (if using custom domain)
4. Check "Application settings" for any overrides

## Contact Points

- GitHub Repository: https://github.com/ampautsc/ConservationConnector
- Azure Static Web Apps Docs: https://docs.microsoft.com/en-us/azure/static-web-apps/
- MIME Type Spec: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types

## Expected Outcome

After this fix:
- ✅ JavaScript files served with `text/javascript` MIME type
- ✅ Browser accepts and executes module scripts
- ✅ Application loads successfully
- ✅ Map displays with all conservation areas
