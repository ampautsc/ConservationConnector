# GeoJSON Data

This directory contains GeoJSON data files for conservation areas.

## Files

### us-national-parks.geojson

Contains comprehensive data for 63 US National Parks in GeoJSON format.

**Format**: GeoJSON FeatureCollection

**Features include:**
- `name`: Official park name
- `state`: State(s) where the park is located
- `established`: Year the park was established
- `area_km2`: Park area in square kilometers
- `description`: Brief description of the park's features
- `coordinates`: [longitude, latitude] in decimal degrees

**Data Source**: Compiled from official National Park Service information.

**Last Updated**: October 2024

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
