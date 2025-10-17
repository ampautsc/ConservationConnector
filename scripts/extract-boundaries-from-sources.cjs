#!/usr/bin/env node

/**
 * Extract Conservation Area Boundaries from Downloaded Data Sources
 * 
 * This script processes downloaded GeoJSON files from various sources
 * (USFS, USFWS, PADUS, NPS) and extracts polygon boundaries for specific sites.
 * 
 * Prerequisites:
 * 1. Download data files as documented in BOUNDARY_DATA_NEEDED.md
 * 2. Place files in public/data/geojson/sources/ directory
 * 3. Run this script to extract and update site files
 * 
 * Usage: node scripts/extract-boundaries-from-sources.cjs
 */

const fs = require('fs');
const path = require('path');

const sitesDir = path.join(__dirname, '../public/data/sites');
const sourcesDir = path.join(__dirname, '../public/data/geojson/sources');

// Ensure sources directory exists
if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
  console.log(`Created sources directory: ${sourcesDir}`);
  console.log('Please place downloaded data files here:');
  console.log('  - national-forests.geojson (from USFS)');
  console.log('  - wildlife-refuges.geojson (from USFWS)');
  console.log('  - nps-units.geojson (from NPS, optional)');
  console.log('  - Or state-specific PADUS files');
  console.log('\nSee BOUNDARY_DATA_NEEDED.md for download instructions.\n');
  process.exit(0);
}

console.log('Conservation Boundary Extractor');
console.log('================================\n');

// Site matching configuration
// Maps site IDs to search criteria for matching in source datasets
const siteMatching = {
  // National Forests
  'angeles-nf': { name: ['Angeles National Forest', 'Angeles NF'], designation: 'National Forest' },
  'angelina-nf': { name: ['Angelina National Forest', 'Angelina NF'], designation: 'National Forest' },
  'apache-sitgreaves-nf': { name: ['Apache-Sitgreaves National Forest', 'Apache-Sitgreaves NF', 'Apache Sitgreaves'], designation: 'National Forest' },
  'apalachicola-nf': { name: ['Apalachicola National Forest', 'Apalachicola NF'], designation: 'National Forest' },
  'beaverhead-deerlodge-nf': { name: ['Beaverhead-Deerlodge National Forest', 'Beaverhead Deerlodge'], designation: 'National Forest' },
  'bighorn-nf': { name: ['Bighorn National Forest', 'Bighorn NF'], designation: 'National Forest' },
  'bridger-teton-nf': { name: ['Bridger-Teton National Forest', 'Bridger Teton'], designation: 'National Forest' },
  'caribou-targhee-nf': { name: ['Caribou-Targhee National Forest', 'Caribou Targhee'], designation: 'National Forest' },
  'chugach-nf': { name: ['Chugach National Forest', 'Chugach NF'], designation: 'National Forest' },
  'coconino-nf': { name: ['Coconino National Forest', 'Coconino NF'], designation: 'National Forest' },
  'coronado-nf': { name: ['Coronado National Forest', 'Coronado NF'], designation: 'National Forest' },
  'custer-gallatin-nf': { name: ['Custer Gallatin National Forest', 'Custer-Gallatin'], designation: 'National Forest' },
  'davy-crockett-nf': { name: ['Davy Crockett National Forest', 'Davy Crockett NF'], designation: 'National Forest' },
  'flathead-nf': { name: ['Flathead National Forest', 'Flathead NF'], designation: 'National Forest' },
  'helena-lewis-clark-nf': { name: ['Helena-Lewis and Clark National Forest', 'Helena Lewis Clark'], designation: 'National Forest' },
  'inyo-nf': { name: ['Inyo National Forest', 'Inyo NF'], designation: 'National Forest' },
  'kaibab-nf': { name: ['Kaibab National Forest', 'Kaibab NF'], designation: 'National Forest' },
  'kootenai-nf': { name: ['Kootenai National Forest', 'Kootenai NF'], designation: 'National Forest' },
  'lewis-and-clark-nf': { name: ['Lewis and Clark National Forest', 'Lewis Clark NF'], designation: 'National Forest' },
  'lolo-nf': { name: ['Lolo National Forest', 'Lolo NF'], designation: 'National Forest' },
  'mark-twain-nf': { name: ['Mark Twain National Forest', 'Mark Twain NF'], designation: 'National Forest' },
  'medicine-bow-routt-nf': { name: ['Medicine Bow-Routt National Forest', 'Medicine Bow Routt'], designation: 'National Forest' },
  'ocala-nf': { name: ['Ocala National Forest', 'Ocala NF'], designation: 'National Forest' },
  'prescott-nf': { name: ['Prescott National Forest', 'Prescott NF'], designation: 'National Forest' },
  'sabine-nf': { name: ['Sabine National Forest', 'Sabine NF'], designation: 'National Forest' },
  'sam-houston-nf': { name: ['Sam Houston National Forest', 'Sam Houston NF'], designation: 'National Forest' },
  'san-bernardino-nf': { name: ['San Bernardino National Forest', 'San Bernardino NF'], designation: 'National Forest' },
  'sequoia-nf': { name: ['Sequoia National Forest', 'Sequoia NF'], designation: 'National Forest' },
  'shoshone-nf': { name: ['Shoshone National Forest', 'Shoshone NF'], designation: 'National Forest' },
  'sierra-nf': { name: ['Sierra National Forest', 'Sierra NF'], designation: 'National Forest' },
  'tongass-nf': { name: ['Tongass National Forest', 'Tongass NF'], designation: 'National Forest' },
  'tonto-nf': { name: ['Tonto National Forest', 'Tonto NF'], designation: 'National Forest' },
  
  // Wildlife Refuges
  'aransas-nwr': { name: ['Aransas National Wildlife Refuge', 'Aransas NWR'], designation: 'National Wildlife Refuge' },
  'arctic-nwr': { name: ['Arctic National Wildlife Refuge', 'Arctic NWR'], designation: 'National Wildlife Refuge' },
  'buenos-aires-nwr': { name: ['Buenos Aires National Wildlife Refuge', 'Buenos Aires NWR'], designation: 'National Wildlife Refuge' },
  'charles-m-russell-nwr': { name: ['Charles M. Russell National Wildlife Refuge', 'CMR NWR'], designation: 'National Wildlife Refuge' },
  'ding-darling-nwr': { name: ['J.N. "Ding" Darling National Wildlife Refuge', 'Ding Darling NWR'], designation: 'National Wildlife Refuge' },
  'florida-panther-nwr': { name: ['Florida Panther National Wildlife Refuge', 'Florida Panther NWR'], designation: 'National Wildlife Refuge' },
  'laguna-atascosa-nwr': { name: ['Laguna Atascosa National Wildlife Refuge', 'Laguna Atascosa NWR'], designation: 'National Wildlife Refuge' },
  'loxahatchee-nwr': { name: ['Arthur R. Marshall Loxahatchee National Wildlife Refuge', 'Loxahatchee NWR'], designation: 'National Wildlife Refuge' },
  'merritt-island-nwr': { name: ['Merritt Island National Wildlife Refuge', 'Merritt Island NWR'], designation: 'National Wildlife Refuge' },
  'big-muddy-nwr': { name: ['Big Muddy National Fish and Wildlife Refuge', 'Big Muddy NWR'], designation: 'National Wildlife Refuge' },
  'mingo-nwr': { name: ['Mingo National Wildlife Refuge', 'Mingo NWR'], designation: 'National Wildlife Refuge' },
  'middle-mississippi-river-nwr': { name: ['Middle Mississippi River National Wildlife Refuge'], designation: 'National Wildlife Refuge' },
  'swan-lake-nwr': { name: ['Swan Lake National Wildlife Refuge', 'Swan Lake NWR'], designation: 'National Wildlife Refuge' },
  'national-elk-refuge': { name: ['National Elk Refuge'], designation: 'National Wildlife Refuge' },
  'seedskadee-nwr': { name: ['Seedskadee National Wildlife Refuge', 'Seedskadee NWR'], designation: 'National Wildlife Refuge' },
  'st-marks-nwr': { name: ['St. Marks National Wildlife Refuge', 'St Marks NWR'], designation: 'National Wildlife Refuge' },
  'ten-thousand-islands-nwr': { name: ['Ten Thousand Islands National Wildlife Refuge'], designation: 'National Wildlife Refuge' },
  'yukon-delta-nwr': { name: ['Yukon Delta National Wildlife Refuge', 'Yukon Delta NWR'], designation: 'National Wildlife Refuge' },
  
  // Other designations
  'big-cypress-national-preserve': { name: ['Big Cypress National Preserve'], designation: 'National Preserve' },
  'big-thicket-national-preserve': { name: ['Big Thicket National Preserve'], designation: 'National Preserve' },
  'mojave-national-preserve': { name: ['Mojave National Preserve'], designation: 'National Preserve' },
  'flaming-gorge-nra': { name: ['Flaming Gorge National Recreation Area'], designation: 'National Recreation Area' },
  'padre-island-ns': { name: ['Padre Island National Seashore'], designation: 'National Seashore' },
  'ozark-nsr': { name: ['Ozark National Scenic Riverways'], designation: 'National Scenic Riverways' },
  'eleven-point-river': { name: ['Eleven Point Wild and Scenic River', 'Eleven Point River'], designation: 'Wild and Scenic River' },
  'hercules-glades-wilderness': { name: ['Hercules Glades Wilderness'], designation: 'Wilderness Area' },
  'irish-wilderness': { name: ['Irish Wilderness'], designation: 'Wilderness Area' },
  'piney-creek-wilderness': { name: ['Piney Creek Wilderness'], designation: 'Wilderness Area' }
};

/**
 * Match a feature from source data to a site
 */
function matchFeature(feature, siteCriteria) {
  const props = feature.properties || {};
  
  // Get various name fields that might exist in the source data
  const featureName = (
    props.name || 
    props.FORESTNAME || 
    props.UNIT_NAME || 
    props.Unit_Nm || 
    props.ORGNAME || 
    props.NAME || 
    ''
  ).toLowerCase();
  
  // Check if any of the expected names match
  return siteCriteria.name.some(expectedName => {
    const expected = expectedName.toLowerCase();
    return featureName.includes(expected) || expected.includes(featureName);
  });
}

/**
 * Process a source GeoJSON file
 */
function processSourceFile(filename, sites) {
  const filePath = path.join(sourcesDir, filename);
  
  if (!fs.existsSync(filePath)) {
    return { processed: 0, updated: 0, errors: [] };
  }
  
  console.log(`\nProcessing: ${filename}`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const features = data.features || [];
    console.log(`  Found ${features.length} features in file`);
    
    let processed = 0;
    let updated = 0;
    const errors = [];
    
    // Try to match each site
    for (const [siteId, criteria] of Object.entries(sites)) {
      const siteFile = path.join(sitesDir, `${siteId}.json`);
      
      if (!fs.existsSync(siteFile)) continue;
      
      // Find matching feature
      const match = features.find(f => matchFeature(f, criteria));
      
      if (match) {
        try {
          // Load site data
          const siteData = JSON.parse(fs.readFileSync(siteFile, 'utf8'));
          
          // Update geometry
          siteData.geometry = match.geometry;
          
          // Update metadata
          siteData.metadata = siteData.metadata || {};
          siteData.metadata.dataQuality = 'high';
          siteData.metadata.geometrySource = `${criteria.designation} boundaries from authoritative source`;
          siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
          
          // Simplify if needed (for very large geometries)
          // This would require additional logic - for now, just save as-is
          
          // Write back
          fs.writeFileSync(siteFile, JSON.stringify(siteData, null, 2) + '\n');
          
          console.log(`  ✓ Updated ${siteId}`);
          updated++;
        } catch (error) {
          errors.push({ site: siteId, error: error.message });
          console.log(`  ✗ Error updating ${siteId}: ${error.message}`);
        }
        
        processed++;
      }
    }
    
    console.log(`  Processed ${processed} matches, updated ${updated} files`);
    return { processed, updated, errors };
    
  } catch (error) {
    console.error(`  Error processing ${filename}: ${error.message}`);
    return { processed: 0, updated: 0, errors: [{ file: filename, error: error.message }] };
  }
}

// Main execution
console.log('Looking for source data files in:', sourcesDir);

const sourceFiles = fs.readdirSync(sourcesDir).filter(f => f.endsWith('.geojson'));

if (sourceFiles.length === 0) {
  console.log('\nNo source files found!');
  console.log('\nPlease download boundary data and place GeoJSON files in:');
  console.log(sourcesDir);
  console.log('\nExpected files:');
  console.log('  - national-forests.geojson');
  console.log('  - wildlife-refuges.geojson');
  console.log('  - nps-units.geojson (optional)');
  console.log('\nSee BOUNDARY_DATA_NEEDED.md for instructions.\n');
  process.exit(1);
}

console.log(`\nFound ${sourceFiles.length} source file(s)\n`);

// Process each source file
let totalProcessed = 0;
let totalUpdated = 0;
const allErrors = [];

sourceFiles.forEach(filename => {
  const result = processSourceFile(filename, siteMatching);
  totalProcessed += result.processed;
  totalUpdated += result.updated;
  allErrors.push(...result.errors);
});

// Summary
console.log('\n================================');
console.log('Summary:');
console.log(`  Total matches found: ${totalProcessed}`);
console.log(`  Successfully updated: ${totalUpdated}`);
console.log(`  Errors: ${allErrors.length}`);

if (allErrors.length > 0) {
  console.log('\nErrors:');
  allErrors.forEach(({ site, file, error }) => {
    console.log(`  ${site || file}: ${error}`);
  });
}

console.log('================================\n');
