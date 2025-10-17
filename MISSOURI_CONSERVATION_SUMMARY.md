# Missouri Conservation Polygons - Project Summary

## Overview

Created a simplified GeoJSON file containing 451 actual conservation areas in Missouri, filtered from the PADUS 3.0 (Protected Areas Database of the United States) dataset.

## Problem Statement

The original PADUS3 files for Missouri contained a mix of:
- Recreation areas (parks, lakes)
- Military land
- Conservation areas
- Easements of various types

The task was to filter these files to include only **actual conservation areas** and create a simplified, web-friendly GeoJSON file for use in mapping applications.

## Solution

### 1. Data Processing Script

Created `scripts/create-mo-conservation-polygons.cjs` that:

1. **Converts coordinates** from ESRI:102039 to WGS84 using ogr2ogr
2. **Filters features** based on:
   - Designation type (wilderness, conservation easements, wildlife refuges, etc.)
   - Unit names (excludes recreation, parks, lakes, military)
   - Minimum size (100 acres)
3. **Merges** data from three PADUS3 source files:
   - PADUS3_0Designation_StateMO.json (168 features)
   - PADUS3_0Easement_StateMO.json (1,114 features)
   - PADUS3_0Proclamation_StateMO.json (36 features)
4. **Simplifies** geometries using Douglas-Peucker algorithm (0.001 degree tolerance)
5. **Generates** final GeoJSON with essential properties

### 2. Output File

**File**: `public/data/geojson/mo-conservation-polygons.geojson`

**Statistics**:
- Size: 1.59 MB
- Features: 451 conservation areas
- Coordinates: 13,586 points (82.5% reduction)
- Format: GeoJSON FeatureCollection (WGS84)

**Quality Metrics**:
- ✅ Valid GeoJSON structure
- ✅ Proper WGS84 coordinates
- ✅ All areas >= 100 acres
- ✅ Correctly sorted by size (largest first)
- ✅ Essential properties preserved

### 3. Documentation

Created comprehensive documentation:

1. **README.md** - Updated with Missouri conservation data section
2. **USAGE.md** - Complete usage guide with code examples
   - JavaScript loading examples
   - Leaflet integration
   - React Leaflet integration
   - Filtering examples
   - Performance tips

## Results

### Filtered Data Breakdown

**Original**: 1,318 features across all PADUS3 files
**Filtered**: 451 conservation areas (34% kept)

**By Designation Type**:
- Conservation Easement: 418 areas (92.7%)
- Approved or Proclamation Boundary: 13 areas (2.9%)
- State Conservation Area: 9 areas (2.0%)
- Wilderness Area: 8 areas (1.8%)
- Wild and Scenic River: 1 area (0.2%)
- Unknown Easement: 1 area (0.2%)
- National Monument: 1 area (0.2%)

**By Size Range**:
- 100-500 acres: 341 areas (75.6%)
- 500-1,000 acres: 55 areas (12.2%)
- 1,000-5,000 acres: 36 areas (8.0%)
- 5,000-10,000 acres: 11 areas (2.4%)
- 10,000+ acres: 8 areas (1.8%)

### Top 20 Conservation Areas

| Rank | Name | Acres | Type |
|------|------|-------|------|
| 1 | Mark Twain National Forest | 3,044,784 | National Forest |
| 2 | Big Muddy National Fish And Wildlife Refuge | 823,214 | Wildlife Refuge |
| 3 | Ozark National Scenic Riverway | 82,332 | Scenic Riverway |
| 4 | Mingo National Wildlife Refuge | 21,699 | Wildlife Refuge |
| 5 | Irish Wilderness | 16,509 | Wilderness |
| 6 | Eleven Point, Missouri Wild and Scenic River | 15,418 | Wild & Scenic River |
| 7 | Middle Mississippi River National Wildlife Refuge | 12,465 | Wildlife Refuge |
| 8 | Hercules-Glades Wilderness | 12,425 | Wilderness |
| 9 | Marais Des Cygnes National Wildlife Refuge | 9,759 | Wildlife Refuge |
| 10 | Bell Mountain Wilderness | 9,183 | Wilderness |
| 11 | Piney Creek Wilderness | 8,184 | Wilderness |
| 12 | Mingo National Wildlife Refuge Wilderness Area | 7,890 | Wilderness |
| 13 | Loess Bluffs National Wildlife Refuge | 7,839 | Wildlife Refuge |
| 14 | Wetlands Reserve Program (WRP), Vernon, MO | 7,298 | Conservation Easement |
| 15 | Paddy Creek Wilderness | 7,080 | Wilderness |
| 16 | Current River Easement | 6,893 | Conservation Easement |
| 17 | Devils Backbone Wilderness | 6,691 | Wilderness |
| 18 | Great River National Wildlife Refuge | 5,820 | Wildlife Refuge |
| 19 | Wetlands Reserve Program (WRP), Pemiscot, MO | 5,673 | Conservation Easement |
| 20 | Clarence Cannon National Wildlife Refuge | 4,780 | Wildlife Refuge |

### What Was Excluded

The filtering process excluded:

- **State Recreation Areas** (82 areas) - Primarily for recreation, not conservation
- **Recreation Management Areas** (15 areas) - Focus on recreation
- **Local Recreation Areas** (9 areas) - Parks and recreation facilities
- **Local Parks** (1 area) - Municipal parks
- **Military Land** (13 areas) - Fort Leonard Wood and other military installations
- **Lakes and Reservoirs** - Table Rock Lake, Harry S. Truman Lake, etc.
- **Experimental Forests** - Research areas not focused on conservation

## Technical Implementation

### Coordinate Transformation

The PADUS3 files use **ESRI:102039** projection:
- USA Contiguous Albers Equal Area Conic
- Parameters: lat_0=23, lon_0=-96, lat_1=29.5, lat_2=45.5

Converted to **WGS84 (EPSG:4326)** using ogr2ogr for accurate web mapping.

### Simplification

Applied Douglas-Peucker algorithm with:
- **Tolerance**: 0.001 degrees (~111 meters)
- **Result**: 82.5% coordinate reduction
- **Quality**: Maintains visual fidelity at all zoom levels

### Data Structure

Each feature includes:
```json
{
  "type": "Feature",
  "properties": {
    "name": "Conservation area name",
    "designation": "Type of designation",
    "owner": "Land owner",
    "manager": "Managing organization",
    "acres": 1234,
    "state": "MO",
    "access": "Access level",
    "gapStatus": "GAP analysis status",
    "category": "Feature category"
  },
  "geometry": {
    "type": "Polygon" or "MultiPolygon",
    "coordinates": [...]
  }
}
```

## Usage

The file is ready for immediate use in web mapping applications:

```javascript
// Load with fetch
fetch('public/data/geojson/mo-conservation-polygons.geojson')
  .then(response => response.json())
  .then(data => {
    // Use with Leaflet, MapLibre, etc.
    L.geoJSON(data).addTo(map);
  });
```

See `USAGE.md` for complete examples.

## Script Usage

To regenerate or customize the output:

```bash
# Default settings (100 acre minimum, 0.001 tolerance)
node scripts/create-mo-conservation-polygons.cjs

# Custom minimum size and tolerance
node scripts/create-mo-conservation-polygons.cjs 50 0.002

# Larger areas only with less simplification
node scripts/create-mo-conservation-polygons.cjs 500 0.0005
```

## Dependencies

- **Node.js** - For running the script
- **GDAL/ogr2ogr** - For coordinate transformation
- **PADUS 3.0 data** - Source data (already in repository)

## Data Sources

- **PADUS 3.0**: Protected Areas Database of the United States
- **USGS**: U.S. Geological Survey
- **Date**: October 2025

## License

The PADUS 3.0 data is in the public domain. When using this derived data, please attribute:
- U.S. Geological Survey
- PADUS 3.0 (Protected Areas Database of the United States)

## Files Created

1. `public/data/geojson/mo-conservation-polygons.geojson` - The main output file
2. `scripts/create-mo-conservation-polygons.cjs` - Processing script
3. `public/data/geojson/USAGE.md` - Usage guide and examples
4. `public/data/geojson/README.md` - Updated with MO conservation section

## Validation

All outputs have been validated:
- ✅ Valid JSON structure
- ✅ Valid GeoJSON format
- ✅ Coordinates in correct range for Missouri
- ✅ All features have required properties
- ✅ File size optimized for web delivery
- ✅ Builds successfully
- ✅ No linting errors

## Next Steps (Optional Enhancements)

Future improvements could include:

1. **Additional filters** - Allow filtering by GAP status, access level, etc.
2. **Multi-state support** - Extend to neighboring states
3. **Interactive filtering** - Web UI to customize output
4. **Tile generation** - Create vector tiles for even better performance
5. **Metadata enrichment** - Add links to managing agencies, visitor info, etc.

---

**Generated**: October 17, 2025  
**Status**: ✅ Complete and Ready for Use
