#!/usr/bin/env node

/**
 * Fetch ALL Conservation Area Boundaries
 * 
 * This script downloads actual polygon boundaries for all 50 remaining sites
 * from public data sources instead of using Point geometries.
 * 
 * Data Sources:
 * 1. USFS National Forests: USDA Forest Service geodata
 * 2. USFWS Wildlife Refuges: US Fish & Wildlife Service data
 * 3. NPS Units: National Park Service data
 * 4. Protected Planet API: World Database on Protected Areas (WDPA)
 * 
 * Usage: node scripts/fetch-all-boundaries.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const sitesDir = path.join(__dirname, '../public/data/sites');
const sourcesDir = path.join(__dirname, '../public/data/geojson/sources');

// Ensure sources directory exists
if (!fs.existsSync(sourcesDir)) {
  fs.mkdirSync(sourcesDir, { recursive: true });
}

console.log('Conservation Boundary Fetcher');
console.log('=============================\n');

/**
 * Make an HTTP(S) request and return the response as a promise
 */
function httpRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ statusCode: res.statusCode, data, headers: res.headers });
        } else if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirects
          resolve(httpRequest(res.headers.location, options));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(60000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

/**
 * Query Protected Planet API for a conservation area
 */
async function fetchFromProtectedPlanet(siteName, country = 'USA') {
  try {
    // Protected Planet search API
    const searchUrl = `https://api.protectedplanet.net/v3/protected_areas/search?q=${encodeURIComponent(siteName)}&country=${country}`;
    console.log(`  Querying Protected Planet for: ${siteName}`);
    
    const response = await httpRequest(searchUrl);
    const data = JSON.parse(response.data);
    
    if (data.protected_areas && data.protected_areas.length > 0) {
      // Get the first match
      const area = data.protected_areas[0];
      const wdpaId = area.id;
      
      // Fetch detailed GeoJSON
      const detailUrl = `https://api.protectedplanet.net/v3/protected_areas/${wdpaId}?with_geometry=true`;
      const detailResponse = await httpRequest(detailUrl);
      const detailData = JSON.parse(detailResponse.data);
      
      if (detailData.protected_area && detailData.protected_area.geojson) {
        return detailData.protected_area.geojson;
      }
    }
    
    return null;
  } catch (error) {
    console.log(`  ⚠ Protected Planet query failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate approximate polygon from center point and area
 * This is a fallback when we can't get real data
 */
function generateApproximatePolygon(centerLat, centerLng, areaKm2) {
  // Calculate radius in degrees (rough approximation)
  const radiusKm = Math.sqrt(areaKm2 / Math.PI);
  const radiusLat = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const radiusLng = radiusKm / (111.32 * Math.cos(centerLat * Math.PI / 180));
  
  // Create a hexagon (better than circle for polygon approximation)
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 60) * Math.PI / 180;
    const lat = centerLat + radiusLat * Math.sin(angle);
    const lng = centerLng + radiusLng * Math.cos(angle);
    points.push([lng, lat]);
  }
  
  // Close the polygon
  points.push(points[0]);
  
  return {
    type: 'Polygon',
    coordinates: [points]
  };
}

/**
 * Fetch boundary from Overpass API (OpenStreetMap data)
 */
async function fetchFromOverpass(siteName, centerLat, centerLng) {
  try {
    // Search for protected areas near the center point
    const query = `
      [out:json][timeout:25];
      (
        way["boundary"="protected_area"]["name"~"${siteName}",i](around:50000,${centerLat},${centerLng});
        relation["boundary"="protected_area"]["name"~"${siteName}",i](around:50000,${centerLat},${centerLng});
      );
      out geom;
    `;
    
    const encodedQuery = encodeURIComponent(query);
    const url = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
    
    console.log(`  Querying OpenStreetMap for: ${siteName}`);
    
    const response = await httpRequest(url);
    const data = JSON.parse(response.data);
    
    if (data.elements && data.elements.length > 0) {
      // Convert OSM data to GeoJSON
      const element = data.elements[0];
      
      if (element.type === 'way' && element.geometry) {
        return {
          type: 'Polygon',
          coordinates: [element.geometry.map(node => [node.lon, node.lat])]
        };
      } else if (element.type === 'relation' && element.members) {
        // Handle multipolygon relations
        const coords = [];
        for (const member of element.members) {
          if (member.geometry) {
            coords.push(member.geometry.map(node => [node.lon, node.lat]));
          }
        }
        if (coords.length > 0) {
          return {
            type: 'MultiPolygon',
            coordinates: [coords]
          };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.log(`  ⚠ OSM query failed: ${error.message}`);
    return null;
  }
}

/**
 * Attempt to fetch boundary from multiple sources
 */
async function fetchBoundary(siteData) {
  const { name, location, area } = siteData;
  
  console.log(`\nFetching boundary for: ${name}`);
  console.log(`  Center: ${location.lat}, ${location.lng}`);
  console.log(`  Area: ${area.km2} km²`);
  
  // Try OpenStreetMap first (often has good US federal land data)
  let geometry = await fetchFromOverpass(name, location.lat, location.lng);
  if (geometry) {
    console.log(`  ✓ Found boundary from OpenStreetMap`);
    return { geometry, source: 'OpenStreetMap via Overpass API' };
  }
  
  // Add delay to avoid rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Try Protected Planet API
  geometry = await fetchFromProtectedPlanet(name);
  if (geometry) {
    console.log(`  ✓ Found boundary from Protected Planet`);
    return { geometry, source: 'Protected Planet (WDPA)' };
  }
  
  // If all else fails, generate an approximate polygon
  console.log(`  ⚠ No boundary data found, generating approximation`);
  geometry = generateApproximatePolygon(location.lat, location.lng, area.km2);
  return { geometry, source: 'Approximated from area and center point', quality: 'medium' };
}

/**
 * Update a site file with new geometry
 */
function updateSiteFile(siteId, geometry, source, quality = 'high') {
  const filePath = path.join(sitesDir, `${siteId}.json`);
  const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  siteData.geometry = geometry;
  siteData.metadata = siteData.metadata || {};
  siteData.metadata.dataQuality = quality;
  siteData.metadata.geometrySource = source;
  siteData.metadata.lastUpdated = new Date().toISOString().split('T')[0];
  
  fs.writeFileSync(filePath, JSON.stringify(siteData, null, 2) + '\n');
  
  console.log(`  ✓ Updated ${siteId}`);
}

/**
 * Process all sites that still have Point geometry
 */
async function processAllSites() {
  const files = fs.readdirSync(sitesDir)
    .filter(file => file.endsWith('.json'));
  
  let processed = 0;
  let updated = 0;
  let failed = 0;
  
  for (const filename of files) {
    const siteId = filename.replace('.json', '');
    const filePath = path.join(sitesDir, filename);
    
    try {
      const siteData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Only process sites with Point geometry
      if (siteData.geometry && siteData.geometry.type === 'Point') {
        processed++;
        
        const result = await fetchBoundary(siteData);
        if (result) {
          updateSiteFile(siteId, result.geometry, result.source, result.quality || 'high');
          updated++;
        } else {
          console.log(`  ✗ Failed to fetch boundary`);
          failed++;
        }
        
        // Rate limiting: wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`✗ Error processing ${siteId}: ${error.message}`);
      failed++;
    }
  }
  
  return { processed, updated, failed };
}

// Main execution
(async () => {
  try {
    console.log('Starting boundary fetch process...\n');
    
    const result = await processAllSites();
    
    console.log('\n================================');
    console.log('Summary:');
    console.log(`  Total sites processed: ${result.processed}`);
    console.log(`  Successfully updated: ${result.updated}`);
    console.log(`  Failed: ${result.failed}`);
    console.log('================================\n');
    
    if (result.updated > 0) {
      console.log('✓ Boundary data successfully fetched!');
      console.log('\nNext steps:');
      console.log('  1. Review updated site files');
      console.log('  2. Run: npm run build');
      console.log('  3. Test map rendering');
      console.log('  4. Commit changes\n');
    } else {
      console.log('⚠ No sites were updated. Check error messages above.\n');
    }
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
})();
