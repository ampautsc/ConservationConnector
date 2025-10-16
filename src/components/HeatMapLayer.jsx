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
    // Green → Blue → Indigo → Violet
    const heatOptions = {
      radius: 30,
      blur: 25,
      maxZoom: 10,
      max: 1.0,
      minOpacity: 0.4,
      gradient: {
        0.0: 'violet',    // 100 miles (lowest intensity)
        0.25: 'violet',
        0.5: 'indigo',    // 50 miles
        0.75: 'blue',     // 25 miles
        1.0: 'green'      // Conservation area (highest intensity)
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
