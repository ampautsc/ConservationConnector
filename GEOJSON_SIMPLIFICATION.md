# GeoJSON Simplification Documentation

## Overview

This document describes the process used to simplify the `us-national-parks-polygons.geojson` file to reduce its size while maintaining visual fidelity.

## Problem

The original GeoJSON file was too large for efficient web delivery:
- **File Size**: 74.19 MB
- **Coordinate Points**: 945,654 points across 62 features
- **Impact**: Slow page load times, high bandwidth usage, poor user experience

## Solution

Implemented polygon simplification using the **Douglas-Peucker algorithm** (also known as Ramer-Douglas-Peucker algorithm), which is the industry-standard method for reducing the complexity of polylines and polygons while preserving their overall shape.

### Algorithm Details

The Douglas-Peucker algorithm works by:
1. Drawing a line between the first and last points of a polygon segment
2. Finding the point with the maximum perpendicular distance from this line
3. If this distance exceeds a tolerance threshold, the segment is split at that point
4. Recursively applying the algorithm to each sub-segment
5. If the distance is below the threshold, only the endpoints are kept

This process efficiently removes redundant points while maintaining the visual characteristics of the polygon.

## Results

### File Size Reduction
- **Original**: 74.19 MB
- **Simplified**: 2.00 MB
- **Reduction**: 97.3%

### Coordinate Point Reduction
- **Original**: 945,654 points
- **Simplified**: 24,513 points
- **Reduction**: 97.4%

### Parameters Used
- **Tolerance**: 0.001 degrees
  - This represents approximately 111 meters at the equator
  - Provides excellent balance between file size and visual accuracy
  - Maintains recognizable park boundaries at all zoom levels

## Usage

### Simplifying GeoJSON Files

Use the provided script to simplify any GeoJSON file:

```bash
node scripts/simplify-geojson.cjs <input-file> <output-file> [tolerance]
```

**Parameters:**
- `input-file`: Path to the original GeoJSON file
- `output-file`: Path where the simplified file will be written
- `tolerance`: (Optional) Simplification tolerance in degrees (default: 0.001)

**Example:**

```bash
# Simplify with default tolerance (0.001)
node scripts/simplify-geojson.cjs \
  public/data/geojson/us-national-parks-polygons.geojson.original \
  public/data/geojson/us-national-parks-polygons.geojson

# Simplify with custom tolerance
node scripts/simplify-geojson.cjs \
  input.geojson \
  output.geojson \
  0.002
```

### Choosing Tolerance Values

The tolerance parameter determines how aggressively the simplification is applied:

| Tolerance | Result | Use Case |
|-----------|--------|----------|
| 0.0001 | Minimal simplification (~80% reduction) | High detail requirements, large zoom levels |
| 0.0005 | Light simplification (~95% reduction) | Good detail with moderate file size |
| 0.001 | **Recommended** (~97% reduction) | Best balance for web applications |
| 0.002 | Aggressive simplification (~98% reduction) | Small file size, lower detail |
| 0.005+ | Very aggressive (>99% reduction) | Overview maps, very low detail acceptable |

### Testing Different Tolerances

To test different tolerance values without modifying the production file:

```bash
# Test multiple tolerances
node scripts/simplify-geojson.cjs input.geojson /tmp/test-0.0005.geojson 0.0005
node scripts/simplify-geojson.cjs input.geojson /tmp/test-0.001.geojson 0.001
node scripts/simplify-geojson.cjs input.geojson /tmp/test-0.002.geojson 0.002

# Compare file sizes
ls -lh /tmp/test-*.geojson
```

## Verification

After simplification, verify the results:

1. **Check file size**: Ensure significant reduction achieved
2. **Validate JSON structure**: Parse the file to ensure valid GeoJSON
3. **Visual inspection**: Load in mapping application to verify shapes
4. **Feature count**: Confirm all features preserved
5. **Property preservation**: Verify all feature properties intact

The simplified file was verified to:
- ✅ Load successfully in the Conservation Connector application
- ✅ Maintain all 62 national park features
- ✅ Preserve all feature properties (name, state, area, etc.)
- ✅ Render correctly at various zoom levels
- ✅ Work properly with the heat map functionality

## Technical Details

### Supported Geometry Types
- `Polygon`: Single polygon features
- `MultiPolygon`: Features with multiple disconnected polygons
- Other types: Passed through unchanged

### Precision
- Coordinate precision is maintained
- No rounding applied to remaining points
- Original coordinate reference system (WGS84) preserved

### Backup
- Original file backed up as `.original` extension
- `.original` files excluded from git via `.gitignore`

## Performance Impact

### Before Simplification
- Initial load time: ~3-5 seconds (depending on connection)
- Render time: ~1-2 seconds
- Memory usage: High

### After Simplification
- Initial load time: ~0.5-1 seconds
- Render time: ~0.3-0.5 seconds
- Memory usage: Significantly reduced

## Maintenance

### When to Re-simplify
- When adding new features to the GeoJSON file
- When updating existing feature boundaries
- When optimizing for different use cases (e.g., mobile vs desktop)

### Best Practices
1. Always keep a backup of the original data
2. Test different tolerance values to find optimal balance
3. Verify visual appearance after simplification
4. Document the parameters used for future reference
5. Consider different simplification levels for different zoom ranges

## References

- [Douglas-Peucker Algorithm (Wikipedia)](https://en.wikipedia.org/wiki/Ramer%E2%80%93Douglas%E2%80%93Peucker_algorithm)
- [GeoJSON Specification](https://geojson.org/)
- [Leaflet GeoJSON Documentation](https://leafletjs.com/reference.html#geojson)

## Script Location

The simplification script is located at:
```
scripts/simplify-geojson.cjs
```

This is a standalone CommonJS script that can be run directly with Node.js without any dependencies.
