/**
 * Convert miles to meters
 */
function milesToMeters(miles) {
  return miles * 1609.34;
}

/**
 * Calculate a point at a given distance and bearing from a center point
 * @param {number} lat - Latitude of center point
 * @param {number} lng - Longitude of center point
 * @param {number} distance - Distance in meters
 * @param {number} bearing - Bearing in degrees (0-360)
 * @returns {Array} [lat, lng] of the calculated point
 */
function calculatePointAtDistance(lat, lng, distance, bearing) {
  const R = 6371000; // Earth's radius in meters
  const brng = bearing * Math.PI / 180; // Convert bearing to radians
  const lat1 = lat * Math.PI / 180;
  const lng1 = lng * Math.PI / 180;
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distance / R) +
    Math.cos(lat1) * Math.sin(distance / R) * Math.cos(brng)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(brng) * Math.sin(distance / R) * Math.cos(lat1),
    Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return [lat2 * 180 / Math.PI, lng2 * 180 / Math.PI];
}

/**
 * Generate heat map data points for conservation areas
 * Creates concentric rings of points around each area with intensities based on distance
 * 
 * @param {Array} conservationAreas - Array of conservation area objects with lat, lng, radius
 * @returns {Array} Array of [lat, lng, intensity] points for leaflet.heat
 */
export function generateHeatMapData(conservationAreas) {
  const heatPoints = [];
  
  // Distance rings in miles with corresponding intensities
  // Bright cyan at 0 miles (intensity 1.0)
  // Gradually fading to light cyan at 50 miles (intensity 0.25)
  const distanceRings = [
    { miles: 0, intensity: 1.0, pointsPerRing: 1 },      // Center point
    { miles: 5, intensity: 0.95, pointsPerRing: 8 },
    { miles: 10, intensity: 0.85, pointsPerRing: 12 },
    { miles: 15, intensity: 0.75, pointsPerRing: 16 },
    { miles: 20, intensity: 0.65, pointsPerRing: 20 },
    { miles: 25, intensity: 0.55, pointsPerRing: 24 },
    { miles: 30, intensity: 0.45, pointsPerRing: 28 },
    { miles: 35, intensity: 0.35, pointsPerRing: 32 },
    { miles: 40, intensity: 0.30, pointsPerRing: 36 },
    { miles: 45, intensity: 0.27, pointsPerRing: 40 },
    { miles: 50, intensity: 0.25, pointsPerRing: 44 }    // Final threshold at 50 miles
  ];
  
  conservationAreas.forEach(area => {
    distanceRings.forEach(ring => {
      if (ring.pointsPerRing === 1) {
        // Add center point
        heatPoints.push([area.lat, area.lng, ring.intensity]);
      } else {
        // Add points in a ring around the conservation area
        const distanceMeters = milesToMeters(ring.miles);
        const angleStep = 360 / ring.pointsPerRing;
        
        for (let i = 0; i < ring.pointsPerRing; i++) {
          const bearing = i * angleStep;
          const [lat, lng] = calculatePointAtDistance(
            area.lat,
            area.lng,
            distanceMeters,
            bearing
          );
          heatPoints.push([lat, lng, ring.intensity]);
        }
      }
    });
  });
  
  return heatPoints;
}
