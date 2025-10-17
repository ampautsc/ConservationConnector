#!/bin/bash

# Download Real Boundary Data from Official Sources
# 
# This script downloads actual polygon boundaries from U.S. government
# open data portals and processes them to update conservation site files.

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCES_DIR="$SCRIPT_DIR/../public/data/geojson/sources"

mkdir -p "$SOURCES_DIR"

echo "Downloading Official Boundary Data"
echo "==================================="
echo

# 1. Download FWS Wildlife Refuge Boundaries
echo "1. Downloading FWS Wildlife Refuge Boundaries..."
echo "   Source: FWS National Realty Boundaries (OpenData)"

# This is the official FWS open data portal GeoJSON export
# Updated URL - try the ArcGIS Open Data portal
wget -O "$SOURCES_DIR/fws-refuges.geojson" \
  "https://services.arcgis.com/QVENGdaPbd4LUkLV/arcgis/rest/services/FWS_National_Realty_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson" \
  --no-check-certificate \
  --timeout=300 \
  || echo "  Warning: FWS download may have failed, trying alternative..."

# Alternative: Try downloading from data.gov catalog
if [ ! -s "$SOURCES_DIR/fws-refuges.geojson" ]; then
  echo "  Trying alternative FWS source..."
  # We'll handle this with the smaller query approach
  echo "  Will use API queries instead of full download"
fi

echo

# 2. Download USFS National Forest Boundaries
echo "2. Downloading USFS National Forest Boundaries..."
echo "   Source: US Forest Service EDW"

# USFS provides data via their Enterprise Data Warehouse
# The shapefile can be converted to GeoJSON
echo "  Attempting to download USFS data..."

# Try to get a simplified version or use the API query
wget -O "$SOURCES_DIR/usfs-forests.geojson" \
  "https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_ForestSystemBoundaries_01/MapServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson" \
  --no-check-certificate \
  --timeout=300 \
  || echo "  Warning: USFS download may have failed, trying alternative..."

echo

# 3. Download NPS Unit Boundaries
echo "3. Downloading NPS Unit Boundaries..."
echo "   Source: National Park Service Data API"

wget -O "$SOURCES_DIR/nps-units.geojson" \
  "https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query?where=1%3D1&outFields=*&outSR=4326&f=geojson" \
  --no-check-certificate \
  --timeout=300 \
  || echo "  Warning: NPS download may have failed"

echo

# Check file sizes
echo "Download Summary:"
echo "=================="
for file in "$SOURCES_DIR"/*.geojson; do
  if [ -f "$file" ]; then
    size=$(du -h "$file" | cut -f1)
    count=$(jq '.features | length' "$file" 2>/dev/null || echo "0")
    echo "  $(basename "$file"): $size ($count features)"
  fi
done

echo
echo "✓ Download complete!"
echo
echo "Next step: Run the extraction script"
echo "  node scripts/extract-from-downloaded-data.cjs"
echo
