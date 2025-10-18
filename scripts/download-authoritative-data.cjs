#!/usr/bin/env node

/**
 * Download Authoritative Conservation Area Boundary Data
 * 
 * This script downloads official boundary data from:
 * 1. US Forest Service - National Forest boundaries
 * 2. US Fish & Wildlife Service - Wildlife Refuge boundaries
 * 3. National Park Service - Additional park units
 * 
 * All data sources are official U.S. government data (public domain)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sourcesDir = path.join(__dirname, '../public/data/geojson/sources');

// Ensure directory exists
if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
}

console.log('Authoritative Data Downloader');
console.log('=============================\n');

/**
 * Download a file from a URL
 */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(destPath);
    
    console.log(`Downloading: ${url}`);
    console.log(`To: ${destPath}`);
    
    const request = protocol.get(url, (response) => {
      // Handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        file.close();
        fs.unlinkSync(destPath);
        return downloadFile(response.headers.location, destPath).then(resolve).catch(reject);
      }
      
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(destPath);
        return reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
      }
      
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      
      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
          process.stdout.write(`\rProgress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(1)} MB / ${(totalSize / 1024 / 1024).toFixed(1)} MB)`);
        }
      });
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log('\n✓ Download complete\n');
        resolve();
      });
    });
    
    request.on('error', (err) => {
      file.close();
      fs.unlinkSync(destPath);
      reject(err);
    });
    
    request.setTimeout(300000, () => {
      request.destroy();
      file.close();
      fs.unlinkSync(destPath);
      reject(new Error('Download timeout'));
    });
  });
}

const DATA_SOURCES = [
  {
    name: 'USFS National Forests (ArcGIS REST API)',
    description: 'National Forest System boundaries - we\'ll query this programmatically',
    type: 'api',
    baseUrl: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0',
    instructions: 'This will be queried programmatically in the next script'
  },
  {
    name: 'USFWS Wildlife Refuges (ArcGIS REST API)', 
    description: 'FWS National Realty Boundaries',
    type: 'api',
    baseUrl: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0',
    instructions: 'This will be queried programmatically in the next script'
  },
  {
    name: 'NPS Units (ArcGIS REST API)',
    description: 'National Park Service unit boundaries',
    type: 'api',
    baseUrl: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2',
    instructions: 'This will be queried programmatically in the next script'
  }
];

console.log('Data Sources Information:');
console.log('=========================\n');

DATA_SOURCES.forEach((source, idx) => {
  console.log(`${idx + 1}. ${source.name}`);
  console.log(`   ${source.description}`);
  if (source.type === 'api') {
    console.log(`   API Endpoint: ${source.baseUrl}`);
  } else if (source.url) {
    console.log(`   URL: ${source.url}`);
  }
  console.log(`   ${source.instructions}`);
  console.log();
});

console.log('\nNOTE: Modern approach - Query ArcGIS REST APIs directly');
console.log('====================================================');
console.log('Instead of downloading large files, we will:');
console.log('1. Query USFS/USFWS/NPS ArcGIS REST APIs for specific sites');
console.log('2. Extract only the boundaries we need');
console.log('3. Convert to GeoJSON format');
console.log('4. Update site files\n');
console.log('This is more efficient and uses the most current data.\n');
console.log('Run the next script: node scripts/query-arcgis-boundaries.cjs\n');

// Create a README in the sources directory
const readme = `# Boundary Data Sources

This directory can contain downloaded boundary data files.

## Current Approach

We are using ArcGIS REST API queries to fetch boundaries directly:

### USFS National Forests
- API: https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0
- Query by forest name to get GeoJSON boundaries

### USFWS Wildlife Refuges  
- API: https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0
- Query by refuge name to get GeoJSON boundaries

### NPS Units (Parks, Preserves, etc.)
- API: https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2
- Query by unit name to get GeoJSON boundaries

## Usage

Run: \`node scripts/query-arcgis-boundaries.cjs\`

This will query the APIs for each site and update the JSON files with accurate polygon boundaries.
`;

fs.writeFileSync(path.join(sourcesDir, 'README.md'), readme);
console.log('✓ Created README.md in sources directory\n');
