# Conservation Site Data Schema

This directory contains the JSON Schema definition for conservation site data.

## Schema File

- **conservation-site-schema.json**: JSON Schema (draft-07) defining the structure, data types, and validation rules for conservation site data files

## Purpose

The schema ensures consistency and data quality across all conservation site data files in the application. It defines:

1. **Required fields**: id, name, location, geometry
2. **Optional fields**: area, designation, manager, owner, access, tags, features, biodiversity, and more
3. **Data validation**: Types, formats, ranges, patterns
4. **Documentation**: Descriptions and examples for each field

## Schema Overview

### Required Fields

```json
{
  "id": "unique-site-id",
  "name": "Conservation Area Name",
  "location": {
    "lat": 44.4280,
    "lng": -110.5885,
    "state": "WY"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-110.5885, 44.4280]
  }
}
```

### Optional Fields

The schema supports extensive optional fields for rich conservation data:

- **area**: Size in acres, km², and hectares
- **designation**: Type of protected area (National Park, Wildlife Refuge, etc.)
- **manager**: Managing agency and contact information
- **owner**: Land ownership (Federal, State, Private, etc.)
- **established**: Year of establishment
- **access**: Public access information and restrictions
- **tags**: Keywords for categorization
- **features**: Notable natural or cultural features
- **biodiversity**: Ecosystem and species information
- **gapStatus**: GAP analysis protection status (1-4)
- **iucnCategory**: IUCN protected area category (Ia, Ib, II, III, IV, V, VI)
- **website**: Official website URL
- **images**: Image URLs with captions and credits
- **metadata**: Data source, quality, and update information

## Validation

The schema provides validation for:

- **ID format**: Lowercase kebab-case (e.g., `yellowstone-np`)
- **Coordinates**: Latitude (-90 to 90), Longitude (-180 to 180)
- **State codes**: Two-letter format (e.g., `CA`, `WY,MT,ID`)
- **Geometry types**: Point, Polygon, MultiPolygon (GeoJSON standard)
- **Dates**: ISO 8601 format (YYYY-MM-DD)
- **URIs**: Valid URL format for websites and images
- **Enumerations**: Predefined values for access types, GAP status, IUCN categories

## Usage

### With Node.js

```javascript
const Ajv = require('ajv');
const schema = require('./conservation-site-schema.json');

const ajv = new Ajv();
const validate = ajv.compile(schema);

const siteData = {
  id: "yellowstone-np",
  name: "Yellowstone National Park",
  // ... more fields
};

const valid = validate(siteData);
if (!valid) {
  console.log(validate.errors);
}
```

### With Online Validators

You can validate JSON files against this schema using online tools like:
- https://www.jsonschemavalidator.net/
- https://json-schema-validator.herokuapp.com/

## Schema Extensions

To add new fields or modify the schema:

1. Edit `conservation-site-schema.json`
2. Update the schema version or description
3. Test with existing data files
4. Update the crawler script if needed
5. Update documentation

## GeoJSON Compatibility

The geometry field follows the GeoJSON specification (RFC 7946):
- Coordinates are in [longitude, latitude] order
- Supported types: Point, Polygon, MultiPolygon
- Coordinate system: WGS84 (EPSG:4326)

## Data Quality Levels

The schema defines three data quality levels in metadata:

- **high**: Complete, verified data from authoritative sources
- **medium**: Basic information, may lack some optional fields
- **low**: Minimal data, requires verification or enrichment

## Related Files

- `/public/data/sites/INVENTORY.md` - Master inventory (source of truth)
- `/public/data/sites/*.json` - Individual site data files
- `/scripts/crawl-conservation-sites.cjs` - Data crawler script
- `.github/workflows/conservation-site-crawler.yml` - Automation workflow

## Standards and References

The schema incorporates concepts from:

- **GeoJSON**: RFC 7946 for geographic data
- **PADUS**: Protected Areas Database of the United States data model
- **GAP Analysis**: USGS Gap Analysis Program protection status codes
- **IUCN**: International Union for Conservation of Nature protected area categories
- **ISO 8601**: Date and time format standard

## Contributing

When proposing schema changes:

1. Consider backward compatibility
2. Provide clear documentation for new fields
3. Include examples and validation rules
4. Update related documentation
5. Test with real data

## Version History

- **v1.0** (2025-10-17): Initial schema definition with core fields for conservation sites
