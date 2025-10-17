#!/usr/bin/env node

/**
 * Fetch PADUS Boundaries for Conservation Sites
 * 
 * This script queries the USGS PADUS API to fetch polygon boundaries
 * for specific conservation sites and updates the site JSON files.
 * 
 * USGS PADUS Feature Service:
 * https://gapanalysis.usgs.gov/padus/data/
 * 
 * Note: This requires the PADUS REST API endpoint to be accessible
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const sitesDir = path.join(__dirname, '../public/data/sites');

// PADUS Feature Service endpoint (example - actual URL may vary)
// This is a placeholder - the actual PADUS API endpoint needs to be confirmed
const PADUS_API_BASE = 'https://gapanalysis.usgs.gov/padus-data/api/v1';

// Site mapping with search criteria for PADUS query
const siteQueries = {
  // National Forests
  'angeles-nf': { name: 'Angeles National Forest', designation: 'National Forest' },
  'angelina-nf': { name: 'Angelina National Forest', designation: 'National Forest' },
  'apache-sitgreaves-nf': { name: 'Apache-Sitgreaves National Forest', designation: 'National Forest' },
  'apalachicola-nf': { name: 'Apalachicola National Forest', designation: 'National Forest' },
  'beaverhead-deerlodge-nf': { name: 'Beaverhead-Deerlodge National Forest', designation: 'National Forest' },
  'bighorn-nf': { name: 'Bighorn National Forest', designation: 'National Forest' },
  'bridger-teton-nf': { name: 'Bridger-Teton National Forest', designation: 'National Forest' },
  'caribou-targhee-nf': { name: 'Caribou-Targhee National Forest', designation: 'National Forest' },
  'chugach-nf': { name: 'Chugach National Forest', designation: 'National Forest' },
  'coconino-nf': { name: 'Coconino National Forest', designation: 'National Forest' },
  'coronado-nf': { name: 'Coronado National Forest', designation: 'National Forest' },
  'custer-gallatin-nf': { name: 'Custer Gallatin National Forest', designation: 'National Forest' },
  'davy-crockett-nf': { name: 'Davy Crockett National Forest', designation: 'National Forest' },
  'flathead-nf': { name: 'Flathead National Forest', designation: 'National Forest' },
  'helena-lewis-clark-nf': { name: 'Helena-Lewis and Clark National Forest', designation: 'National Forest' },
  'inyo-nf': { name: 'Inyo National Forest', designation: 'National Forest' },
  'kaibab-nf': { name: 'Kaibab National Forest', designation: 'National Forest' },
  'kootenai-nf': { name: 'Kootenai National Forest', designation: 'National Forest' },
  'lewis-and-clark-nf': { name: 'Lewis and Clark National Forest', designation: 'National Forest' },
  'lolo-nf': { name: 'Lolo National Forest', designation: 'National Forest' },
  'mark-twain-nf': { name: 'Mark Twain National Forest', designation: 'National Forest' },
  'medicine-bow-routt-nf': { name: 'Medicine Bow-Routt National Forest', designation: 'National Forest' },
  'ocala-nf': { name: 'Ocala National Forest', designation: 'National Forest' },
  'prescott-nf': { name: 'Prescott National Forest', designation: 'National Forest' },
  'sabine-nf': { name: 'Sabine National Forest', designation: 'National Forest' },
  'sam-houston-nf': { name: 'Sam Houston National Forest', designation: 'National Forest' },
  'san-bernardino-nf': { name: 'San Bernardino National Forest', designation: 'National Forest' },
  'sequoia-nf': { name: 'Sequoia National Forest', designation: 'National Forest' },
  'shoshone-nf': { name: 'Shoshone National Forest', designation: 'National Forest' },
  'sierra-nf': { name: 'Sierra National Forest', designation: 'National Forest' },
  'tongass-nf': { name: 'Tongass National Forest', designation: 'National Forest' },
  'tonto-nf': { name: 'Tonto National Forest', designation: 'National Forest' },
  
  // National Wildlife Refuges
  'aransas-nwr': { name: 'Aransas National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'arctic-nwr': { name: 'Arctic National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'buenos-aires-nwr': { name: 'Buenos Aires National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'charles-m-russell-nwr': { name: 'Charles M. Russell National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'ding-darling-nwr': { name: 'J.N. "Ding" Darling National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'florida-panther-nwr': { name: 'Florida Panther National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'laguna-atascosa-nwr': { name: 'Laguna Atascosa National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'loxahatchee-nwr': { name: 'Arthur R. Marshall Loxahatchee National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'merritt-island-nwr': { name: 'Merritt Island National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'big-muddy-nwr': { name: 'Big Muddy National Fish and Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'mingo-nwr': { name: 'Mingo National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'middle-mississippi-river-nwr': { name: 'Middle Mississippi River National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'swan-lake-nwr': { name: 'Swan Lake National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'national-elk-refuge': { name: 'National Elk Refuge', designation: 'National Wildlife Refuge' },
  'seedskadee-nwr': { name: 'Seedskadee National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'st-marks-nwr': { name: 'St. Marks National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'ten-thousand-islands-nwr': { name: 'Ten Thousand Islands National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  'yukon-delta-nwr': { name: 'Yukon Delta National Wildlife Refuge', designation: 'National Wildlife Refuge' },
  
  // Other designations
  'big-cypress-national-preserve': { name: 'Big Cypress National Preserve', designation: 'National Preserve' },
  'big-thicket-national-preserve': { name: 'Big Thicket National Preserve', designation: 'National Preserve' },
  'mojave-national-preserve': { name: 'Mojave National Preserve', designation: 'National Preserve' },
  'flaming-gorge-nra': { name: 'Flaming Gorge National Recreation Area', designation: 'National Recreation Area' },
  'padre-island-ns': { name: 'Padre Island National Seashore', designation: 'National Seashore' },
  'ozark-nsr': { name: 'Ozark National Scenic Riverways', designation: 'National Scenic Riverways' },
  'eleven-point-river': { name: 'Eleven Point Wild and Scenic River', designation: 'Wild and Scenic River' },
  'hercules-glades-wilderness': { name: 'Hercules Glades Wilderness', designation: 'Wilderness Area' },
  'irish-wilderness': { name: 'Irish Wilderness', designation: 'Wilderness Area' },
  'piney-creek-wilderness': { name: 'Piney Creek Wilderness', designation: 'Wilderness Area' }
};

console.log('PADUS Boundary Fetcher');
console.log('======================\n');
console.log('NOTE: This script demonstrates the approach to fetch data from PADUS API.');
console.log('The actual PADUS REST API endpoint and authentication may require adjustment.\n');
console.log('Alternative approach: Download PADUS state datasets and extract locally.\n');

// For now, document what needs to be done since the API access may not be straightforward
console.log('Sites that need polygon boundaries:');
console.log('===================================\n');

let count = 0;
Object.entries(siteQueries).forEach(([siteId, query]) => {
  count++;
  const filePath = path.join(sitesDir, `${siteId}.json`);
  
  if (fs.existsSync(filePath)) {
    const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (siteData.geometry && siteData.geometry.type === 'Point') {
      console.log(`${count}. ${siteId}`);
      console.log(`   Name: ${query.name}`);
      console.log(`   Designation: ${query.designation}`);
      console.log(`   State: ${siteData.location.state}`);
      console.log(`   Coordinates: ${siteData.location.lat}, ${siteData.location.lng}`);
      console.log('');
    }
  }
});

console.log('\n===================================');
console.log('Total sites needing boundaries:', count);
console.log('===================================\n');

console.log('Recommended Data Sources:');
console.log('========================\n');
console.log('1. USFS National Forests: https://data.fs.usda.gov/geodata/edw/datasets.php');
console.log('   - Direct download of all National Forest boundaries');
console.log('   - Format: Shapefile, can be converted to GeoJSON');
console.log('');
console.log('2. USFWS Wildlife Refuges: https://www.fws.gov/gis/data/');
console.log('   - National Wildlife Refuge boundaries');
console.log('   - Format: Shapefile, GeoJSON available');
console.log('');
console.log('3. PADUS Complete Dataset: https://www.usgs.gov/programs/gap-analysis-project/science/pad-us-data-download');
console.log('   - Comprehensive coverage of all federal lands');
console.log('   - State-by-state downloads available');
console.log('   - Includes all designation types');
console.log('');
console.log('4. Protected Planet: https://www.protectedplanet.net/');
console.log('   - World Database on Protected Areas (WDPA)');
console.log('   - Alternative source for US protected areas');
console.log('');

console.log('\nNext Steps:');
console.log('===========');
console.log('1. Download boundary data from one of the sources above');
console.log('2. Extract/filter for the specific sites listed');
console.log('3. Convert to GeoJSON format if needed (use ogr2ogr)');
console.log('4. Run update script to integrate boundaries into site files');
console.log('');
console.log('See DATA_SOURCES.md for detailed instructions.\n');
