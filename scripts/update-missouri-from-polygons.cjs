#!/usr/bin/env node

/**
 * Update Missouri Conservation Sites from Existing Polygon Data
 * 
 * This script extracts polygon boundaries for Missouri conservation sites
 * from the existing mo-conservation-polygons.geojson file.
 */

const fs = require('fs');
const path = require('path');

const sitesDir = path.join(__dirname, '../public/data/sites');
const moPolygons = path.join(__dirname, '../public/data/geojson/mo-conservation-polygons.geojson');

console.log('Missouri Sites Boundary Updater');
console.log('================================\n');

// Missouri sites to update with name matching
const missouriSites = {
  'mark-twain-nf': ['Mark Twain National Forest'],
  'big-muddy-nwr': ['Big Muddy National Fish And Wildlife Refuge'],
  'ozark-nsr': ['Ozark National Scenic Riverway'],
  'mingo-nwr': ['Mingo National Wildlife Refuge'],
  'irish-wilderness': ['Irish Wilderness'],
  'hercules-glades-wilderness': ['Hercules-Glades Wilderness'],
  'piney-creek-wilderness': ['Piney Creek Wilderness'],
  'swan-lake-nwr': ['Swan Lake National Wildlife Refuge', 'Loess Bluffs National Wildlife Refuge'], // Swan Lake was renamed to Loess Bluffs
  'eleven-point-river': ['Eleven Point, Missouri Wild and Scenic River'],
  'middle-mississippi-river-nwr': ['Middle Mississippi River National Wildlife Refuge']
};

console.log('Loading Missouri conservation polygons...');
const data = JSON.parse(fs.readFileSync(moPolygons, 'utf8'));
console.log(`✓ Loaded ${data.features.length} features\n`);

console.log('Matching and updating sites...\n');

let updated = 0;
let notFound = [];

for (const [siteId, searchNames] of Object.entries(missouriSites)) {
  const siteFile = path.join(sitesDir, `${siteId}.json`);
  
  if (!fs.existsSync(siteFile)) {
    console.log(`⚠ Site file not found: ${siteId}`);
    notFound.push(siteId);
    continue;
  }
  
  // Find matching feature(s)
  const matches = data.features.filter(feature => {
    const featureName = (feature.properties.name || '').toLowerCase();
    return searchNames.some(searchName => {
      const search = searchName.toLowerCase();
      // Exact match or contains
      return featureName === search || featureName.includes(search) || search.includes(featureName);
    });
  });
  
  if (matches.length === 0) {
    console.log(`⚠ No match found for: ${siteId} (searched: ${searchNames.join(', ')})`);
    notFound.push(siteId);
    continue;
  }
  
  // Load site data
  const siteData = JSON.parse(fs.readFileSync(siteFile, 'utf8'));
  
  // Update geometry
  if (matches.length === 1) {
    siteData.geometry = matches[0].geometry;
  } else {
    // Multiple matches - combine into MultiPolygon
    const geometries = matches.map(m => m.geometry);
    
    // Check if all are Polygons or MultiPolygons
    const allCoords = [];
    geometries.forEach(geom => {
      if (geom.type === 'Polygon') {
        allCoords.push(geom.coordinates);
      } else if (geom.type === 'MultiPolygon') {
        allCoords.push(...geom.coordinates);
      }
    });
    
    siteData.geometry = {
      type: 'MultiPolygon',
      coordinates: allCoords
    };
  }
  
  // Update metadata
  siteData.metadata = siteData.metadata || {};
  siteData.metadata.dataQuality = 'high';
  siteData.metadata.geometrySource = 'PADUS 3.0 Missouri Dataset (processed)';
  siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Write back
  fs.writeFileSync(siteFile, JSON.stringify(siteData, null, 2) + '\n');
  console.log(`✓ Updated ${siteId} (${matches.length} feature${matches.length > 1 ? 's' : ''})`);
  updated++;
}

console.log('\n================================');
console.log(`Summary:`);
console.log(`  Total Missouri sites: ${Object.keys(missouriSites).length}`);
console.log(`  Successfully updated: ${updated}`);
console.log(`  Not found: ${notFound.length}`);

if (notFound.length > 0) {
  console.log('\nSites not found:');
  notFound.forEach(site => console.log(`  - ${site}`));
}

console.log('================================\n');
