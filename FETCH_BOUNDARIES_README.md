# Fetching Real Conservation Area Boundaries

## Overview

This repository now includes a batch script to fetch real GeoJSON boundary data for all conservation sites from official U.S. government sources.

## What's Been Done

✅ **Angeles National Forest** has been updated with real boundary data from the USFS API
- Data source: https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0
- Data quality: `high`
- Geometry type: `MultiPolygon`
- Simplified with `maxAllowableOffset=0.01` and `geometryPrecision=5` for optimal web performance

## The Batch Script

The script `scripts/fetch-all-real-boundaries.cjs` is ready to fetch real boundaries for all remaining sites that currently have `medium` data quality.

### Sites to be Updated (49 sites)

The script will fetch data for:
- **31 National Forests** - from USFS API
- **13 Wildlife Refuges** - from USFWS API  
- **4 NPS Units** - from NPS API
- **1 Wilderness/Recreation areas** - from respective managing agency APIs

### How to Run the Script

**Prerequisites:**
- Node.js installed
- Unrestricted internet access to U.S. government domains:
  - apps.fs.usda.gov (USFS)
  - services.arcgis.com (USFWS)
  - services1.arcgis.com (NPS)

**Run the script:**

```bash
cd /path/to/ConservationConnector
node scripts/fetch-all-real-boundaries.cjs
```

The script will:
1. Skip sites that already have high-quality data
2. Query the appropriate government API for each site
3. Fetch simplified GeoJSON boundaries (using maxAllowableOffset=0.01)
4. Update each site's JSON file with:
   - Real geometry data
   - `dataQuality: "high"`
   - `geometrySource: "[API] REST API - Official U.S. Government Data"`
   - Current date in `lastUpdated`
5. Display a summary of updates

**Expected output:**
```
Real Boundary Data Fetcher
==========================

Starting batch fetch of real boundary data...

Processing: angelina-nf
  Querying API...
  ✓ Updated angelina-nf

Processing: apache-sitgreaves-nf
  Querying API...
  ✓ Updated apache-sitgreaves-nf

...

================================
Summary:
  Sites processed: 49
  Successfully updated: 49
  Failed: 0
  Skipped (already high quality): 11
================================

✓ Real boundary data successfully fetched from official sources!
```

## Data Sources

### USFS (U.S. Forest Service)
- **API:** https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0
- **Example:** `where=FORESTNAME='Angeles National Forest'`
- **Sites:** All National Forests (31 sites)

### USFWS (U.S. Fish & Wildlife Service)
- **API:** https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0
- **Example:** `where=ORGNAME LIKE '%Aransas%'`
- **Sites:** All Wildlife Refuges (13 sites)

### NPS (National Park Service)
- **API:** https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2
- **Example:** `where=UNIT_NAME LIKE '%Big Cypress%'`
- **Sites:** National Preserves, Seashores, and Recreation Areas (4 sites)

## Data Simplification

All boundaries are fetched with simplification parameters for optimal web map performance:
- `maxAllowableOffset=0.01` - Reduces polygon complexity while maintaining accuracy
- `geometryPrecision=5` - Limits coordinate precision to 5 decimal places (~1.1m accuracy)
- `outSR=4326` - WGS84 coordinate system (standard for web maps)

This results in smaller file sizes and faster rendering while preserving the visual accuracy needed for the map.

## After Running the Script

1. **Review the changes:**
   ```bash
   git status
   git diff public/data/sites/
   ```

2. **Verify data quality:**
   ```bash
   # Check a few updated files
   jq '.metadata' public/data/sites/angelina-nf.json
   jq '.metadata' public/data/sites/coconino-nf.json
   ```

3. **Build and test:**
   ```bash
   npm run build
   npm run dev
   # Visit the map and verify boundaries render correctly
   ```

4. **Commit to source control:**
   ```bash
   git add public/data/sites/
   git commit -m "Update conservation areas with real boundary data from government APIs"
   git push
   ```

## Troubleshooting

### Network Issues
If you encounter `ENOTFOUND` or timeout errors:
- Ensure you have internet access
- Check if your network/firewall blocks government domains
- Try running from a different network
- The script includes 1-second delays between requests to avoid rate limiting

### Missing Data
If a site returns no geometry:
- The forest/refuge name in the API might differ from our expected name
- Check the site's official name and update the `where` clause in the script
- Some sites might use different field names (FORESTNAME vs FORESTNUMBER, etc.)

### Large Files
If any GeoJSON files are too large (>1MB):
- The simplification parameters can be adjusted
- Increase `maxAllowableOffset` (try 0.02 or 0.05)
- Use the `scripts/simplify-geojson.cjs` script for additional processing

## Manual Fetching

If you need to fetch a single site manually, use curl:

```bash
# Example: Fetch Angelina National Forest
curl "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?where=FORESTNAME='Angelina%20National%20Forest'&outFields=FORESTNAME&returnGeometry=true&outSR=4326&maxAllowableOffset=0.01&geometryPrecision=5&f=geojson" > angelina-nf-boundary.json
```

Then manually update the site file with the geometry from the response.

## Status

- ✅ Angeles National Forest - **Updated with real data**
- ✅ Script created - `scripts/fetch-all-real-boundaries.cjs`
- ⏳ Remaining 49 sites - **Ready to fetch** (requires unrestricted internet access)

All sites already in source control with `dataQuality: "high"` (19 National Parks, 10 other sites) will be skipped automatically.
