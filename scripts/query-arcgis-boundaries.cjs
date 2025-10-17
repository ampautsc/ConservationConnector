#!/usr/bin/env node

/**
 * Query ArcGIS REST APIs for Conservation Area Boundaries
 * 
 * This script queries official U.S. government ArcGIS REST APIs to fetch
 * accurate polygon boundaries for conservation sites.
 * 
 * Data Sources:
 * - USFS: National Forest System Boundaries
 * - USFWS: National Realty Boundaries (Wildlife Refuges)
 * - NPS: National Park Service Unit Boundaries
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const sitesDir = path.join(__dirname, '../public/data/sites');

console.log('ArcGIS REST API Boundary Fetcher');
console.log('=================================\n');

/**
 * Make an HTTPS request
 */
function httpsRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(httpsRequest(res.headers.location));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject).setTimeout(60000, function() {
      this.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Query ArcGIS REST API for a feature
 */
async function queryArcGIS(baseUrl, whereClause, outFields = '*') {
  try {
    const params = new URLSearchParams({
      where: whereClause,
      outFields: outFields,
      returnGeometry: 'true',
      f: 'geojson',
      outSR: '4326'
    });
    
    const url = `${baseUrl}/query?${params.toString()}`;
    
    console.log(`  Querying: ${url.substring(0, 100)}...`);
    
    const response = await httpsRequest(url);
    const data = JSON.parse(response);
    
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry;
    }
    
    return null;
  } catch (error) {
    console.log(`  ⚠ API query failed: ${error.message}`);
    return null;
  }
}

// API Endpoints
const APIs = {
  USFS: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0',
  USFWS: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0',
  NPS: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2'
};

// Site configuration with API query information
const SITE_CONFIG = {
  // National Forests - query USFS API
  'angeles-nf': { api: 'USFS', where: "FORESTNAME = 'Angeles National Forest'" },
  'angelina-nf': { api: 'USFS', where: "FORESTNAME = 'Angelina National Forest'" },
  'apache-sitgreaves-nf': { api: 'USFS', where: "FORESTNAME = 'Apache-Sitgreaves National Forests'" },
  'apalachicola-nf': { api: 'USFS', where: "FORESTNAME = 'Apalachicola National Forest'" },
  'beaverhead-deerlodge-nf': { api: 'USFS', where: "FORESTNAME = 'Beaverhead-Deerlodge National Forest'" },
  'bighorn-nf': { api: 'USFS', where: "FORESTNAME = 'Bighorn National Forest'" },
  'bridger-teton-nf': { api: 'USFS', where: "FORESTNAME = 'Bridger-Teton National Forest'" },
  'caribou-targhee-nf': { api: 'USFS', where: "FORESTNAME = 'Caribou-Targhee National Forest'" },
  'chugach-nf': { api: 'USFS', where: "FORESTNAME = 'Chugach National Forest'" },
  'coconino-nf': { api: 'USFS', where: "FORESTNAME = 'Coconino National Forest'" },
  'coronado-nf': { api: 'USFS', where: "FORESTNAME = 'Coronado National Forest'" },
  'custer-gallatin-nf': { api: 'USFS', where: "FORESTNAME = 'Custer Gallatin National Forest'" },
  'davy-crockett-nf': { api: 'USFS', where: "FORESTNAME = 'Davy Crockett National Forest'" },
  'flathead-nf': { api: 'USFS', where: "FORESTNAME = 'Flathead National Forest'" },
  'helena-lewis-clark-nf': { api: 'USFS', where: "FORESTNAME = 'Helena - Lewis and Clark National Forest'" },
  'inyo-nf': { api: 'USFS', where: "FORESTNAME = 'Inyo National Forest'" },
  'kaibab-nf': { api: 'USFS', where: "FORESTNAME = 'Kaibab National Forest'" },
  'kootenai-nf': { api: 'USFS', where: "FORESTNAME = 'Kootenai National Forest'" },
  'lewis-and-clark-nf': { api: 'USFS', where: "FORESTNAME = 'Lewis and Clark National Forest'" },
  'lolo-nf': { api: 'USFS', where: "FORESTNAME = 'Lolo National Forest'" },
  'medicine-bow-routt-nf': { api: 'USFS', where: "FORESTNAME = 'Medicine Bow-Routt National Forest'" },
  'ocala-nf': { api: 'USFS', where: "FORESTNAME = 'Ocala National Forest'" },
  'prescott-nf': { api: 'USFS', where: "FORESTNAME = 'Prescott National Forest'" },
  'sabine-nf': { api: 'USFS', where: "FORESTNAME = 'Sabine National Forest'" },
  'sam-houston-nf': { api: 'USFS', where: "FORESTNAME = 'Sam Houston National Forest'" },
  'san-bernardino-nf': { api: 'USFS', where: "FORESTNAME = 'San Bernardino National Forest'" },
  'sequoia-nf': { api: 'USFS', where: "FORESTNAME = 'Sequoia National Forest'" },
  'shoshone-nf': { api: 'USFS', where: "FORESTNAME = 'Shoshone National Forest'" },
  'sierra-nf': { api: 'USFS', where: "FORESTNAME = 'Sierra National Forest'" },
  'tongass-nf': { api: 'USFS', where: "FORESTNAME = 'Tongass National Forest'" },
  'tonto-nf': { api: 'USFS', where: "FORESTNAME = 'Tonto National Forest'" },
  
  // Wildlife Refuges - query USFWS API
  'aransas-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Aransas%'" },
  'arctic-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Arctic%'" },
  'buenos-aires-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Buenos Aires%'" },
  'ding-darling-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Ding Darling%'" },
  'florida-panther-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Florida Panther%'" },
  'laguna-atascosa-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Laguna Atascosa%'" },
  'loxahatchee-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Loxahatchee%'" },
  'merritt-island-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Merritt Island%'" },
  'national-elk-refuge': { api: 'USFWS', where: "ORGNAME LIKE '%National Elk Refuge%'" },
  'seedskadee-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Seedskadee%'" },
  'st-marks-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%St. Marks%' OR ORGNAME LIKE '%St Marks%'" },
  'ten-thousand-islands-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Ten Thousand Islands%'" },
  'yukon-delta-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Yukon Delta%'" },
  
  // NPS Units - query NPS API
  'big-cypress-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Big Cypress%'" },
  'big-thicket-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Big Thicket%'" },
  'mojave-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Mojave%'" },
  'flaming-gorge-nra': { api: 'USFS', where: "FORESTNAME LIKE '%Ashley%'" }, // Flaming Gorge is in Ashley NF
  'padre-island-ns': { api: 'NPS', where: "UNIT_NAME LIKE '%Padre Island%'" }
};

/**
 * Update a site file with boundary data
 */
function updateSiteFile(siteId, geometry, source) {
  const filePath = path.join(sitesDir, `${siteId}.json`);
  
  try {
    const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    siteData.geometry = geometry;
    siteData.metadata = siteData.metadata || {};
    siteData.metadata.dataQuality = 'high';
    siteData.metadata.geometrySource = source;
    siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
    
    fs.writeFileSync(filePath, JSON.stringify(siteData, null, 2) + '\n');
    console.log(`  ✓ Updated ${siteId}`);
    return true;
  } catch (error) {
    console.log(`  ✗ Error updating ${siteId}: ${error.message}`);
    return false;
  }
}

/**
 * Process all sites
 */
async function processAllSites() {
  let processed = 0;
  let updated = 0;
  let failed = 0;
  
  for (const [siteId, config] of Object.entries(SITE_CONFIG)) {
    console.log(`\nProcessing: ${siteId}`);
    
    try {
      const apiUrl = APIs[config.api];
      if (!apiUrl) {
        console.log(`  ✗ Unknown API: ${config.api}`);
        failed++;
        continue;
      }
      
      const geometry = await queryArcGIS(apiUrl, config.where);
      
      if (geometry) {
        const source = `${config.api} REST API - Official U.S. Government Data`;
        if (updateSiteFile(siteId, geometry, source)) {
          updated++;
        } else {
          failed++;
        }
      } else {
        console.log(`  ✗ No geometry returned from API`);
        failed++;
      }
      
      processed++;
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      failed++;
    }
  }
  
  return { processed, updated, failed };
}

// Main execution
(async () => {
  try {
    console.log('Starting ArcGIS REST API queries...\n');
    
    const result = await processAllSites();
    
    console.log('\n================================');
    console.log('Summary:');
    console.log(`  Sites processed: ${result.processed}`);
    console.log(`  Successfully updated: ${result.updated}`);
    console.log(`  Failed: ${result.failed}`);
    console.log('================================\n');
    
    if (result.updated > 0) {
      console.log('✓ Boundary data successfully fetched from official sources!\n');
    } else {
      console.log('⚠ No sites were updated. The APIs may have different field names.');
      console.log('   Check the API documentation and adjust WHERE clauses.\n');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
