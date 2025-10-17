# Real Polygon Boundaries - How to Obtain Authoritative Data

## Overview
This document provides instructions for replacing generated polygon approximations with authoritative boundary data from official U.S. government sources.

## Current Status
- ✅ All 79 sites have polygon geometries (no Point geometries)
- ✅ 29 sites: Official boundaries from PADUS 3.0
- ⚠️ 50 sites: Generated approximations (medium quality)

## Obtaining Real Data

### Prerequisites
- Network access to government data portals
- `curl` or `wget` for downloads
- `ogr2ogr` (GDAL) for shapefile conversion
- `jq` for JSON processing

### Step-by-Step Instructions

#### 1. Download USFS National Forest Boundaries (32 sites)

**Option A: Direct Shapefile Download**
```bash
cd public/data/geojson/sources
wget https://data.fs.usda.gov/geodata/edw/edw_resources/shp/S_USA.AdministrativeForest.zip
unzip S_USA.AdministrativeForest.zip
ogr2ogr -f GeoJSON usfs-forests.geojson S_USA.AdministrativeForest.shp -t_srs EPSG:4326
```

**Option B: Query ArcGIS REST API**
```bash
# Query for specific forest by name
curl "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?\
where=FORESTNAME='Angeles National Forest'&\
outFields=*&\
outSR=4326&\
f=geojson" > angeles-nf-boundary.json
```

#### 2. Download USFWS Wildlife Refuge Boundaries (18 sites)

**Option A: Direct GeoJSON Download**
```bash
cd public/data/geojson/sources
curl "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0/query?\
where=1=1&\
outFields=*&\
outSR=4326&\
f=geojson" > fws-refuges.geojson
```

**Option B: Download from FWS Open Data Portal**
```bash
# Visit: https://gis-fws.opendata.arcgis.com/datasets/fws-national-realty-boundaries
# Download as GeoJSON
wget [download-url] -O fws-refuges.geojson
```

#### 3. Download NPS Unit Boundaries (Preserves, Seashores, etc.)

```bash
cd public/data/geojson/sources
curl "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/\
NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?\
where=1=1&\
outFields=*&\
outSR=4326&\
f=geojson" > nps-units.geojson
```

### 4. Extract Boundaries for Specific Sites

```bash
cd scripts
node extract-boundaries-from-sources.cjs
```

This script will:
- Read all GeoJSON files from `public/data/geojson/sources/`
- Match features by name to site configuration
- Extract polygon geometries
- Update site JSON files
- Set `dataQuality: "high"` in metadata

### 5. Verify Updates

```bash
# Check that sites were updated
jq '.metadata.dataQuality' public/data/sites/angeles-nf.json
# Should return: "high"

# Verify geometry type
jq '.geometry.type' public/data/sites/angeles-nf.json
# Should return: "Polygon" or "MultiPolygon"

# Check geometry source
jq '.metadata.geometrySource' public/data/sites/angeles-nf.json
# Should indicate official source
```

### 6. Build and Test

```bash
npm run build
npm run dev
# Visit map and verify polygons render correctly
```

## Alternative: Use Existing PADUS Dataset

If you have access to the complete PADUS 3.0 dataset:

```bash
# Download PADUS for specific states
# https://www.sciencebase.gov/catalog/item/626f6d39d34e915b67c3f3c6

# Extract for each state
wget https://www.sciencebase.gov/catalog/file/get/626f6d39d34e915b67c3f3c6?name=PADUS3_0_California.zip
unzip PADUS3_0_California.zip

# Convert to GeoJSON
ogr2ogr -f GeoJSON -t_srs EPSG:4326 california-padus.geojson PADUS3_0_California.gdb

# Filter for specific sites
jq '.features[] | select(.properties.Unit_Nm | contains("Angeles"))' california-padus.geojson > angeles-nf.json

# Update site file geometry
node scripts/update-from-extracted-geometry.cjs angeles-nf angeles-nf.json
```

## Query Individual Sites Programmatically

For each site type, use the query script:

```bash
node scripts/query-arcgis-boundaries.cjs
```

This will:
- Query each API for specific site names
- Extract polygon geometry
- Update site JSON files automatically
- Set appropriate metadata

## Sites Requiring Updates

### National Forests (31 sites)
- angeles-nf
- angelina-nf
- apache-sitgreaves-nf
- apalachicola-nf
- beaverhead-deerlodge-nf
- bighorn-nf
- bridger-teton-nf
- caribou-targhee-nf
- chugach-nf
- coconino-nf
- coronado-nf
- custer-gallatin-nf
- davy-crockett-nf
- flathead-nf
- helena-lewis-clark-nf
- inyo-nf
- kaibab-nf
- kootenai-nf
- lewis-and-clark-nf
- lolo-nf
- medicine-bow-routt-nf
- ocala-nf
- prescott-nf
- sabine-nf
- sam-houston-nf
- san-bernardino-nf
- sequoia-nf
- shoshone-nf
- sierra-nf
- tongass-nf
- tonto-nf

### Wildlife Refuges (11 sites)
- aransas-nwr
- arctic-nwr
- buenos-aires-nwr
- ding-darling-nwr
- florida-panther-nwr
- laguna-atascosa-nwr
- loxahatchee-nwr
- merritt-island-nwr
- national-elk-refuge
- seedskadee-nwr
- st-marks-nwr
- ten-thousand-islands-nwr
- yukon-delta-nwr

### Other NPS Units (8 sites)
- big-cypress-national-preserve
- big-thicket-national-preserve
- mojave-national-preserve
- flaming-gorge-nra
- padre-island-ns

## Troubleshooting

### Download Fails
- Check network connectivity
- Verify URLs are current (APIs may change)
- Try alternative download methods
- Contact agency GIS departments

### Feature Name Mismatch
- Check exact naming in source data
- Update `siteMatching` configuration in extraction script
- Use flexible matching (contains, case-insensitive)

### Large File Size
- Simplify polygons with `scripts/simplify-geojson.cjs`
- Use tolerance parameter (e.g., 0.001) to reduce vertices
- Keep original high-res data archived separately

### Geometry Errors
- Validate GeoJSON with online tools
- Check coordinate order (GeoJSON uses [lng, lat])
- Ensure CRS is EPSG:4326 (WGS84)

## Contact Information

### Data Sources
- **USFS**: https://data.fs.usda.gov/geodata/ or geodata_admin@fs.fed.us
- **USFWS**: https://www.fws.gov/gis/
- **NPS**: https://www.nps.gov/gis/
- **PADUS**: https://www.usgs.gov/programs/gap-analysis-project

### Support
- Open an issue in the repository
- Check existing documentation in `/DATA_SOURCES.md`
- Review `/BOUNDARY_DATA_NEEDED.md` for detailed requirements

## Notes
- All government data is public domain
- Keep data up to date (agencies release updates)
- Simplify complex polygons for web performance
- Document data sources in metadata
- Archive original high-resolution data
