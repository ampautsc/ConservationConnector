# Deployment Fix

## Problem
The web application was not loading correctly in production on Azure Static Web Apps. The browser console showed:

```
Uncaught SyntaxError: Unexpected token '<' (at main.jsx:7:3)
GET https://jolly-desert-06ecd5510.2.azurestaticapps.net/vite.svg 404 (Not Found)
```

## Root Cause

The issue was in the Azure Static Web Apps deployment configuration in `.github/workflows/azure-static-web-apps-deploy.yml`:

```yaml
app_location: "."              # Root of repository
output_location: "dist"        # Built output folder
skip_app_build: true           # Skip Azure's build process
```

**Problem**: When Azure encountered this configuration, it was serving files from the root directory instead of the `dist` folder. This meant:

1. **Source `index.html` was served** (from root) which contains:
   ```html
   <script type="module" src="/src/main.jsx"></script>
   ```
   
2. **Browser tried to load `/src/main.jsx`** directly, which:
   - Contains JSX syntax that browsers cannot parse
   - Results in "Unexpected token '<'" error when browser tries to execute JSX as JavaScript

3. **Assets like `vite.svg` were not found** because they only exist in `dist/`, not in the root

## Solution

Changed the Azure deployment configuration to point directly to the built output:

```yaml
app_location: "dist"           # Point directly to built output
output_location: ""            # Empty since app_location is already the output
skip_app_build: true           # Skip Azure's build process
```

**Why this works**:
- Azure now only sees the contents of the `dist/` folder
- The built `index.html` correctly references bundled assets:
  ```html
  <script type="module" crossorigin src="/assets/index-CJ31Ym5B.js"></script>
  ```
- All assets (`vite.svg`, bundled JS, CSS) are present in `dist/`
- No confusion between source files and built files

## Files Changed

- `.github/workflows/azure-static-web-apps-deploy.yml` - Updated deployment configuration

## Verification

After this fix is deployed:

1. ✅ The built `index.html` will be served (not the source one)
2. ✅ JavaScript files will be loaded as bundled assets from `/assets/`
3. ✅ `vite.svg` will return 200 OK instead of 404
4. ✅ No JSX syntax errors in browser console
5. ✅ Application loads and renders correctly

## Testing Locally

To verify the fix works locally before deployment:

```bash
# Build the application
npm run build

# Preview the built application (simulates production)
npm run preview

# Open http://localhost:4173 in browser
```

This serves the `dist/` folder exactly as Azure will serve it in production.

## Related Issues

This fix addresses the fundamental deployment issue that has been causing:
- JSX syntax errors in browser
- 404 errors for static assets
- Previous MIME type configuration attempts that didn't solve the root problem

The MIME type configurations in `staticwebapp.config.json` are still valid and necessary, but they can only work if the correct files are being served in the first place.
