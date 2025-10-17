/**
 * Missouri Conservation Polygons Generator
 * 
 * This script processes PADUS3 GeoJSON files to create a simplified
 * mo-conservation-polygons.geojson file containing actual conservation areas.
 * 
 * Filters applied:
 * - Excludes recreation areas (parks, lakes, etc.)
 * - Excludes military land
 * - Focuses on conservation areas, wilderness, wildlife refuges, and national forests
 * - Prioritizes areas larger than 100 acres
 * 
 * Usage: node scripts/create-mo-conservation-polygons.cjs [min-acres] [tolerance]
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Conservation-focused designation types to INCLUDE
const CONSERVATION_TYPES = [
  'State Conservation Area',
  'Wilderness Area',
  'National Monument',
  'Research or Educational Area',
  'Wild and Scenic River',
  'Conservation Easement',
  'Wetlands Reserve Program',
  'Agricultural Easement',
  'Historic or Cultural Easement',
  'Approved or Proclamation Boundary',
  'National Forest',
  'Wildlife Refuge',
  'National Wildlife Refuge',
  'Scenic Riverway'
];

// Keywords to identify conservation in unit names
const CONSERVATION_KEYWORDS = [
  'wildlife',
  'wilderness',
  'conservation',
  'national forest',
  'nature',
  'preserve',
  'sanctuary',
  'refuge',
  'scenic river',
  'easement',
  'wetlands reserve'
];

// Types to EXCLUDE (recreation, military, etc.)
const EXCLUDED_TYPES = [
  'State Recreation Area',
  'Recreation Management Area',
  'Local Recreation Area',
  'Local Park',
  'State Historic or Cultural Area',
  'Private Recreation or Education',
  'Military Land',
  'Other Easement',
  'Recreation or Education Easement'
];

// Keywords to exclude from unit names
const EXCLUDED_KEYWORDS = [
  'lake',
  'recreation',
  'park',
  'military',
  'fort ',
  'experimental forest'
];

/**
 * Check if a feature is a conservation area based on designation type and name
 */
function isConservationArea(feature) {
  const props = feature.properties;
  const desType = props.d_Des_Tp || '';
  const unitName = (props.Unit_Nm || '').toLowerCase();
  const category = props.d_Category || '';
  
  // Exclude military land explicitly
  if (EXCLUDED_TYPES.includes(desType)) {
    return false;
  }
  
  // Exclude based on keywords in name
  if (EXCLUDED_KEYWORDS.some(keyword => unitName.includes(keyword))) {
    return false;
  }
  
  // Include if designation type is in conservation list
  if (CONSERVATION_TYPES.includes(desType)) {
    return true;
  }
  
  // Include if unit name contains conservation keywords
  if (CONSERVATION_KEYWORDS.some(keyword => unitName.includes(keyword))) {
    return true;
  }
  
  return false;
}

/**
 * Convert PADUS3 files from ESRI:102039 to WGS84 using ogr2ogr
 */
function convertToWGS84(inputFiles, outputDir) {
  console.log('Converting PADUS3 files to WGS84...');
  
  const convertedFiles = [];
  for (const inputFile of inputFiles) {
    const basename = inputFile.split('/').pop().replace('.json', '_wgs84.json');
    const outputFile = `${outputDir}/${basename}`;
    
    console.log(`  Converting ${inputFile.split('/').pop()}...`);
    
    try {
      execSync(`ogr2ogr -f GeoJSON -t_srs EPSG:4326 "${outputFile}" "${inputFile}"`, {
        stdio: 'ignore'
      });
      convertedFiles.push(outputFile);
    } catch (error) {
      console.error(`  Error converting ${inputFile}: ${error.message}`);
      throw error;
    }
  }
  
  console.log('Conversion complete!\n');
  return convertedFiles;
}

/**
 * Simplify polygon using Douglas-Peucker algorithm
 */
function simplifyDouglasPeucker(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let maxIndex = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const distance = perpendicularDistance(points[i], points[0], points[end]);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  if (maxDistance > tolerance) {
    const leftSegment = simplifyDouglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightSegment = simplifyDouglasPeucker(points.slice(maxIndex), tolerance);
    return leftSegment.slice(0, -1).concat(rightSegment);
  } else {
    return [points[0], points[end]];
  }
}

function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  const numerator = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}

function simplifyPolygon(coordinates, tolerance) {
  return coordinates.map(ring => simplifyDouglasPeucker(ring, tolerance));
}

function simplifyMultiPolygon(coordinates, tolerance) {
  return coordinates.map(polygon => simplifyPolygon(polygon, tolerance));
}

function simplifyGeometry(geometry, tolerance) {
  if (geometry.type === 'Polygon') {
    return {
      ...geometry,
      coordinates: simplifyPolygon(geometry.coordinates, tolerance)
    };
  } else if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: simplifyMultiPolygon(geometry.coordinates, tolerance)
    };
  }
  return geometry;
}

/**
 * Main processing function
 */
function createMoConservationPolygons(minAcres = 100, tolerance = 0.001) {
  console.log('Creating Missouri Conservation Polygons GeoJSON');
  console.log(`Minimum area: ${minAcres} acres`);
  console.log(`Simplification tolerance: ${tolerance}`);
  console.log('');

  const inputFiles = [
    'public/data/geojson/PADUS3_0Designation_StateMO.json',
    'public/data/geojson/PADUS3_0Easement_StateMO.json',
    'public/data/geojson/PADUS3_0Proclamation_StateMO.json'
  ];

  const outputFile = 'public/data/geojson/mo-conservation-polygons.geojson';
  
  // Convert files to WGS84
  const tmpDir = '/tmp';
  const convertedFiles = convertToWGS84(inputFiles, tmpDir);
  
  let allFeatures = [];
  let totalProcessed = 0;
  let totalIncluded = 0;

  // Process each converted file
  for (const convertedFile of convertedFiles) {
    console.log(`Processing ${convertedFile.split('/').pop()}...`);
    const data = JSON.parse(fs.readFileSync(convertedFile, 'utf8'));
    
    let fileIncluded = 0;
    for (const feature of data.features) {
      totalProcessed++;
      
      const acres = feature.properties.GIS_Acres || 0;
      
      // Filter by size and conservation type
      if (acres >= minAcres && isConservationArea(feature)) {
        fileIncluded++;
        totalIncluded++;
        
        // Create new feature with simplified properties (geometry already in WGS84)
        allFeatures.push({
          type: 'Feature',
          properties: {
            name: feature.properties.Unit_Nm || feature.properties.Loc_Nm || 'Unknown',
            designation: feature.properties.d_Des_Tp || feature.properties.FeatClass || 'Unknown',
            owner: feature.properties.d_Own_Name || 'Unknown',
            manager: feature.properties.d_Mang_Nam || 'Unknown',
            acres: Math.round(acres),
            state: feature.properties.State_Nm || 'MO',
            access: feature.properties.d_Pub_Acce || 'Unknown',
            gapStatus: feature.properties.d_GAP_Sts || 'Unknown',
            category: feature.properties.d_Category || feature.properties.Category || 'Unknown'
          },
          geometry: feature.geometry
        });
      }
    }
    console.log(`  Found ${data.features.length} features, included ${fileIncluded} conservation areas`);
  }

  console.log('');
  console.log(`Total features processed: ${totalProcessed}`);
  console.log(`Conservation areas selected: ${totalIncluded}`);
  
  // Sort by size (largest first)
  allFeatures.sort((a, b) => b.properties.acres - a.properties.acres);
  
  console.log('');
  console.log('Top 20 conservation areas by size:');
  allFeatures.slice(0, 20).forEach((feature, i) => {
    console.log(`  ${i + 1}. ${feature.properties.name} - ${feature.properties.acres.toLocaleString()} acres (${feature.properties.designation})`);
  });
  
  // Count original points
  let originalPoints = 0;
  allFeatures.forEach(feature => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'MultiPolygon') {
      coords.forEach(polygon => {
        polygon.forEach(ring => {
          originalPoints += ring.length;
        });
      });
    } else if (feature.geometry.type === 'Polygon') {
      coords.forEach(ring => {
        originalPoints += ring.length;
      });
    }
  });
  
  console.log('');
  console.log(`Original coordinate points: ${originalPoints.toLocaleString()}`);
  console.log('Applying simplification...');
  
  // Apply simplification
  allFeatures = allFeatures.map(feature => ({
    ...feature,
    geometry: simplifyGeometry(feature.geometry, tolerance)
  }));
  
  // Count simplified points
  let simplifiedPoints = 0;
  allFeatures.forEach(feature => {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'MultiPolygon') {
      coords.forEach(polygon => {
        polygon.forEach(ring => {
          simplifiedPoints += ring.length;
        });
      });
    } else if (feature.geometry.type === 'Polygon') {
      coords.forEach(ring => {
        simplifiedPoints += ring.length;
      });
    }
  });
  
  console.log(`Simplified coordinate points: ${simplifiedPoints.toLocaleString()}`);
  console.log(`Point reduction: ${((1 - simplifiedPoints / originalPoints) * 100).toFixed(1)}%`);
  
  // Create output GeoJSON
  const output = {
    type: 'FeatureCollection',
    name: 'Missouri Conservation Areas',
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
      }
    },
    features: allFeatures
  };
  
  // Write output file
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
  
  const outputSize = fs.statSync(outputFile).size;
  console.log('');
  console.log(`Output file: ${outputFile}`);
  console.log(`Output size: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Total features: ${allFeatures.length}`);
  console.log('');
  console.log('Done!');
}

// Parse command line arguments
const args = process.argv.slice(2);
const minAcres = args[0] ? parseInt(args[0]) : 100;
const tolerance = args[1] ? parseFloat(args[1]) : 0.001;

if (isNaN(minAcres) || minAcres < 0) {
  console.error('Error: Invalid minimum acres value');
  process.exit(1);
}

if (isNaN(tolerance) || tolerance <= 0) {
  console.error('Error: Invalid tolerance value');
  process.exit(1);
}

// Run the script
createMoConservationPolygons(minAcres, tolerance);
