# Using Missouri Conservation Polygons

This guide shows how to use the `mo-conservation-polygons.geojson` file in your mapping applications.

## File Overview

The file contains 451 Missouri conservation areas with simplified polygon geometries:

- **File Size**: 1.59 MB
- **Features**: 451 conservation areas
- **Coordinate System**: WGS84 (EPSG:4326)
- **Format**: GeoJSON FeatureCollection

## Quick Start

### Loading in JavaScript

```javascript
// Using fetch API
fetch('public/data/geojson/mo-conservation-polygons.geojson')
  .then(response => response.json())
  .then(data => {
    console.log(`Loaded ${data.features.length} conservation areas`);
    
    // Process features
    data.features.forEach(feature => {
      const props = feature.properties;
      console.log(`${props.name} - ${props.acres} acres (${props.designation})`);
    });
  });
```

### Loading with Leaflet

```javascript
import L from 'leaflet';

// Create map
const map = L.map('map').setView([38.5, -92.5], 7);

// Add base layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load and display conservation areas
fetch('public/data/geojson/mo-conservation-polygons.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: function(feature) {
        // Color by designation type
        const colors = {
          'Wilderness Area': '#2E7D32',
          'Conservation Easement': '#388E3C',
          'State Conservation Area': '#4CAF50',
          'Approved or Proclamation Boundary': '#66BB6A'
        };
        return {
          color: colors[feature.properties.designation] || '#81C784',
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.3
        };
      },
      onEachFeature: function(feature, layer) {
        // Add popup with conservation area info
        const props = feature.properties;
        layer.bindPopup(`
          <h3>${props.name}</h3>
          <p><strong>Type:</strong> ${props.designation}</p>
          <p><strong>Size:</strong> ${props.acres.toLocaleString()} acres</p>
          <p><strong>Manager:</strong> ${props.manager}</p>
          <p><strong>Access:</strong> ${props.access}</p>
        `);
      }
    }).addTo(map);
  });
```

### Loading with React Leaflet

```javascript
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import { useEffect, useState } from 'react';

function ConservationMap() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch('public/data/geojson/mo-conservation-polygons.geojson')
      .then(response => response.json())
      .then(data => setGeoData(data));
  }, []);

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    layer.bindPopup(`
      <h3>${props.name}</h3>
      <p><strong>Size:</strong> ${props.acres.toLocaleString()} acres</p>
      <p><strong>Type:</strong> ${props.designation}</p>
    `);
  };

  return (
    <MapContainer center={[38.5, -92.5]} zoom={7} style={{ height: '600px' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© OpenStreetMap contributors'
      />
      {geoData && <GeoJSON data={geoData} onEachFeature={onEachFeature} />}
    </MapContainer>
  );
}
```

## Feature Properties

Each conservation area feature includes these properties:

```javascript
{
  "name": "Mark Twain National Forest",
  "designation": "Approved or Proclamation Boundary",
  "owner": "Designation",
  "manager": "Forest Service",
  "acres": 3044784,
  "state": "MO",
  "access": "Unknown",
  "gapStatus": "4 - no known mandate for biodiversity protection",
  "category": "Approved, Proclamation or Extent Boundary"
}
```

### Property Descriptions

- **name**: Official name of the conservation area
- **designation**: Type of protected area (e.g., "Wilderness Area", "Conservation Easement")
- **owner**: Organization or entity that owns the land
- **manager**: Organization that manages the area
- **acres**: Area size in acres
- **state**: State code (always "MO" for this dataset)
- **access**: Public access level (e.g., "Open Access", "Restricted Access", "Unknown")
- **gapStatus**: GAP analysis protection status (1-4, with 1 being highest protection)
- **category**: Feature category from PADUS database

## Filtering Examples

### By Size

```javascript
// Get areas larger than 10,000 acres
const largeAreas = data.features.filter(f => f.properties.acres >= 10000);
console.log(`Found ${largeAreas.length} large conservation areas`);
```

### By Designation Type

```javascript
// Get only wilderness areas
const wildernessAreas = data.features.filter(
  f => f.properties.designation === 'Wilderness Area'
);
console.log(`Found ${wildernessAreas.length} wilderness areas`);
```

### By Manager

```javascript
// Get National Wildlife Refuges (managed by Fish and Wildlife Service)
const nwrs = data.features.filter(
  f => f.properties.manager.includes('Fish and Wildlife')
);
console.log(`Found ${nwrs.length} National Wildlife Refuges`);
```

## Performance Tips

1. **Use Simplification**: The data is already simplified, but you can simplify further for smaller zoom levels
2. **Layer Control**: Allow users to toggle conservation areas on/off
3. **Clustering**: Consider using marker clustering for point-based representations
4. **Lazy Loading**: Load the file only when needed, not on initial page load
5. **Caching**: Cache the GeoJSON data in the browser to avoid repeated fetches

## Top Conservation Areas

The largest conservation areas in Missouri (by acreage):

1. Mark Twain National Forest - 3,044,784 acres
2. Big Muddy National Fish and Wildlife Refuge - 823,214 acres
3. Ozark National Scenic Riverway - 82,332 acres
4. Mingo National Wildlife Refuge - 21,699 acres
5. Irish Wilderness - 16,509 acres
6. Eleven Point, Missouri Wild and Scenic River - 15,418 acres
7. Middle Mississippi River National Wildlife Refuge - 12,465 acres
8. Hercules-Glades Wilderness - 12,425 acres

## Data Sources

- PADUS 3.0 (Protected Areas Database of the United States)
- U.S. Geological Survey (USGS)
- Generated on October 17, 2025

## Regenerating the File

To regenerate this file with different parameters:

```bash
# Minimum 100 acres, tolerance 0.001 (default)
node scripts/create-mo-conservation-polygons.cjs 100 0.001

# Minimum 50 acres, higher simplification
node scripts/create-mo-conservation-polygons.cjs 50 0.002

# Minimum 500 acres, less simplification
node scripts/create-mo-conservation-polygons.cjs 500 0.0005
```

Parameters:
- **min-acres**: Minimum area size to include (default: 100)
- **tolerance**: Douglas-Peucker simplification tolerance in degrees (default: 0.001)

Higher tolerance = more simplification = smaller file size = less detail

## License

This data is derived from PADUS 3.0, which is in the public domain. Please attribute the U.S. Geological Survey when using this data.
