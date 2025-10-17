# Source Data Files Directory

This directory is for placing downloaded boundary data files that will be processed to extract polygon geometries for conservation sites.

## Purpose

The extraction script (`scripts/extract-boundaries-from-sources.cjs`) processes GeoJSON files placed in this directory to update conservation site files with accurate polygon boundaries.

## Required Files

Place the following downloaded files here:

### 1. National Forest Boundaries
**Filename**: `national-forests.geojson`
**Source**: US Forest Service
**Download**: https://data.fs.usda.gov/geodata/edw/edw_resources/fc/S_USA.AdministrativeForest.zip
**Format**: Convert shapefile to GeoJSON using ogr2ogr

```bash
# Download and convert
wget https://data.fs.usda.gov/geodata/edw/edw_resources/fc/S_USA.AdministrativeForest.zip
unzip S_USA.AdministrativeForest.zip
ogr2ogr -f GeoJSON national-forests.geojson S_USA.AdministrativeForest.shp -t_srs EPSG:4326
mv national-forests.geojson public/data/geojson/sources/
```

### 2. National Wildlife Refuge Boundaries
**Filename**: `wildlife-refuges.geojson`
**Source**: US Fish and Wildlife Service
**Download**: https://www.fws.gov/dataset/national-wildlife-refuge-boundaries
**Alternative**: https://gis-fws.opendata.arcgis.com/datasets/fws::fws-national-realty-boundaries

```bash
# Download from USFWS GIS portal and convert if needed
ogr2ogr -f GeoJSON wildlife-refuges.geojson FWS_National_Realty_Boundaries.shp -t_srs EPSG:4326
mv wildlife-refuges.geojson public/data/geojson/sources/
```

### 3. NPS Units (Optional)
**Filename**: `nps-units.geojson`
**Source**: National Park Service
**Download**: https://public-nps.opendata.arcgis.com/
**Note**: National Parks are already completed, but this can provide data for Preserves, Seashores, etc.

### 4. PADUS State Files (Alternative)
As an alternative to downloading individual agency files, you can download state-specific PADUS datasets that include all designation types:

**Filename Pattern**: `padus-{state}.geojson`
**Source**: USGS PADUS 3.0
**Download**: https://www.sciencebase.gov/catalog/item/626f6d39d34e915b67c3f3c6

## Processing

After placing files in this directory, run the extraction script:

```bash
node scripts/extract-boundaries-from-sources.cjs
```

The script will:
1. Read all GeoJSON files in this directory
2. Match features to conservation sites based on name and designation
3. Extract polygon geometries
4. Update site JSON files with accurate boundaries
5. Set data quality to "high" in metadata

## File Size Considerations

These source files can be very large (100MB+). They are:
- **Not tracked in git** (listed in .gitignore)
- **Only needed temporarily** (can be deleted after processing)
- **Downloaded on-demand** when boundary updates are needed

## Simplification

If source polygons are very detailed and result in large site files, consider simplifying them:

```bash
node scripts/simplify-geojson.cjs input.geojson output.geojson 0.001
```

The tolerance of 0.001 degrees (~111 meters) provides good visual accuracy while reducing file size.

## See Also

- [BOUNDARY_DATA_NEEDED.md](../../../../BOUNDARY_DATA_NEEDED.md) - Detailed list of sites needing data
- [DATA_SOURCES.md](../../../../DATA_SOURCES.md) - Comprehensive data source documentation
- [scripts/extract-boundaries-from-sources.cjs](../../../../scripts/extract-boundaries-from-sources.cjs) - Extraction script
