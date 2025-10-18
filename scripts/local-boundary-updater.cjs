#!/usr/bin/env node

/**
 * Local Boundary Data Downloader and Updater
 * 
 * This script runs on your local machine (where you have internet access) to:
 * 1. Download GeoJSON boundary data from government APIs for all sites
 * 2. Process and extract boundaries
 * 3. Update site JSON files
 * 4. Optionally commit and push changes to GitHub
 * 
 * Usage:
 *   node scripts/local-boundary-updater.cjs                    # Download and process
 *   node scripts/local-boundary-updater.cjs --commit           # Also commit changes
 *   node scripts/local-boundary-updater.cjs --commit --push    # Commit and push to GitHub
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const sitesDir = path.join(__dirname, '../public/data/sites');

console.log('═══════════════════════════════════════════════════════════');
console.log('  Local Boundary Data Downloader and Updater');
console.log('═══════════════════════════════════════════════════════════\n');

// Parse command line arguments
const args = process.argv.slice(2);
const shouldCommit = args.includes('--commit');
const shouldPush = args.includes('--push');

if (shouldCommit) {
  console.log('🔄 Mode: Download, process, and COMMIT changes');
  if (shouldPush) {
    console.log('🚀 Will also PUSH to GitHub after commit\n');
  } else {
    console.log('💾 Will commit locally (no push)\n');
  }
} else {
  console.log('📥 Mode: Download and process only (no commit)\n');
}

/**
 * Make an HTTPS request with retry logic
 */
function httpsRequest(url, retries = 3, initialDelay = 2000) {
  return new Promise((resolve, reject) => {
    const attemptRequest = (attemptsLeft, currentDelay) => {
      const urlObj = new URL(url);
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: 30000,
        headers: {
          'User-Agent': 'ConservationConnector/1.0 (Local Update Script)',
          'Accept': 'application/json, application/geo+json'
        }
      };
      
      const request = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else if (res.statusCode === 429 && attemptsLeft > 0) {
            const waitTime = currentDelay * 2;
            console.log(`    ⏳ Rate limited, waiting ${waitTime/1000}s...`);
            setTimeout(() => attemptRequest(attemptsLeft - 1, waitTime), waitTime);
          } else if (res.statusCode >= 500 && attemptsLeft > 0) {
            console.log(`    ⟳ Server error (${res.statusCode}), retrying...`);
            setTimeout(() => attemptRequest(attemptsLeft - 1, currentDelay * 2), currentDelay);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });
      
      request.on('error', (err) => {
        if (attemptsLeft > 0) {
          setTimeout(() => attemptRequest(attemptsLeft - 1, currentDelay * 1.5), currentDelay);
        } else {
          reject(err);
        }
      });
      
      request.on('timeout', () => {
        request.destroy();
        if (attemptsLeft > 0) {
          setTimeout(() => attemptRequest(attemptsLeft - 1, currentDelay * 1.5), currentDelay);
        } else {
          reject(new Error('Request timeout'));
        }
      });
      
      request.end();
    };
    
    attemptRequest(retries, initialDelay);
  });
}

/**
 * Query ArcGIS REST API for a feature
 */
async function queryArcGIS(baseUrl, whereClause, outFields = 'FORESTNAME,ORGNAME,UNIT_NAME') {
  try {
    const params = new URLSearchParams({
      where: whereClause,
      outFields: outFields,
      returnGeometry: 'true',
      outSR: '4326',
      maxAllowableOffset: '0.01',
      geometryPrecision: '5',
      f: 'geojson'
    });
    
    const url = `${baseUrl}/query?${params.toString()}`;
    const response = await httpsRequest(url);
    const data = JSON.parse(response);
    
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry;
    }
    
    return null;
  } catch (error) {
    console.log(`    ⚠ API query failed: ${error.message}`);
    return null;
  }
}

// API Endpoints
const APIs = {
  USFS: 'https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0',
  USFWS: 'https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0',
  NPS: 'https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2'
};

// Site configuration - all sites needing real data
const SITE_CONFIG = {
  // National Forests
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
  
  // Wildlife Refuges
  'aransas-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Aransas%'" },
  'arctic-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Arctic%'" },
  'buenos-aires-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Buenos Aires%'" },
  'ding-darling-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Ding Darling%'" },
  'florida-panther-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Florida Panther%'" },
  'laguna-atascosa-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Laguna Atascosa%'" },
  'loxahatchee-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Loxahatchee%'" },
  'merritt-island-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Merritt Island%'" },
  'national-elk-refuge': { api: 'USFWS', where: "ORGNAME LIKE '%National Elk%'" },
  'seedskadee-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Seedskadee%'" },
  'st-marks-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%St. Marks%' OR ORGNAME LIKE '%St Marks%'" },
  'ten-thousand-islands-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Ten Thousand Islands%'" },
  'yukon-delta-nwr': { api: 'USFWS', where: "ORGNAME LIKE '%Yukon Delta%'" },
  
  // NPS Units
  'big-cypress-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Big Cypress%'" },
  'big-thicket-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Big Thicket%'" },
  'mojave-national-preserve': { api: 'NPS', where: "UNIT_NAME LIKE '%Mojave%'" },
  'padre-island-ns': { api: 'NPS', where: "UNIT_NAME LIKE '%Padre Island%'" },
  
  // Special cases
  'flaming-gorge-nra': { api: 'USFS', where: "FORESTNAME LIKE '%Ashley%'" }
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
    delete siteData.metadata.approximateArea;
    
    fs.writeFileSync(filePath, JSON.stringify(siteData, null, 2) + '\n');
    return true;
  } catch (error) {
    console.log(`    ✗ Error updating ${siteId}: ${error.message}`);
    return false;
  }
}

/**
 * Process all sites
 */
async function processAllSites() {
  let updated = 0;
  let failed = 0;
  let skipped = 0;
  
  const sitesToProcess = Object.entries(SITE_CONFIG);
  console.log(`Found ${sitesToProcess.length} sites to process\n`);
  console.log('Starting downloads... (this may take 10-15 minutes)\n');
  
  for (const [siteId, config] of sitesToProcess) {
    // Check if already high quality
    const filePath = path.join(sitesDir, `${siteId}.json`);
    try {
      const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (siteData.metadata && siteData.metadata.dataQuality === 'high') {
        console.log(`⊗ ${siteId} (already high quality)`);
        skipped++;
        continue;
      }
    } catch (error) {
      // File doesn't exist or can't be read, skip
      console.log(`⚠ ${siteId} (file not found, skipping)`);
      continue;
    }
    
    console.log(`📥 ${siteId}`);
    
    try {
      const apiUrl = APIs[config.api];
      if (!apiUrl) {
        console.log(`    ✗ Unknown API: ${config.api}`);
        failed++;
        continue;
      }
      
      const geometry = await queryArcGIS(apiUrl, config.where);
      
      if (geometry) {
        const source = `${config.api} REST API - Official U.S. Government Data`;
        if (updateSiteFile(siteId, geometry, source)) {
          console.log(`    ✓ Updated successfully`);
          updated++;
        } else {
          failed++;
        }
      } else {
        console.log(`    ✗ No geometry returned from API`);
        failed++;
      }
      
      // Rate limiting - be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.log(`    ✗ Error: ${error.message}`);
      failed++;
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  return { updated, failed, skipped, total: sitesToProcess.length };
}

/**
 * Commit and push changes
 */
function commitAndPush() {
  try {
    console.log('\n🔍 Checking for changes...');
    
    // Check if there are changes
    try {
      execSync('git diff --exit-code public/data/sites/*.json', { stdio: 'ignore' });
      console.log('ℹ️  No changes to commit');
      return false;
    } catch (e) {
      // There are changes, continue
    }
    
    console.log('📝 Staging changes...');
    execSync('git add public/data/sites/*.json');
    
    console.log('💾 Committing changes...');
    const commitMessage = `chore: update site boundaries from official sources [local update]

Updated sites with high-quality boundary data from government APIs.
- USFS: National Forest boundaries
- USFWS: Wildlife Refuge boundaries  
- NPS: Park unit boundaries

Generated by local-boundary-updater.cjs on ${new Date().toISOString().split('T')[0]}`;
    
    execSync(`git commit -m "${commitMessage}"`);
    console.log('✓ Changes committed locally');
    
    if (shouldPush) {
      console.log('\n🚀 Pushing to GitHub...');
      execSync('git push');
      console.log('✓ Changes pushed to GitHub');
    }
    
    return true;
  } catch (error) {
    console.error('\n❌ Error during commit/push:', error.message);
    console.log('\nYou can manually commit and push:');
    console.log('  git add public/data/sites/*.json');
    console.log('  git commit -m "chore: update site boundaries"');
    console.log('  git push');
    return false;
  }
}

// Main execution
(async () => {
  try {
    const result = await processAllSites();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Summary:');
    console.log(`  Total sites: ${result.total}`);
    console.log(`  Successfully updated: ${result.updated}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Skipped (already high quality): ${result.skipped}`);
    console.log('═══════════════════════════════════════════════════════════\n');
    
    if (result.updated > 0) {
      console.log('✅ Boundary data successfully downloaded and processed!\n');
      
      if (shouldCommit) {
        commitAndPush();
      } else {
        console.log('💡 To commit these changes, run:');
        console.log('  node scripts/local-boundary-updater.cjs --commit');
        console.log('\n💡 To commit and push, run:');
        console.log('  node scripts/local-boundary-updater.cjs --commit --push\n');
      }
    } else if (result.skipped === result.total) {
      console.log('✅ All sites already have high-quality data!\n');
    } else {
      console.log('⚠️  No new sites were updated. Check error messages above.\n');
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
})();
