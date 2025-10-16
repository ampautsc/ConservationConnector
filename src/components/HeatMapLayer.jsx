import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { generateHeatMapData } from '../utils/heatMapUtils';

/**
 * HeatMapLayer component for React-Leaflet
 * Displays a heat map visualization around conservation areas
 */
export default function HeatMapLayer({ conservationAreas, options = {} }) {
  const map = useMap();
  
  useEffect(() => {
    if (!conservationAreas || conservationAreas.length === 0) {
      return;
    }
    
    // Generate heat map data points
    const heatData = generateHeatMapData(conservationAreas);
    
    // Configure heat map options with gradient colors
    // Soft gradient: light blue → cyan → light green → lime
    const heatOptions = {
      radius: 25,
      blur: 20,
      max: 1.0,
      minOpacity: 0.05,
      gradient: {
        0.0: '#e0f7fa',   // 100 miles (lowest intensity) - very light cyan
        0.25: '#80deea',  // Light cyan
        0.5: '#4dd0e1',   // Cyan
        0.75: '#26c6da',  // Medium cyan
        1.0: '#00bcd4'    // Conservation area (highest intensity) - bright cyan
      },
      ...options
    };
    
    // Create and add heat layer to map
    const heatLayer = L.heatLayer(heatData, heatOptions);
    heatLayer.addTo(map);
    
    // Cleanup function to remove layer when component unmounts
    return () => {
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [map, conservationAreas, options]);
  
  return null;
}
