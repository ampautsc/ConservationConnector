# Conservation Areas Data

This directory contains conservation area data for the Conservation Connector application.

## Files

- `conservation-areas.json` - Pre-loaded conservation areas that appear on the map

## Submitted Areas

When users submit new conservation areas through the application, they will be downloaded as JSON files with the following naming convention:

```
new-conservation-areas-{timestamp}.json
```

These files can be reviewed and manually added to `conservation-areas.json` to make them permanent.

## Data Format

Each conservation area should have the following properties:

```json
{
  "id": "unique-identifier",
  "name": "Conservation Area Name",
  "lat": 44.4280,
  "lng": -110.5885,
  "radius": 50000,
  "description": "Description of the conservation area"
}
```

- **id**: Unique identifier (string)
- **name**: Display name of the conservation area
- **lat**: Latitude coordinate (decimal degrees)
- **lng**: Longitude coordinate (decimal degrees)
- **radius**: Protection radius in meters
- **description**: Brief description of the area

## Adding New Areas

To add new conservation areas to the default set:

1. Open `conservation-areas.json`
2. Add the new area object to the array
3. Ensure the ID is unique
4. Commit the changes to the repository
