# Conservation Site Data

This directory contains data files for conservation sites across the United States.

## Structure

```
sites/
├── INVENTORY.md              # Master inventory file (human-editable)
├── README.md                 # This file
├── {site-id}.json           # Individual site data files (auto-generated)
└── ...
```

## Data Format

Each site has its own JSON file following the schema defined in `/public/data/schema/conservation-site-schema.json`.

### Example Site Data File

```json
{
  "id": "yellowstone-np",
  "name": "Yellowstone National Park",
  "description": "National Park in WY,MT,ID",
  "location": {
    "lat": 44.428,
    "lng": -110.5885,
    "state": "WY,MT,ID"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-110.5885, 44.428]
  },
  "area": {
    "acres": 2219791,
    "km2": 8983.18,
    "hectares": 898318.34
  },
  "designation": "National Park",
  "metadata": {
    "source": "Conservation Connector Site Inventory",
    "lastUpdated": "2025-10-17",
    "dataQuality": "medium"
  }
}
```

## Workflow

### Adding New Sites

1. **Edit INVENTORY.md**: Add new sites to the inventory file following the existing format
2. **Run the crawler**: The GitHub Action will automatically generate JSON files when the inventory is updated
3. **Manual run**: You can also run the crawler locally:
   ```bash
   node scripts/crawl-conservation-sites.cjs
   ```

### Inventory Format

Sites in INVENTORY.md should follow this format:

```markdown
## State Name (XX)

### Site Name
- **ID**: unique-site-id
- **State**: XX
- **Designation**: Type of protected area
- **Area**: Size in acres or km²
- **Coordinates**: lat, lng
- **Status**: active|pending|archived
```

### Field Requirements

- **ID**: Must be unique, lowercase, kebab-case (e.g., `yellowstone-np`)
- **State**: Two-letter state code(s), comma-separated for multi-state sites (e.g., `WY,MT,ID`)
- **Designation**: Type of conservation area (e.g., "National Park", "Wildlife Refuge")
- **Area**: Size with units (e.g., "2,219,791 acres" or "3,468 sq mi")
- **Coordinates**: Latitude and longitude, comma-separated (e.g., `44.4280, -110.5885`)
- **Status**: Current status - `active`, `pending`, or `archived`

## Automated Crawler

The conservation site crawler runs automatically via GitHub Actions:

- **On push**: When INVENTORY.md or the crawler script changes
- **Manual**: Via workflow_dispatch
- **Weekly**: Every Sunday at midnight UTC

The workflow:
1. Parses INVENTORY.md
2. Generates/updates individual JSON files for each site
3. Validates data against the schema
4. Commits changes back to the repository

See `.github/workflows/conservation-site-crawler.yml` for details.

## Data Schema

All site data files conform to the JSON Schema defined in:
`/public/data/schema/conservation-site-schema.json`

The schema defines:
- Required fields: id, name, location, geometry
- Optional fields: area, designation, manager, access, tags, features, biodiversity, etc.
- Data types and validation rules
- Format specifications for coordinates, dates, URIs, etc.

## Data Sources

Site data is compiled from:
- National Park Service (NPS)
- U.S. Forest Service
- U.S. Fish and Wildlife Service
- Protected Areas Database of the United States (PADUS)
- State and local conservation agencies
- Public information sources

## Usage

These data files can be:
- Loaded by the Conservation Connector map application
- Used by external GIS tools
- Integrated into conservation analysis workflows
- Referenced for conservation planning

## Contributing

To contribute new sites or updates:

1. Edit `INVENTORY.md` with the new site information
2. Ensure all required fields are present and correctly formatted
3. Create a pull request
4. The crawler will validate and generate the data files automatically

## Maintenance

- Site data is automatically regenerated when the inventory changes
- Manual updates to individual JSON files will be overwritten by the crawler
- Always edit INVENTORY.md as the source of truth
- For complex site data (polygons, detailed biodiversity info), edit the generated JSON files and mark them as manually maintained

## Notes

- Coordinates represent approximate center points for display purposes
- Area measurements are approximate and based on official sources
- For detailed boundary data, see `/public/data/geojson/` directory
- Multi-state sites appear under each applicable state in the inventory
