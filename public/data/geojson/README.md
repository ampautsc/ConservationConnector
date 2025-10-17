# GeoJSON Data

This directory contains GeoJSON data files for conservation areas.

## Files

### us-national-parks.geojson

Contains comprehensive data for 63 US National Parks in GeoJSON format with point geometries.

**Format**: GeoJSON FeatureCollection

**Features include:**
- `name`: Official park name
- `state`: State(s) where the park is located
- `established`: Year the park was established
- `area_km2`: Park area in square kilometers
- `description`: Brief description of the park's features
- `coordinates`: [longitude, latitude] in decimal degrees

**Data Source**: Compiled from National Park Service official data and public information sources.

**Last Updated**: October 16, 2025

### us-national-parks-polygons.geojson

Contains detailed polygon geometries for 62 US National Parks.

**Format**: GeoJSON FeatureCollection with Polygon and MultiPolygon geometries

**File Stats:**
- Original size: 74.19 MB with 945,654 coordinate points
- Simplified size: 2.00 MB with 24,513 coordinate points
- Reduction: 97.3% using Douglas-Peucker algorithm with tolerance 0.001

**Simplification Details:**

The polygon data was simplified using the Douglas-Peucker algorithm to reduce file size while maintaining visual fidelity. This algorithm removes points that are within a specified tolerance distance from the line segments, preserving the overall shape of the polygons.

**Simplification Parameters:**
- Algorithm: Douglas-Peucker (Ramer-Douglas-Peucker)
- Tolerance: 0.001 degrees (~111 meters at the equator)
- Date: October 16, 2025

To re-simplify or adjust tolerance, use the script:
```bash
node scripts/simplify-geojson.cjs <input> <output> [tolerance]
```

**Features include:**
- `name`: Official park name
- `state`: State(s) where the park is located
- `established`: Year the park was established
- `area_km2`: Park area in square kilometers
- `description`: Brief description of the park's features
- `unit_code`: National Park Service unit code
- `geometry`: Polygon or MultiPolygon representing park boundaries

**Data Source**: Compiled from National Park Service official data and public information sources.

**Last Updated**: October 16, 2025

### mo-conservation-polygons.geojson

Contains simplified polygon geometries for 451 conservation areas in Missouri.

**Format**: GeoJSON FeatureCollection with Polygon and MultiPolygon geometries

**File Stats:**
- Original coordinate points: 77,673 points
- Simplified coordinate points: 13,586 points
- Reduction: 82.5% using Douglas-Peucker algorithm with tolerance 0.001
- File size: 1.59 MB
- Features: 451 conservation areas

**Filtering Criteria:**
- Minimum area: 100 acres
- Excludes: Recreation areas, parks, lakes, military land
- Includes: Conservation areas, wilderness areas, wildlife refuges, national forests, conservation easements, wetland reserves

**Data Processing:**
1. Source files (PADUS3) converted from ESRI:102039 to WGS84 (EPSG:4326) using ogr2ogr
2. Filtered for actual conservation areas (not recreational or military)
3. Filtered for areas >= 100 acres
4. Simplified using Douglas-Peucker algorithm
5. Properties reduced to essential conservation metadata

**Features include:**
- `name`: Conservation area name
- `designation`: Type of conservation designation (e.g., "Wilderness Area", "Conservation Easement")
- `owner`: Land owner description
- `manager`: Managing organization
- `acres`: Area in acres
- `state`: State (MO)
- `access`: Public access level
- `gapStatus`: GAP analysis protection status
- `category`: Feature category
- `geometry`: Polygon or MultiPolygon representing area boundaries

**Top Conservation Areas (by size):**
1. Mark Twain National Forest - 3,044,784 acres
2. Big Muddy National Fish And Wildlife Refuge - 823,214 acres
3. Ozark National Scenic Riverway - 82,332 acres
4. Mingo National Wildlife Refuge - 21,699 acres
5. Irish Wilderness - 16,509 acres
6. Eleven Point, Missouri Wild and Scenic River - 15,418 acres
7. Middle Mississippi River National Wildlife Refuge - 12,465 acres
8. Hercules-Glades Wilderness - 12,425 acres

**Data Source**: PADUS 3.0 (Protected Areas Database of the United States)
- PADUS3_0Designation_StateMO.json
- PADUS3_0Easement_StateMO.json
- PADUS3_0Proclamation_StateMO.json

**Generation Script**: Use `scripts/create-mo-conservation-polygons.cjs` to regenerate:
```bash
node scripts/create-mo-conservation-polygons.cjs [min-acres] [tolerance]
# Example: node scripts/create-mo-conservation-polygons.cjs 100 0.001
```

**Last Updated**: October 17, 2025

### PADUS3 Source Files

**Note**: These source files are **NOT included in the repository** due to their large size (20+ MB total). They are only needed if you want to regenerate or modify the `mo-conservation-polygons.geojson` file.

The original PADUS 3.0 data for Missouri includes:

- **PADUS3_0Designation_StateMO.json** (9.5 MB) - State and local conservation/recreation areas
- **PADUS3_0Easement_StateMO.json** (7.1 MB) - Conservation and agricultural easements
- **PADUS3_0Proclamation_StateMO.json** (3.9 MB) - National forests, wildlife refuges, and military lands

**How to obtain**: Use the `scripts/fetch-padus-boundaries.cjs` script to download these files from the USGS PADUS database if needed.

These files use ESRI:102039 projection (USA Contiguous Albers Equal Area Conic) and are converted to WGS84 during processing.

## Usage

The GeoJSON files can be loaded by the application or external GIS tools. The coordinate system used is WGS84 (EPSG:4326).

### Example Structure

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Park Name",
        "state": "ST",
        "established": 1872,
        "area_km2": 8983,
        "description": "Park description"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [-110.5885, 44.4280]
      }
    }
  ]
}
```

## Notes

- All coordinates are stored as [longitude, latitude] following GeoJSON specification
- Areas are provided in square kilometers for national parks, acres for Missouri conservation areas
- Descriptions are kept concise while highlighting key features
