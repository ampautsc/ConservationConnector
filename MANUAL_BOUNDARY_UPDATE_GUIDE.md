# Manual Boundary Data Update Process

## Overview

Due to network restrictions in GitHub Actions, automated API fetching of boundary data doesn't work reliably. This guide provides the manual process for updating conservation site boundaries with official government data.

## Why Manual Updates?

The government APIs (USFS, USFWS, NPS) are either:
- Blocked in GitHub Actions environment
- Rate-limited severely
- Returning no data
- Unreliable for automated workflows

**Solution**: Download bulk datasets locally (where you have internet access), process them, and commit the results.

## Quick Start

### Option 1: Download Pre-Processed Datasets (Recommended)

1. **Download PADUS 3.0 state datasets** (includes all designation types):
   ```bash
   # For each state with sites needing updates
   wget https://www.sciencebase.gov/catalog/file/get/626f6d39d34e915b67c3f3c6?name=PADUS3_0_California.zip
   unzip PADUS3_0_California.zip
   ```

2. **Convert to GeoJSON**:
   ```bash
   ogr2ogr -f GeoJSON -t_srs EPSG:4326 california-padus.geojson PADUS3_0_California.gdb
   ```

3. **Place in sources directory**:
   ```bash
   mv california-padus.geojson public/data/geojson/sources/
   ```

4. **Run extraction script**:
   ```bash
   node scripts/extract-boundaries-from-sources.cjs
   ```

5. **Commit and push**:
   ```bash
   git add public/data/sites/*.json
   git commit -m "chore: update site boundaries from PADUS data"
   git push
   ```

### Option 2: Download Agency-Specific Datasets

#### For National Forests (31 sites)
```bash
# Download USFS boundaries
cd public/data/geojson/sources
wget https://data.fs.usda.gov/geodata/edw/edw_resources/shp/S_USA.AdministrativeForest.zip
unzip S_USA.AdministrativeForest.zip
ogr2ogr -f GeoJSON national-forests.geojson S_USA.AdministrativeForest.shp -t_srs EPSG:4326
```

#### For Wildlife Refuges (13 sites)
```bash
# Download USFWS boundaries from their open data portal
# Visit: https://gis-fws.opendata.arcgis.com/datasets/fws::fws-national-realty-boundaries
# Download as GeoJSON and save as wildlife-refuges.geojson
```

#### For NPS Units (4 preserves)
```bash
# Download NPS boundaries
curl "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/\
NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?\
where=1=1&outFields=*&outSR=4326&f=geojson" > nps-units.geojson
```

Then run the extraction script as in Option 1.

## Sites Needing Updates (49 total)

### National Forests (31 sites) - Medium Quality
- angelina-nf, apache-sitgreaves-nf, apalachicola-nf
- beaverhead-deerlodge-nf, bighorn-nf, bridger-teton-nf
- caribou-targhee-nf, chugach-nf, coconino-nf, coronado-nf
- custer-gallatin-nf, davy-crockett-nf, flathead-nf
- helena-lewis-clark-nf, inyo-nf, kaibab-nf, kootenai-nf
- lewis-and-clark-nf, lolo-nf, medicine-bow-routt-nf
- ocala-nf, prescott-nf, sabine-nf, sam-houston-nf
- san-bernardino-nf, sequoia-nf, shoshone-nf, sierra-nf
- tongass-nf, tonto-nf

### Wildlife Refuges (13 sites) - Medium Quality
- aransas-nwr, arctic-nwr, buenos-aires-nwr
- ding-darling-nwr, florida-panther-nwr, laguna-atascosa-nwr
- loxahatchee-nwr, merritt-island-nwr, national-elk-refuge
- seedskadee-nwr, st-marks-nwr, ten-thousand-islands-nwr
- yukon-delta-nwr

### Other Sites (5 sites) - Medium Quality
- big-cypress-national-preserve, big-thicket-national-preserve
- flaming-gorge-nra, mojave-national-preserve, padre-island-ns

## Extraction Script Details

The `scripts/extract-boundaries-from-sources.cjs` script:
1. Reads GeoJSON files from `public/data/geojson/sources/`
2. Matches features by name to sites in `public/data/sites/`
3. Extracts polygon geometries
4. Updates site JSON files with:
   - Real polygon geometry
   - `dataQuality: "high"`
   - `geometrySource: "[Source Name]"`
   - Current date in `lastUpdated`
5. Removes `approximateArea` flag

## Verification

After running the extraction:

```bash
# Check updated sites
grep -l '"dataQuality": "high"' public/data/sites/*.json | wc -l

# Verify a specific site
jq '.metadata' public/data/sites/angeles-nf.json

# Should show:
# {
#   "dataQuality": "high",
#   "geometrySource": "USFS National Forests Dataset",
#   "lastUpdated": "2025-10-18"
# }
```

## Build and Test

```bash
# Build the application
npm run build

# Test locally
npm run dev
# Visit http://localhost:5173 and verify polygons render correctly
```

## Committing Updates

```bash
# Check what changed
git status public/data/sites/

# Review a few changes
git diff public/data/sites/angeles-nf.json

# Add all updated site files
git add public/data/sites/*.json

# Commit with descriptive message
git commit -m "chore: update [X] site boundaries from official sources

Updated sites:
- [List of sites updated]

Data sources:
- USFS: National Forest boundaries
- USFWS: Wildlife Refuge boundaries
- NPS: Park unit boundaries"

# Push to repository
git push
```

## Scheduled Updates

Since automated fetching doesn't work, consider:

1. **Manual monthly updates**: Download latest datasets monthly and run extraction
2. **Document in issues**: Track which sites have been updated
3. **Batch updates**: Update sites by state or agency for efficiency

## Alternative: Query Individual Sites

If you need to update just a few sites and have reliable internet:

```bash
# Query specific forest directly from API
curl "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?\
where=FORESTNAME='Angeles National Forest'&\
outFields=*&\
outSR=4326&\
f=geojson" > angeles-nf-boundary.json

# Extract geometry and update site file
jq '.features[0].geometry' angeles-nf-boundary.json > geometry.json
# Manually update public/data/sites/angeles-nf.json with this geometry
```

## Troubleshooting

### Downloads Fail
- Check internet connection
- Try alternative sources (USGS, agency open data portals)
- Download during off-peak hours

### Extraction Script Finds No Matches
- Check feature name spelling in source data
- Update matching logic in script for variations
- Use case-insensitive matching

### Geometry Too Large
- Simplify polygons: `node scripts/simplify-geojson.cjs input.json output.json 0.001`
- Keep original data archived
- Use appropriate tolerance for web rendering

## Resources

- **PADUS Data**: https://www.sciencebase.gov/catalog/item/626f6d39d34e915b67c3f3c6
- **USFS Data**: https://data.fs.usda.gov/geodata/
- **USFWS Data**: https://gis-fws.opendata.arcgis.com/
- **NPS Data**: https://public-nps.opendata.arcgis.com/
- **Full Guide**: See `HOW_TO_GET_REAL_BOUNDARIES.md`

## Next Steps

Once you've updated sites locally and committed them:
1. The deployment workflow will build with the updated data
2. No more failed API fetching attempts
3. Site quality will improve from "medium" to "high"
4. Polygons will render more accurately on the map

---

**Note**: The deployment workflow no longer attempts automatic API fetching. All boundary updates must be done manually using this process.
