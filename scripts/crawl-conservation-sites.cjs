/**
 * Conservation Site Data Crawler
 * 
 * This script reads the site inventory file (INVENTORY.md) and generates
 * individual JSON data files for each conservation site following the
 * conservation-site-schema.json format.
 * 
 * Usage: node scripts/crawl-conservation-sites.cjs
 */

const fs = require('fs');
const path = require('path');

// Paths
const INVENTORY_PATH = path.join(__dirname, '../public/data/sites/INVENTORY.md');
const SITES_DIR = path.join(__dirname, '../public/data/sites');
const SCHEMA_PATH = path.join(__dirname, '../public/data/schema/conservation-site-schema.json');

/**
 * Parse the inventory markdown file and extract site information
 */
function parseInventory(inventoryContent) {
  const sites = [];
  const lines = inventoryContent.split('\n');
  
  let currentSite = null;
  let currentState = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect state header (## StateName (XX))
    const stateMatch = line.match(/^## (.+) \(([A-Z]{2})\)$/);
    if (stateMatch) {
      currentState = stateMatch[2];
      continue;
    }
    
    // Detect site name (### Site Name)
    const siteMatch = line.match(/^### (.+)$/);
    if (siteMatch) {
      // Save previous site if exists
      if (currentSite) {
        sites.push(currentSite);
      }
      
      // Start new site
      currentSite = {
        name: siteMatch[1],
        state: currentState
      };
      continue;
    }
    
    // Parse site properties
    if (currentSite && line.startsWith('- **')) {
      const propMatch = line.match(/- \*\*([^*]+)\*\*: (.+)$/);
      if (propMatch) {
        const [, key, value] = propMatch;
        
        switch (key.toLowerCase()) {
          case 'id':
            currentSite.id = value.trim();
            break;
          case 'state':
            currentSite.state = value.trim();
            break;
          case 'designation':
            currentSite.designation = value.trim();
            break;
          case 'area':
            currentSite.areaText = value.trim();
            break;
          case 'coordinates':
            const coords = value.split(',').map(c => parseFloat(c.trim()));
            if (coords.length === 2) {
              currentSite.lat = coords[0];
              currentSite.lng = coords[1];
            }
            break;
          case 'status':
            currentSite.status = value.trim();
            break;
        }
      }
    }
  }
  
  // Add last site
  if (currentSite) {
    sites.push(currentSite);
  }
  
  return sites;
}

/**
 * Parse area text to extract acres and calculate km²
 */
function parseArea(areaText) {
  const area = {};
  
  // Extract acres
  const acresMatch = areaText.match(/([0-9,]+)\s*acres/i);
  if (acresMatch) {
    area.acres = parseInt(acresMatch[1].replace(/,/g, ''));
    // Convert to km² (1 acre = 0.00404686 km²)
    area.km2 = Math.round(area.acres * 0.00404686 * 100) / 100;
    // Convert to hectares (1 acre = 0.404686 hectares)
    area.hectares = Math.round(area.acres * 0.404686 * 100) / 100;
  }
  
  // Extract sq mi if acres not found
  const sqMiMatch = areaText.match(/\(([0-9,]+)\s*sq\s*mi\)/i);
  if (sqMiMatch && !area.acres) {
    const sqMi = parseInt(sqMiMatch[1].replace(/,/g, ''));
    // Convert to acres (1 sq mi = 640 acres)
    area.acres = sqMi * 640;
    area.km2 = Math.round(sqMi * 2.58999 * 100) / 100;
    area.hectares = Math.round(area.acres * 0.404686 * 100) / 100;
  }
  
  return area;
}

/**
 * Convert parsed site data to schema-compliant JSON
 */
function convertToSchema(site) {
  const data = {
    id: site.id,
    name: site.name,
    description: `${site.designation} in ${site.state}`,
    location: {
      lat: site.lat,
      lng: site.lng,
      state: site.state
    },
    geometry: {
      type: 'Point',
      coordinates: [site.lng, site.lat]
    }
  };
  
  // Add area if available
  if (site.areaText) {
    const area = parseArea(site.areaText);
    if (Object.keys(area).length > 0) {
      data.area = area;
    }
  }
  
  // Add designation
  if (site.designation) {
    data.designation = site.designation;
  }
  
  // Add metadata
  data.metadata = {
    source: 'Conservation Connector Site Inventory',
    lastUpdated: new Date().toISOString().split('T')[0],
    dataQuality: 'medium'
  };
  
  return data;
}

/**
 * Validate site data against schema (basic validation)
 */
function validateSite(site) {
  const errors = [];
  
  if (!site.id || typeof site.id !== 'string') {
    errors.push('Missing or invalid id');
  }
  
  if (!site.name || typeof site.name !== 'string') {
    errors.push('Missing or invalid name');
  }
  
  if (!site.location || typeof site.location !== 'object') {
    errors.push('Missing location object');
  } else {
    if (typeof site.location.lat !== 'number' || site.location.lat < -90 || site.location.lat > 90) {
      errors.push('Invalid latitude');
    }
    if (typeof site.location.lng !== 'number' || site.location.lng < -180 || site.location.lng > 180) {
      errors.push('Invalid longitude');
    }
    if (!site.location.state || typeof site.location.state !== 'string') {
      errors.push('Missing or invalid state');
    }
  }
  
  if (!site.geometry || typeof site.geometry !== 'object') {
    errors.push('Missing geometry object');
  }
  
  return errors;
}

/**
 * Main crawler function
 */
function crawlConservationSites() {
  console.log('Conservation Site Data Crawler');
  console.log('==============================\n');
  
  // Read inventory file
  console.log(`Reading inventory from: ${INVENTORY_PATH}`);
  if (!fs.existsSync(INVENTORY_PATH)) {
    console.error('Error: Inventory file not found!');
    process.exit(1);
  }
  
  const inventoryContent = fs.readFileSync(INVENTORY_PATH, 'utf8');
  
  // Parse inventory
  console.log('Parsing inventory...');
  const sites = parseInventory(inventoryContent);
  console.log(`Found ${sites.length} sites\n`);
  
  // Process each site
  let successCount = 0;
  let errorCount = 0;
  const errors = [];
  
  for (const site of sites) {
    try {
      // Skip if missing required fields
      if (!site.id) {
        errors.push({ site: site.name || 'Unknown', error: 'Missing ID' });
        errorCount++;
        continue;
      }
      
      if (!site.lat || !site.lng) {
        errors.push({ site: site.name, error: 'Missing coordinates' });
        errorCount++;
        continue;
      }
      
      // Convert to schema format
      const siteData = convertToSchema(site);
      
      // Validate
      const validationErrors = validateSite(siteData);
      if (validationErrors.length > 0) {
        errors.push({ 
          site: site.name, 
          error: validationErrors.join(', ') 
        });
        errorCount++;
        continue;
      }
      
      // Write to file
      const filename = `${site.id}.json`;
      const filepath = path.join(SITES_DIR, filename);
      fs.writeFileSync(filepath, JSON.stringify(siteData, null, 2));
      
      console.log(`✓ Created ${filename}`);
      successCount++;
      
    } catch (err) {
      errors.push({ 
        site: site.name || 'Unknown', 
        error: err.message 
      });
      errorCount++;
    }
  }
  
  // Summary
  console.log('\n==============================');
  console.log('Summary:');
  console.log(`  Total sites: ${sites.length}`);
  console.log(`  Successfully processed: ${successCount}`);
  console.log(`  Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(err => {
      console.log(`  - ${err.site}: ${err.error}`);
    });
  }
  
  console.log('\nDone!');
  
  // Exit with error code if there were errors
  if (errorCount > 0) {
    process.exit(1);
  }
}

// Run the crawler
crawlConservationSites();
