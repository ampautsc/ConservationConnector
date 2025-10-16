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
- Areas are provided in square kilometers for consistency
- Descriptions are kept concise while highlighting key features
