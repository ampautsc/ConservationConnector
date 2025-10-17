#!/usr/bin/env node

/**
 * Update Missouri Conservation Sites with PADUS Boundaries
 * 
 * This script extracts polygon boundaries for Missouri conservation sites
 * from the existing PADUS Missouri datasets.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sitesDir = path.join(__dirname, '../public/data/sites');
const padusProclamation = path.join(__dirname, '../public/data/geojson/PADUS3_0Proclamation_StateMO.json');
const padusDesignation = path.join(__dirname, '../public/data/geojson/PADUS3_0Designation_StateMO.json');

console.log('Missouri Sites Boundary Updater');
console.log('================================\n');

// Missouri sites to update
const missouriSites = {
  'mark-twain-nf': { name: 'Mark Twain National Forest', designation: 'National Forest' },
  'big-muddy-nwr': { name: 'Big Muddy National Fish And Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'ozark-nsr': { name: 'Ozark National Scenic Riverway', designation: 'National Scenic Riverways' },
  'mingo-nwr': { name: 'Mingo National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'irish-wilderness': { name: 'Irish Wilderness', designation: 'Wilderness Area' },
  'hercules-glades-wilderness': { name: 'Hercules-Glades Wilderness', designation: 'Wilderness Area' },
  'piney-creek-wilderness': { name: 'Piney Creek Wilderness', designation: 'Wilderness Area' },
  'swan-lake-nwr': { name: 'Swan Lake National Wildlife Refuge', designation: 'National Wildlife Refuge' }
};

// Note: PADUS files use ESRI:102039 projection and need conversion to WGS84
// We'll need ogr2ogr for proper conversion

console.log('Checking for required tools...');

try {
  execSync('which ogr2ogr', { stdio: 'ignore' });
  console.log('✓ ogr2ogr found\n');
} catch (error) {
  console.log('✗ ogr2ogr not found');
  console.log('\nThis script requires ogr2ogr (part of GDAL) to convert projections.');
  console.log('Install with:');
  console.log('  Ubuntu/Debian: sudo apt-get install gdal-bin');
  console.log('  macOS: brew install gdal');
  console.log('  Or use the existing mo-conservation-polygons.geojson file\n');
  console.log('Alternative: Use the simplified mo-conservation-polygons.geojson file');
  console.log('which already has the data in WGS84 projection.\n');
  process.exit(1);
}

console.log('Converting PADUS Proclamation file to WGS84...');

// Convert to WGS84
const tempFile = path.join(__dirname, '../public/data/geojson/temp-mo-padus-wgs84.geojson');

try {
  execSync(
    `ogr2ogr -f GeoJSON -t_srs EPSG:4326 "${tempFile}" "${padusProclamation}"`,
    { stdio: 'inherit' }
  );
  console.log('✓ Conversion complete\n');
} catch (error) {
  console.error('✗ Conversion failed:', error.message);
  process.exit(1);
}

// Load converted data
console.log('Loading converted data...');
const data = JSON.parse(fs.readFileSync(tempFile, 'utf8'));
console.log(`✓ Loaded ${data.features.length} features\n`);

console.log('Matching and updating sites...\n');

let updated = 0;

for (const [siteId, criteria] of Object.entries(missouriSites)) {
  const siteFile = path.join(sitesDir, `${siteId}.json`);
  
  if (!fs.existsSync(siteFile)) {
    console.log(`⚠ Site file not found: ${siteId}`);
    continue;
  }
  
  // Find matching feature
  const match = data.features.find(feature => {
    const name = (feature.properties.Unit_Nm || '').toLowerCase();
    const criteriaName = criteria.name.toLowerCase();
    return name.includes(criteriaName) || criteriaName.includes(name);
  });
  
  if (!match) {
    console.log(`⚠ No match found for: ${siteId} (${criteria.name})`);
    continue;
  }
  
  // Load and update site data
  const siteData = JSON.parse(fs.readFileSync(siteFile, 'utf8'));
  siteData.geometry = match.geometry;
  siteData.metadata = siteData.metadata || {};
  siteData.metadata.dataQuality = 'high';
  siteData.metadata.geometrySource = 'PADUS 3.0 Missouri Dataset';
  siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Write back
  fs.writeFileSync(siteFile, JSON.stringify(siteData, null, 2) + '\n');
  console.log(`✓ Updated ${siteId}`);
  updated++;
}

// Cleanup
fs.unlinkSync(tempFile);

console.log('\n================================');
console.log(`Summary: Updated ${updated} of ${Object.keys(missouriSites).length} Missouri sites`);
console.log('================================\n');
