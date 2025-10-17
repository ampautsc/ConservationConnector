import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents, Polyline, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './ConservationMap.css';
import HeatMapLayer from './HeatMapLayer';

// Component to handle map clicks for adding new areas
function MapClickHandler({ onMapClick, isAddingArea }) {
  useMapEvents({
    click: (e) => {
      if (isAddingArea) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

// Calculate centroid of a polygon or multipolygon geometry
function calculateCentroid(geometry) {
  let totalLat = 0;
  let totalLng = 0;
  let totalPoints = 0;
  
  // Handle both Polygon and MultiPolygon
  const polygons = geometry.type === 'MultiPolygon' 
    ? geometry.coordinates 
    : [geometry.coordinates];
  
  // Iterate through all polygons and their rings
  for (const polygon of polygons) {
    // Only use the outer ring (first array) for centroid calculation
    const outerRing = polygon[0];
    for (const [lng, lat] of outerRing) {
      totalLng += lng;
      totalLat += lat;
      totalPoints++;
    }
  }
  
  return {
    lat: totalLat / totalPoints,
    lng: totalLng / totalPoints
  };
}

// Calculate distance between two points using Haversine formula (in meters)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Constants for geographic calculations
const KM_PER_DEGREE_LAT = 111.32; // Approximate kilometers per degree of latitude

// Create a circular polygon from a point and area (in km²)
// This is used to visualize conservation sites with only Point geometry as approximate polygons
function createCircularPolygon(lat, lng, areaKm2, numPoints = 32) {
  // Calculate radius from area: area = π * r²
  const radiusKm = Math.sqrt(areaKm2 / Math.PI);
  const radiusDegrees = radiusKm / KM_PER_DEGREE_LAT;
  
  // Pre-calculate latitude in radians for performance
  const latRadians = lat * Math.PI / 180;
  const cosLat = Math.cos(latRadians);
  
  const coordinates = [];
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 360 / numPoints) * Math.PI / 180;
    const dx = radiusDegrees * Math.cos(angle) / cosLat;
    const dy = radiusDegrees * Math.sin(angle);
    coordinates.push([lng + dx, lat + dy]);
  }
  
  return {
    type: 'Polygon',
    coordinates: [coordinates]
  };
}

// Calculate gap between two conservation areas (edge to edge)
function calculateGap(area1, area2) {
  const centerDistance = calculateDistance(area1.lat, area1.lng, area2.lat, area2.lng);
  return Math.max(0, centerDistance - area1.radius - area2.radius);
}

// Color constants for conservation areas
const CONSERVATION_SITE_COLORS = {
  fill: '#ff8833',
  stroke: '#cc6622'
};

// Get color for heat map based on gap distance
// Colors are assigned based on specific distance thresholds:
// 0-25 miles: green
// 25-50 miles: blue
// 50-100 miles: orange
function getHeatMapColor(gap) {
  const gapInMiles = gap / 1609.34;
  
  if (gapInMiles <= 25) {
    return '#00ff00'; // Green for 0-25 miles
  } else if (gapInMiles <= 50) {
    return '#0000ff'; // Blue for 25-50 miles
  } else if (gapInMiles <= 100) {
    return '#ffa500'; // Orange for 50-100 miles
  }
  
  return null; // Don't draw lines over 100 miles
}

export default function ConservationMap() {
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [conservationAreas, setConservationAreas] = useState([]);
  const [siteAreas, setSiteAreas] = useState([]);
  const [newAreas, setNewAreas] = useState([]);
  const [isAddingArea, setIsAddingArea] = useState(false);
  const [newAreaRadius, setNewAreaRadius] = useState(25000);
  const [newAreaName, setNewAreaName] = useState('');
  const [showHeatMap, setShowHeatMap] = useState(true);
  const [showAreas, setShowAreas] = useState(true);
  const [showGradientHeatMap, setShowGradientHeatMap] = useState(false);

  // State for site GeoJSON data
  const [siteGeoJsonData, setSiteGeoJsonData] = useState(null);

  // Load GeoJSON data and transform to internal format for heat map calculations
  useEffect(() => {
    // Load conservation areas from conservation-areas.json
    fetch('/data/conservation-areas.json')
      .then(response => {
        // Check if the response is successful (status in the 200-299 range)
        if (!response.ok) {
          // If not successful, read the response as text to see the error message
          return response.text().then(text => {
            throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
          });
        }
        // If successful, proceed to parse as JSON
        return response.json();
      })
      .then(areas => {
        // Convert to GeoJSON format for rendering
        const features = areas.filter(area => area.geometry).map(area => ({
          type: 'Feature',
          properties: {
            name: area.name,
            description: area.description,
            state: area.state || 'Unknown',
            established: area.established || 0,
            area_km2: area.area_km2 || 0
          },
          geometry: area.geometry
        }));
        
        setGeoJsonData({
          type: 'FeatureCollection',
          features: features
        });
        
        // Transform to internal format for heat map calculations
        // For areas with geometry, calculate centroids; otherwise use lat/lng
        const transformedAreas = areas.map((area, index) => {
          let lat, lng;
          if (area.geometry) {
            const centroid = calculateCentroid(area.geometry);
            lat = centroid.lat;
            lng = centroid.lng;
          } else {
            lat = area.lat;
            lng = area.lng;
          }
          
          return {
            id: area.id || `area-${index}`,
            name: area.name,
            lat: lat,
            lng: lng,
            radius: area.radius || Math.sqrt(area.area_km2 || 100) * 500,
            description: area.description,
            state: area.state || 'Unknown',
            established: area.established || 0,
            area_km2: area.area_km2 || 0
          };
        });
        setConservationAreas(transformedAreas);
      })
      .catch(err => console.error('Error loading conservation areas data:', err));

    // Load individual conservation site files
    // List of all site files to load
    const siteFiles = [
      'angeles-nf', 'angelina-nf', 'apache-sitgreaves-nf', 'apalachicola-nf',
      'aransas-nwr', 'arctic-nwr', 'beaverhead-deerlodge-nf', 'big-bend-np',
      'big-cypress-national-preserve', 'big-muddy-nwr', 'big-thicket-national-preserve',
      'bighorn-nf', 'bridger-teton-nf', 'buenos-aires-nwr', 'caribou-targhee-nf',
      'charles-m-russell-nwr', 'chugach-nf', 'coconino-nf', 'coronado-nf',
      'custer-gallatin-nf', 'davy-crockett-nf', 'death-valley-np', 'denali-np',
      'ding-darling-nwr', 'eleven-point-river', 'everglades-np', 'flaming-gorge-nra',
      'flathead-nf', 'florida-panther-nwr', 'gates-of-arctic-np', 'glacier-bay-np',
      'glacier-np', 'grand-canyon-np', 'grand-teton-np', 'guadalupe-mountains-np',
      'helena-lewis-clark-nf', 'hercules-glades-wilderness', 'inyo-nf', 'irish-wilderness',
      'joshua-tree-np', 'kaibab-nf', 'katmai-np', 'kootenai-nf', 'laguna-atascosa-nwr',
      'lake-clark-np', 'lewis-and-clark-nf', 'lolo-nf', 'loxahatchee-nwr',
      'mark-twain-nf', 'medicine-bow-routt-nf', 'merritt-island-nwr',
      'middle-mississippi-river-nwr', 'mingo-nwr', 'mojave-national-preserve',
      'national-elk-refuge', 'ocala-nf', 'ozark-nsr', 'padre-island-ns',
      'petrified-forest-np', 'piney-creek-wilderness', 'prescott-nf', 'sabine-nf',
      'saguaro-np', 'sam-houston-nf', 'san-bernardino-nf', 'seedskadee-nwr',
      'sequoia-kings-canyon-np', 'sequoia-nf', 'shoshone-nf', 'sierra-nf',
      'st-marks-nwr', 'swan-lake-nwr', 'ten-thousand-islands-nwr', 'tongass-nf',
      'tonto-nf', 'wrangell-st-elias-np', 'yellowstone-np', 'yosemite-np',
      'yukon-delta-nwr'
    ];

    // Load all site files
    Promise.all(
      siteFiles.map(siteId =>
        fetch(`/data/sites/${siteId}.json`)
          .then(response => {
            if (!response.ok) {
              console.warn(`Failed to load site: ${siteId}`);
              return null;
            }
            return response.json();
          })
          .catch(err => {
            console.warn(`Error loading site ${siteId}:`, err);
            return null;
          })
      )
    )
      .then(sites => {
        // Filter out null values (failed loads)
        const validSites = sites.filter(site => site !== null);
        
        // Transform to internal format for heat map calculations
        const transformedSites = validSites.map(site => ({
          id: site.id,
          name: site.name,
          lat: site.location.lat,
          lng: site.location.lng,
          // Calculate radius from area in km2
          radius: Math.sqrt(site.area.km2 || 100) * 500,
          description: site.description,
          state: site.location.state || 'Unknown',
          designation: site.designation,
          area_km2: site.area.km2 || 0,
          isSiteFile: true
        }));
        setSiteAreas(transformedSites);
        
        // Create GeoJSON FeatureCollection from site data for polygon rendering
        // Include ALL sites - for those with Point geometry, create circular polygons from area
        const siteFeatures = validSites
          .filter(site => site.geometry)
          .map(site => {
            let geometry = site.geometry;
            
            // For Point geometry, create a circular polygon based on the site's area
            // Only create circular polygon if area data is valid (positive value)
            if (site.geometry.type === 'Point' && site.area && site.area.km2 && site.area.km2 > 0) {
              geometry = createCircularPolygon(
                site.location.lat,
                site.location.lng,
                site.area.km2
              );
            }
            
            return {
              type: 'Feature',
              properties: {
                name: site.name,
                description: site.description,
                state: site.location.state || 'Unknown',
                designation: site.designation,
                area_km2: site.area.km2 || 0
              },
              geometry: geometry
            };
          });
        
        setSiteGeoJsonData({
          type: 'FeatureCollection',
          features: siteFeatures
        });
      })
      .catch(err => console.error('Error loading conservation sites:', err));
  }, []);

  // All areas (existing + sites + new)
  const allAreas = useMemo(() => [...conservationAreas, ...siteAreas, ...newAreas], [conservationAreas, siteAreas, newAreas]);

  // Calculate heat map lines
  const heatMapLines = useMemo(() => {
    if (!showHeatMap || allAreas.length < 2) return [];
    
    const lines = [];
    
    // Create lines with colors, filtering by distance thresholds
    for (let i = 0; i < allAreas.length; i++) {
      for (let j = i + 1; j < allAreas.length; j++) {
        const gap = calculateGap(allAreas[i], allAreas[j]);
        const color = getHeatMapColor(gap);
        
        // Only add lines that are within our distance thresholds (≤100 miles)
        if (color !== null) {
          lines.push({
            positions: [
              [allAreas[i].lat, allAreas[i].lng],
              [allAreas[j].lat, allAreas[j].lng]
            ],
            color,
            gap,
            area1: allAreas[i].name,
            area2: allAreas[j].name
          });
        }
      }
    }
    
    return lines;
  }, [allAreas, showHeatMap]);

  const handleMapClick = useCallback((latlng) => {
    if (!isAddingArea) return;
    
    const name = newAreaName || `New Area ${newAreas.length + 1}`;
    const newArea = {
      id: `new-${Date.now()}`,
      name,
      lat: latlng.lat,
      lng: latlng.lng,
      radius: newAreaRadius,
      description: 'User-added conservation area',
      isNew: true
    };
    
    setNewAreas(prev => [...prev, newArea]);
    setNewAreaName('');
    setIsAddingArea(false);
  }, [isAddingArea, newAreaRadius, newAreaName, newAreas.length]);

  const handleSubmitNewAreas = async () => {
    if (newAreas.length === 0) {
      alert('No new areas to submit');
      return;
    }

    // In a real app, this would send to a backend API
    // For now, we'll simulate saving to file
    const dataToSave = {
      timestamp: new Date().toISOString(),
      areas: newAreas
    };

    console.log('Submitting new areas:', dataToSave);
    
    // Create a downloadable file
    const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new-conservation-areas-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`${newAreas.length} new area(s) saved! File downloaded to your computer.`);
    
    // Optionally clear new areas after submission
    // setNewAreas([]);
  };

  const handleDeleteNewArea = (id) => {
    setNewAreas(prev => prev.filter(area => area.id !== id));
  };

  return (
    <div className="conservation-map-container">
      <div className="toolbox">
        <h2>Conservation Connector</h2>
        
        <div className="tool-section">
          <h3>Layers</h3>
          <label>
            <input 
              type="checkbox" 
              checked={showAreas} 
              onChange={(e) => setShowAreas(e.target.checked)}
            />
            Show Conservation Areas
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showHeatMap} 
              onChange={(e) => setShowHeatMap(e.target.checked)}
            />
            Show Connection Lines
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={showGradientHeatMap} 
              onChange={(e) => setShowGradientHeatMap(e.target.checked)}
            />
            Show Gradient Heat Map
          </label>
        </div>

        <div className="tool-section">
          <h3>Add New Area</h3>
          <input 
            type="text"
            placeholder="Area name (optional)"
            value={newAreaName}
            onChange={(e) => setNewAreaName(e.target.value)}
            className="area-name-input"
          />
          <label>
            Radius (km):
            <input 
              type="range" 
              min="5000" 
              max="200000" 
              step="5000"
              value={newAreaRadius}
              onChange={(e) => setNewAreaRadius(Number(e.target.value))}
            />
            <span>{(newAreaRadius / 1000).toFixed(0)} km</span>
          </label>
          <button 
            onClick={() => setIsAddingArea(!isAddingArea)}
            className={isAddingArea ? 'active' : ''}
          >
            {isAddingArea ? 'Cancel Adding' : 'Click Map to Add Area'}
          </button>
        </div>

        {newAreas.length > 0 && (
          <div className="tool-section">
            <h3>New Areas ({newAreas.length})</h3>
            <div className="new-areas-list">
              {newAreas.map(area => (
                <div key={area.id} className="new-area-item">
                  <span>{area.name}</span>
                  <button 
                    onClick={() => handleDeleteNewArea(area.id)}
                    className="delete-btn"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleSubmitNewAreas}
              className="submit-btn"
            >
              Submit All New Areas
            </button>
          </div>
        )}

        <div className="tool-section">
          <h3>Legend</h3>
          <div className="legend">
            <h4>Connection Lines</h4>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#00ff00', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>0-25 miles</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#0000ff', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>25-50 miles</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#ffa500', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>50-100 miles</span>
            </div>
            <h4>Gradient Heat Map</h4>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#00bcd4', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>Conservation Area (0 mi)</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#26c6da', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>15 miles</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#4dd0e1', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>25 miles</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{background: '#80deea', width: '20px', height: '10px', display: 'inline-block', marginRight: '5px'}}></span>
              <span>50 miles</span>
            </div>
            <h4>Areas</h4>
            <div className="legend-item">
              <span className="legend-circle existing"></span>
              <span>Conservation Areas (from conservation-areas.json)</span>
            </div>
            <div className="legend-item">
              <span className="legend-circle" style={{background: CONSERVATION_SITE_COLORS.fill, border: `2px solid ${CONSERVATION_SITE_COLORS.stroke}`}}></span>
              <span>Conservation Sites (NF, NWR, etc.)</span>
            </div>
            <div className="legend-item">
              <span className="legend-circle new"></span>
              <span>New Areas</span>
            </div>
          </div>
        </div>

        <div className="tool-section stats">
          <h3>Statistics</h3>
          <p>Total Areas: {allAreas.length}</p>
          <p>Conservation Areas: {conservationAreas.length}</p>
          <p>Conservation Sites: {siteAreas.length}</p>
          <p>New: {newAreas.length}</p>
          <p>Connections: {heatMapLines.length}</p>
        </div>
      </div>

      <MapContainer 
        center={[39, -98]} 
        zoom={4} 
        className="map"
        minZoom={2}
        maxZoom={18}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapClickHandler onMapClick={handleMapClick} isAddingArea={isAddingArea} />
        
        {/* Gradient heat map layer */}
        {showGradientHeatMap && <HeatMapLayer conservationAreas={allAreas} />}
        
        {/* Heat map lines */}
        {showHeatMap && heatMapLines.map((line, idx) => (
          <Polyline 
            key={`line-${idx}`}
            positions={line.positions}
            color={line.color}
            weight={2}
            opacity={0.6}
          >
            <Popup>
              <strong>{line.area1}</strong> ↔ <strong>{line.area2}</strong><br />
              Gap: {(line.gap / 1000).toFixed(0)} km
            </Popup>
          </Polyline>
        ))}
        
        {/* Conservation areas from conservation-areas.json - showing actual polygon shapes */}
        {showAreas && geoJsonData && (
          <GeoJSON 
            key="conservation-areas"
            data={geoJsonData}
            style={() => ({
              fillColor: '#3388ff',
              color: '#2266cc',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.4
            })}
            onEachFeature={(feature, layer) => {
              // Bind popup to each feature
              if (feature.properties) {
                const props = feature.properties;
                const popupContent = `
                  <strong>${props.name}</strong><br />
                  ${props.state}<br />
                  ${props.established ? `Established: ${props.established}<br />` : ''}
                  ${props.area_km2 ? `Area: ${props.area_km2} km²<br />` : ''}
                  ${props.description}
                `;
                layer.bindPopup(popupContent);
              }
            }}
          />
        )}
        
        {/* Conservation site areas from individual JSON files - only polygons, not points */}
        {showAreas && siteGeoJsonData && (
          <GeoJSON 
            key="site-conservation-areas"
            data={siteGeoJsonData}
            style={() => ({
              fillColor: CONSERVATION_SITE_COLORS.fill,
              color: CONSERVATION_SITE_COLORS.stroke,
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.4
            })}
            onEachFeature={(feature, layer) => {
              // Bind popup to each feature
              if (feature.properties) {
                const props = feature.properties;
                const popupContent = `
                  <strong>${props.name}</strong><br />
                  ${props.state}<br />
                  ${props.designation ? `Designation: ${props.designation}<br />` : ''}
                  ${props.area_km2 ? `Area: ${props.area_km2} km²<br />` : ''}
                  ${props.description}
                `;
                layer.bindPopup(popupContent);
              }
            }}
          />
        )}
        
        {/* New areas added by user (still using circles) */}
        {showAreas && newAreas.map(area => (
          <Circle
            key={area.id}
            center={[area.lat, area.lng]}
            radius={area.radius}
            pathOptions={{
              color: '#00ff00',
              fillColor: '#00ff00',
              fillOpacity: 0.3,
              weight: 2
            }}
          >
            <Popup>
              <strong>{area.name}</strong><br />
              {area.description}<br />
              Radius: {(area.radius / 1000).toFixed(0)} km
              <br /><em>(New Area)</em>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
