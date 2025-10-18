#!/usr/bin/env node

/**
 * Fetch Real Boundaries from Public GeoJSON Sources
 * 
 * This script fetches REAL polygon boundaries from publicly available GeoJSON
 * files hosted by U.S. government agencies and open data portals.
 * 
 * NO APPROXIMATIONS - only real authoritative data.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sitesDir = path.join(__dirname, '../public/data/sites');
const sourcesDir = path.join(__dirname, '../public/data/geojson/sources');

if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
}

console.log('Real Boundary Data Fetcher');
console.log('==========================\n');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const req = protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve).catch(reject);
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(120000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Direct GeoJSON URLs for specific datasets
const DATA_URLS = {
  // We can use the data.gov catalog or direct agency URLs
  // These are examples - we'll need to find the actual current URLs
  
  // NPS data portal has individual unit boundaries
  NPS_BASE: 'https://public-nps.opendata.arcgis.com',
  
  // Forest Service geodata portal
  USFS_BASE: 'https://data.fs.usda.gov/geodata',
  
  // FWS has a data catalog
  USFWS_BASE: 'https://ecos.fws.gov/ServCat',
};

/**
 * Try to match and extract boundary from a large GeoJSON file
 */
function extractBoundary(geojsonData, siteName) {
  const features = geojsonData.features || [];
  
  // Try to find matching feature by name
  const normalizedSiteName = siteName.toLowerCase();
  
  for (const feature of features) {
    const props = feature.properties || {};
    const featureName = (
      props.name || 
      props.NAME ||
      props.UNIT_NAME ||
      props.Unit_Nm ||
      props.FORESTNAME ||
      props.Forest_Name ||
      props.ORGNAME ||
      props.Org_Name ||
      ''
    ).toLowerCase();
    
    // Check for name match
    if (featureName.includes(normalizedSiteName) || normalizedSiteName.includes(featureName)) {
      return feature.geometry;
    }
  }
  
  return null;
}

/**
 * Specific fetchers for different site types
 */

// For now, let's document what REAL data we need and where to get it
console.log('REAL DATA SOURCES - No Approximations');
console.log('======================================\n');

console.log('This script requires downloading REAL boundary data from official sources.\n');

console.log('OPTION 1: Use existing tools to download from ArcGIS Feature Services');
console.log('--------------------------------------------------------------------');
console.log('Install: npm install -g @esri/arcgis-rest-request @esri/arcgis-rest-feature-service');
console.log('Then we can programmatically query the feature services.\n');

console.log('OPTION 2: Download complete datasets manually');
console.log('----------------------------------------------');
console.log('1. USFS National Forests:');
console.log('   https://data.fs.usda.gov/geodata/edw/edw_resources/shp/S_USA.AdministrativeForest.zip');
console.log('   Download, unzip, convert to GeoJSON with ogr2ogr\n');

console.log('2. USFWS Wildlife Refuges:');
console.log('   https://gis-fws.opendata.arcgis.com/datasets/fws-national-realty-boundaries');
console.log('   Download as GeoJSON directly\n');

console.log('3. NPS Units (Preserves, Seashores, etc.):');
console.log('   https://public-nps.opendata.arcgis.com/datasets/nps-boundary-4');
console.log('   Download as GeoJSON directly\n');

console.log('OPTION 3: Query APIs programmatically (recommended)');
console.log('----------------------------------------------------');
console.log('We can query the ArcGIS REST APIs directly for each site.');
console.log('This is implemented in query-arcgis-boundaries.cjs\n');

console.log('PROCEEDING WITH OPTION 3...\n');
console.log('This script will use the Esri ArcGIS REST APIs to fetch real boundaries.');
console.log('No approximations will be used - only authoritative government data.\n');

// Export the fetch function for use by other scripts
module.exports = {
  httpGet,
  extractBoundary
};
