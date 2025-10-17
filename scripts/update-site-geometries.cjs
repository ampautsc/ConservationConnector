#!/usr/bin/env node

/**
 * Update conservation site JSON files with accurate polygon geometries
 * 
 * This script:
 * 1. Loads existing site JSON files with Point geometries
 * 2. Matches them with polygon data from us-national-parks-polygons.geojson
 * 3. Updates the geometry field with accurate Polygon/MultiPolygon data
 */

const fs = require('fs');
const path = require('path');

// Paths
const sitesDir = path.join(__dirname, '../public/data/sites');
const parksPolygonsPath = path.join(__dirname, '../public/data/geojson/us-national-parks-polygons.geojson');

// Name mapping for parks that have different naming conventions
const nameMapping = {
  'sequoia-kings-canyon-np': ['Sequoia National Park', 'Kings Canyon National Park'],
  'wrangell-st-elias-np': 'Wrangell-St. Elias National Park',
  'gates-of-arctic-np': 'Gates of the Arctic National Park',
  'glacier-bay-np': 'Glacier Bay National Park',
  'lake-clark-np': 'Lake Clark National Park',
  'katmai-np': 'Katmai National Park',
  'denali-np': 'Denali National Park',
  'yellowstone-np': 'Yellowstone National Park',
  'grand-teton-np': 'Grand Teton National Park',
  'glacier-np': 'Glacier National Park',
  'grand-canyon-np': 'Grand Canyon National Park',
  'yosemite-np': 'Yosemite National Park',
  'death-valley-np': 'Death Valley National Park',
  'joshua-tree-np': 'Joshua Tree National Park',
  'everglades-np': 'Everglades National Park',
  'big-bend-np': 'Big Bend National Park',
  'guadalupe-mountains-np': 'Guadalupe Mountains National Park',
  'petrified-forest-np': 'Petrified Forest National Park',
  'saguaro-np': 'Saguaro National Park'
};

console.log('Conservation Site Geometry Updater');
console.log('===================================\n');

// Load parks polygons data
console.log(`Loading polygon data from: ${parksPolygonsPath}`);
let parksPolygons;
try {
  const data = fs.readFileSync(parksPolygonsPath, 'utf8');
  parksPolygons = JSON.parse(data);
  console.log(`✓ Loaded ${parksPolygons.features.length} park polygons\n`);
} catch (error) {
  console.error(`✗ Error loading parks polygons: ${error.message}`);
  process.exit(1);
}

// Create a map of park names to features for quick lookup
const parksByName = new Map();
parksPolygons.features.forEach(feature => {
  parksByName.set(feature.properties.name, feature);
});

// Process site files
console.log('Processing site files...\n');

let totalProcessed = 0;
let totalUpdated = 0;
let totalSkipped = 0;
let errors = [];

// Get all JSON files in sites directory
const files = fs.readdirSync(sitesDir)
  .filter(file => file.endsWith('.json') && file !== 'README.md');

files.forEach(filename => {
  const siteId = filename.replace('.json', '');
  const filePath = path.join(sitesDir, filename);
  
  try {
    // Load site data
    const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    totalProcessed++;
    
    // Check if this is a national park we can update
    if (!siteId.endsWith('-np')) {
      totalSkipped++;
      return; // Skip non-national parks for now
    }
    
    // Get the expected park name(s)
    const parkNames = nameMapping[siteId];
    if (!parkNames) {
      console.log(`⚠ No name mapping for: ${siteId}`);
      totalSkipped++;
      return;
    }
    
    // Handle both single name and array of names (for combined parks)
    const names = Array.isArray(parkNames) ? parkNames : [parkNames];
    
    // Find matching polygon feature(s)
    const matchingFeatures = names
      .map(name => parksByName.get(name))
      .filter(f => f !== undefined);
    
    if (matchingFeatures.length === 0) {
      console.log(`⚠ No polygon data found for: ${siteId} (${names.join(', ')})`);
      totalSkipped++;
      return;
    }
    
    // Update geometry
    if (matchingFeatures.length === 1) {
      // Single park - use its geometry directly
      siteData.geometry = matchingFeatures[0].geometry;
    } else {
      // Multiple parks (like Sequoia & Kings Canyon) - combine into MultiPolygon
      const coordinates = matchingFeatures.map(f => {
        if (f.geometry.type === 'Polygon') {
          return [f.geometry.coordinates];
        } else if (f.geometry.type === 'MultiPolygon') {
          return f.geometry.coordinates;
        }
      }).flat();
      
      siteData.geometry = {
        type: 'MultiPolygon',
        coordinates: coordinates
      };
    }
    
    // Update metadata
    siteData.metadata = siteData.metadata || {};
    siteData.metadata.dataQuality = 'high';
    siteData.metadata.geometrySource = 'National Park Service via PADUS 3.0';
    siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    
    // Write updated data back to file
    fs.writeFileSync(filePath, JSON.stringify(siteData, null, 2) + '\n');
    
    console.log(`✓ Updated ${siteId} with ${siteData.geometry.type} geometry`);
    totalUpdated++;
    
  } catch (error) {
    errors.push({ file: filename, error: error.message });
    console.error(`✗ Error processing ${filename}: ${error.message}`);
  }
});

// Summary
console.log('\n===================================');
console.log('Summary:');
console.log(`  Total files processed: ${totalProcessed}`);
console.log(`  Successfully updated: ${totalUpdated}`);
console.log(`  Skipped (not national parks): ${totalSkipped}`);
console.log(`  Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(({ file, error }) => {
    console.log(`  ${file}: ${error}`);
  });
}

console.log('\n===================================');
console.log('Next steps:');
console.log('  1. Review updated files to verify geometry accuracy');
console.log('  2. Source polygon data for National Forests from USFS');
console.log('  3. Source polygon data for Wildlife Refuges from USFWS');
console.log('  4. Consider using PADUS 3.0 for comprehensive coverage');
console.log('===================================\n');
