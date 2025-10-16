/**
 * GeoJSON Simplification Script
 * 
 * This script simplifies polygon geometries in a GeoJSON file using the
 * Douglas-Peucker algorithm to reduce file size while maintaining visual fidelity.
 * 
 * Usage: node scripts/simplify-geojson.js <input-file> <output-file> [tolerance]
 */

const fs = require('fs');
const path = require('path');

// Douglas-Peucker algorithm for line simplification
// This reduces the number of points in a polygon while maintaining its shape
function simplifyDouglasPeucker(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }

  // Find the point with the maximum distance from the line segment
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

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    // Recursive call
    const leftSegment = simplifyDouglasPeucker(points.slice(0, maxIndex + 1), tolerance);
    const rightSegment = simplifyDouglasPeucker(points.slice(maxIndex), tolerance);

    // Merge results (remove duplicate middle point)
    return leftSegment.slice(0, -1).concat(rightSegment);
  } else {
    // Return just the endpoints
    return [points[0], points[end]];
  }
}

// Calculate perpendicular distance from a point to a line segment
function perpendicularDistance(point, lineStart, lineEnd) {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;

  const dx = x2 - x1;
  const dy = y2 - y1;

  // If the line segment is actually a point, return distance to that point
  if (dx === 0 && dy === 0) {
    return Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  }

  // Calculate perpendicular distance using the formula:
  // distance = |ax + by + c| / sqrt(a^2 + b^2)
  const numerator = Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1);
  const denominator = Math.sqrt(dx ** 2 + dy ** 2);

  return numerator / denominator;
}

// Simplify a polygon (array of rings)
function simplifyPolygon(coordinates, tolerance) {
  return coordinates.map(ring => simplifyDouglasPeucker(ring, tolerance));
}

// Simplify a multipolygon (array of polygons)
function simplifyMultiPolygon(coordinates, tolerance) {
  return coordinates.map(polygon => simplifyPolygon(polygon, tolerance));
}

// Simplify geometry based on its type
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
  } else {
    // Return unchanged for other geometry types
    return geometry;
  }
}

// Main function
function simplifyGeoJSON(inputFile, outputFile, tolerance = 0.001) {
  console.log(`Reading GeoJSON from: ${inputFile}`);
  console.log(`Tolerance: ${tolerance}`);

  // Read the input file
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

  // Count original points
  let originalPoints = 0;
  data.features.forEach(feature => {
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

  console.log(`Original points: ${originalPoints.toLocaleString()}`);
  console.log(`Processing ${data.features.length} features...`);

  // Simplify each feature
  const startTime = Date.now();
  data.features = data.features.map((feature, index) => {
    if ((index + 1) % 10 === 0) {
      console.log(`  Processed ${index + 1}/${data.features.length} features...`);
    }
    return {
      ...feature,
      geometry: simplifyGeometry(feature.geometry, tolerance)
    };
  });

  const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`Simplification completed in ${elapsedTime}s`);

  // Count simplified points
  let simplifiedPoints = 0;
  data.features.forEach(feature => {
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

  console.log(`Simplified points: ${simplifiedPoints.toLocaleString()}`);
  console.log(`Reduction: ${((1 - simplifiedPoints / originalPoints) * 100).toFixed(1)}%`);

  // Write the output file
  fs.writeFileSync(outputFile, JSON.stringify(data, null, 2));
  
  // Get file sizes
  const inputSize = fs.statSync(inputFile).size;
  const outputSize = fs.statSync(outputFile).size;
  
  console.log(`\nFile size comparison:`);
  console.log(`  Original: ${(inputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Simplified: ${(outputSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Reduction: ${((1 - outputSize / inputSize) * 100).toFixed(1)}%`);
  console.log(`\nSimplified GeoJSON written to: ${outputFile}`);
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('Usage: node simplify-geojson.js <input-file> <output-file> [tolerance]');
  console.error('');
  console.error('Arguments:');
  console.error('  input-file   Path to the input GeoJSON file');
  console.error('  output-file  Path to write the simplified GeoJSON file');
  console.error('  tolerance    Optional simplification tolerance (default: 0.001)');
  console.error('               Higher values = more simplification');
  console.error('               Recommended range: 0.0001 to 0.01');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];
const tolerance = args[2] ? parseFloat(args[2]) : 0.001;

// Validate inputs
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

if (isNaN(tolerance) || tolerance <= 0) {
  console.error(`Error: Invalid tolerance value: ${args[2]}`);
  console.error('Tolerance must be a positive number');
  process.exit(1);
}

// Run the simplification
simplifyGeoJSON(inputFile, outputFile, tolerance);
