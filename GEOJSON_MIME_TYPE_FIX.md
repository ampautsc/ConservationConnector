# GeoJSON MIME Type Fix

## Problem

Conservation areas were not loading on the map in production (Azure Static Web Apps deployment), although they worked correctly in local development environment.

## Root Cause

The `.geojson` file extension was not properly configured in `staticwebapp.config.json`. While `.json` files were handled correctly, `.geojson` files needed explicit configuration in three key areas:

1. **Navigation Fallback Exclusion**: To prevent the SPA fallback from intercepting and rewriting `.geojson` file requests to `index.html`
2. **Route Headers**: To serve `.geojson` files with correct Content-Type headers
3. **MIME Type Mapping**: To explicitly map the `.geojson` extension to `application/json`

## Solution

Updated `staticwebapp.config.json` with three changes:

### 1. Added `.geojson` to Navigation Fallback Exclusion
```json
"/*.{css,js,mjs,map,json,geojson,ico,png,jpg,jpeg,svg,webp,woff,woff2,ttf,otf,wasm,txt}"
```

This ensures that requests for `.geojson` files in the root directory are not rewritten to `index.html`.

### 2. Added Route Rules for GeoJSON Files
```json
{
  "route": "/data/*.geojson",
  "headers": {
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "public, max-age=3600"
  }
},
{
  "route": "/data/geojson/*.geojson",
  "headers": {
    "Content-Type": "application/json; charset=UTF-8",
    "Cache-Control": "public, max-age=3600"
  }
}
```

These routes ensure that:
- `.geojson` files are served with the correct `application/json` MIME type
- Files are cached for 1 hour (3600 seconds) for optimal performance
- Both `/data/*.geojson` and `/data/geojson/*.geojson` patterns are covered

### 3. Added MIME Type Mapping
```json
".geojson": "application/json"
```

This provides an explicit MIME type mapping for the `.geojson` extension.

## Why Local Development Worked

The Vite development server automatically serves all file types with correct MIME types, including `.geojson` files. This is why the issue only manifested in production (Azure Static Web Apps) where explicit configuration is required.

## Files Affected

- `us-national-parks-polygons.geojson` (2.1 MB) - Contains 62 national park polygon features
- `us-national-parks.geojson` (23 KB) - Contains simplified park markers

## Verification

After deployment, the fix can be verified by:

1. **Check Network Tab**: Verify the GeoJSON file is loaded:
   - Status: 200 OK
   - Content-Type: `application/json; charset=UTF-8`
   - Response body is valid GeoJSON (not HTML)

2. **Check Statistics**: The app statistics panel should show:
   - Total Areas: 62
   - Existing: 62
   - Connections: 25 (or similar, depending on proximity calculations)

3. **Visual Verification**: Blue polygon shapes should appear on the map representing national parks

## Testing Performed

- ✅ Local development server (Vite) - Areas load correctly
- ✅ Production build with `serve` - Areas load correctly after fix
- ✅ Linting passes with no errors
- ✅ Build completes successfully
- ✅ Configuration file is valid JSON

## Related Documentation

- See `MIME_TYPE_FIX_SUMMARY.md` for previous MIME type issues with JavaScript files
- See `GEOJSON_SIMPLIFICATION.md` for details about the GeoJSON file optimization
