# Data Sources for Conservation Area Boundaries

This document outlines the authoritative data sources for obtaining accurate GeoJSON polygon boundaries for conservation areas.

## Current Status

### ✅ Completed (19 sites)
- **National Parks**: Updated with polygon data from `us-national-parks-polygons.geojson`
- Source: National Park Service via PADUS 3.0
- Quality: High-quality polygon boundaries

### ⏳ Remaining (60 sites)

The following designation types still need polygon boundary data:

1. **National Forests** (30+ sites)
2. **National Wildlife Refuges** (10+ sites)
3. **National Preserves** (2 sites)
4. **Wilderness Areas** (4 sites)
5. **Wild and Scenic Rivers** (2 sites)
6. **National Recreation Areas** (1 site)
7. **National Scenic Riverways** (1 site)
8. **National Seashores** (1 site)

## Recommended Data Sources

### 1. PADUS (Protected Areas Database of the United States) - PRIMARY SOURCE ⭐

**URL**: https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-download

**Coverage**: Comprehensive database covering all federal, state, and local protected areas in the United States

**Data Available**:
- National Forests (USFS)
- National Wildlife Refuges (USFWS)
- National Parks (NPS) - already completed
- Bureau of Land Management areas
- State and local conservation areas

**Format**: Available in multiple formats including:
- GeoJSON
- Shapefile
- Geodatabase
- KML

**Download Options**:
1. **National Dataset**: Complete PADUS database (large file, ~2-3 GB)
2. **State-by-State**: Individual state datasets (recommended for our needs)
3. **Feature Service**: ESRI REST API for programmatic access

**API Access**: 
- ESRI Feature Service: https://gapanalysis.usgs.gov/padus/data/download/
- REST endpoint available for filtered queries

**Advantages**:
- Official government source
- Regularly updated
- Includes all federal lands
- Well-maintained geometry
- Free and public domain

### 2. US Forest Service Data

**URL**: https://data.fs.usda.gov/geodata/

**Specific Dataset**: "National Forest System Boundaries"
- Direct download: https://data.fs.usda.gov/geodata/edw/datasets.php

**Coverage**: All US National Forests

**Format**: Shapefile, KML, GeoJSON

### 3. US Fish and Wildlife Service

**URL**: https://www.fws.gov/gis/data/

**Dataset**: "National Wildlife Refuge Boundaries"

**Coverage**: All National Wildlife Refuges

**Format**: Shapefile, GeoJSON

### 4. Bureau of Land Management

**URL**: https://navigator.blm.gov/data

**Coverage**: BLM-managed lands, wilderness areas

### 5. National Park Service (Already Completed)

**URL**: https://public-nps.opendata.arcgis.com/

**Status**: ✅ Already sourced and integrated

## Implementation Plan

### Option A: Download Full PADUS Dataset (Recommended)

**Steps**:
1. Download PADUS 3.0 GeoJSON for states we need:
   - Alaska (AK)
   - California (CA)
   - Florida (FL)
   - Montana (MT)
   - Wyoming (WY)
   - Texas (TX)
   - Arizona (AZ)
   - Missouri (MO) - already have this
   - Idaho (ID)
   - Colorado (CO)
   - New Mexico (NM)
   - Utah (UT)
   - South Dakota (SD)

2. Filter for specific sites by:
   - Name matching
   - Designation type
   - Geographic coordinates

3. Extract polygon geometry for each site

4. Update site JSON files with accurate boundaries

**Advantages**:
- Single authoritative source
- Consistent data quality
- Includes all designation types
- Already used for Missouri data

**Script**: `scripts/update-from-padus.cjs` (to be created)

### Option B: Source from Individual Agency APIs

Download from each agency separately:
- USFS for National Forests
- USFWS for Wildlife Refuges
- NPS for remaining parks/preserves

**Advantages**:
- Most current data from source agencies
- Can verify against primary sources

**Disadvantages**:
- Multiple data sources to manage
- Different formats and schemas
- More complex integration

## Next Steps

1. **Immediate**: Download PADUS 3.0 state datasets for our 8 states
2. **Filter**: Extract boundaries for our 60 remaining sites
3. **Update**: Run updated script to integrate polygon data
4. **Validate**: Check geometry accuracy against official sources
5. **Document**: Update metadata with data sources

## Notes

- All data sources are in the public domain (U.S. government work)
- PADUS is updated annually (latest version: 3.0, released 2021)
- Consider simplifying complex polygons to reduce file size (use Douglas-Peucker algorithm, tolerance 0.001)
- Store original high-resolution data separately if needed

## Data Quality Levels

After integration, sites will be marked with data quality:
- **high**: Polygon boundaries from authoritative government sources (PADUS, NPS, USFS, USFWS)
- **medium**: Approximate boundaries or simplified geometry
- **low**: Point coordinates only (legacy, to be upgraded)

## File Size Considerations

- Large polygon datasets should be simplified for web use
- Target: Keep individual site files under 500KB
- Use `scripts/simplify-geojson.cjs` with tolerance 0.001 for simplification
- Store original high-res data in archive if needed

## Contact for Questions

For questions about:
- PADUS data: https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-overview
- USFS data: geodata_admin@fs.fed.us
- USFWS data: https://www.fws.gov/gis/
