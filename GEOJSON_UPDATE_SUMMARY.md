# GeoJSON Update Summary

## Problem Statement
All conservation site files were added with Point geometry (center coordinates only) instead of accurate polygon boundaries representing the actual area boundaries.

## Solution Implemented

### Phase 1: National Parks (✅ Completed)

**Status**: 19 National Parks updated with accurate polygon boundaries

### Phase 1.5: Missouri Sites (✅ Completed)

**Status**: 10 Missouri conservation sites updated with accurate polygon boundaries from existing PADUS data

**National Parks Approach**:
- Extracted polygon data from existing `us-national-parks-polygons.geojson` file
- Matched parks by name and updated geometry from Point to Polygon/MultiPolygon
- Updated metadata with data quality = "high" and source attribution

**Missouri Sites Approach**:
- Extracted polygon data from PADUS 3.0 dataset
- Matched sites by name, supporting multiple feature matches for complex areas
- Combined multiple features into MultiPolygon where applicable
- Updated metadata with data quality = "high" and source attribution

**Parks Updated**:
1. Big Bend National Park
2. Death Valley National Park
3. Denali National Park
4. Everglades National Park
5. Gates of the Arctic National Park
6. Glacier Bay National Park
7. Glacier National Park
8. Grand Canyon National Park
9. Grand Teton National Park
10. Guadalupe Mountains National Park
11. Joshua Tree National Park
12. Katmai National Park
13. Lake Clark National Park
14. Petrified Forest National Park
15. Saguaro National Park
16. Sequoia and Kings Canyon National Parks
17. Wrangell-St. Elias National Park
18. Yellowstone National Park
19. Yosemite National Park

**Script**: `scripts/update-site-geometries.cjs`

**Missouri Sites Updated**:
1. Mark Twain National Forest
2. Big Muddy National Fish and Wildlife Refuge
3. Ozark National Scenic Riverways
4. Mingo National Wildlife Refuge
5. Irish Wilderness
6. Hercules Glades Wilderness
7. Piney Creek Wilderness
8. Swan Lake National Wildlife Refuge (Loess Bluffs)
9. Eleven Point Wild and Scenic River
10. Middle Mississippi River National Wildlife Refuge

**Script**: `scripts/update-missouri-from-polygons.cjs`
**Data Source**: PADUS 3.0 dataset

### Phase 2: Remaining Sites (⏳ Pending Data)

**Status**: 50 sites identified and documented, awaiting boundary data

**Breakdown**:
- 31 National Forests (USFS data needed) - 1 completed (Mark Twain NF)
- 11 National Wildlife Refuges (USFWS data needed) - 7 completed (Missouri refuges)
- 8 Other designations (NPS/PADUS data needed) - 2 completed (Missouri sites)

**Data Sources Required**:

1. **National Forest Boundaries** (USFS)
   - URL: https://data.fs.usda.gov/geodata/edw/edw_resources/fc/S_USA.AdministrativeForest.zip
   - Format: Shapefile → Convert to GeoJSON
   - Covers: All 32 National Forest sites

2. **Wildlife Refuge Boundaries** (USFWS)
   - URL: https://www.fws.gov/dataset/national-wildlife-refuge-boundaries
   - Alternative: https://gis-fws.opendata.arcgis.com/
   - Covers: All 18 Wildlife Refuge sites

3. **Alternative: PADUS 3.0** (Comprehensive)
   - URL: https://www.sciencebase.gov/catalog/item/626f6d39d34e915b67c3f3c6
   - Format: GeoDatabase or GeoJSON (state-by-state)
   - Covers: ALL remaining sites (recommended approach)

**Script Ready**: `scripts/extract-boundaries-from-sources.cjs`

## Implementation Details

### Directory Structure

```
public/data/
├── geojson/
│   ├── us-national-parks-polygons.geojson  (existing, used)
│   └── sources/                             (new, for downloaded data)
│       ├── README.md                        (instructions)
│       ├── national-forests.geojson        (to be added)
│       ├── wildlife-refuges.geojson        (to be added)
│       └── *.geojson                       (other sources)
└── sites/
    ├── yosemite-np.json                    (✅ updated with polygon)
    ├── yellowstone-np.json                 (✅ updated with polygon)
    ├── angeles-nf.json                     (⏳ still has Point geometry)
    └── ...
```

### Scripts Created

1. **update-site-geometries.cjs**
   - Updates National Parks from existing polygon data
   - Successfully processed 19 parks
   - Can be extended for other designations

2. **fetch-padus-boundaries.cjs**
   - Documents the 60 sites needing boundaries
   - Lists data sources and requirements
   - Provides structured information for data acquisition

3. **extract-boundaries-from-sources.cjs**
   - Processes downloaded boundary data files
   - Matches sites by name and designation
   - Updates site files with polygon geometry
   - Ready to use once data files are downloaded

### Metadata Updates

All updated sites now include enhanced metadata:

```json
{
  "metadata": {
    "source": "Conservation Connector Site Inventory",
    "lastUpdated": "2025-10-17",
    "dataQuality": "high",
    "geometrySource": "National Park Service via PADUS 3.0"
  }
}
```

**Data Quality Levels**:
- **high**: Accurate polygon boundaries from authoritative sources (19 parks)
- **medium**: Approximate boundaries (none currently)
- **low**: Point coordinates only (60 remaining sites)

## Documentation Created

1. **DATA_SOURCES.md**
   - Comprehensive list of authoritative data sources
   - Download instructions and API endpoints
   - Data quality guidelines
   - Implementation recommendations

2. **BOUNDARY_DATA_NEEDED.md**
   - Detailed breakdown of 60 sites needing data
   - Organized by designation type
   - Specific URLs and file formats
   - Processing instructions

3. **public/data/geojson/sources/README.md**
   - Instructions for placing downloaded data
   - Download and conversion commands
   - Processing workflow
   - File size considerations

4. **GEOJSON_UPDATE_SUMMARY.md** (this file)
   - Overall progress summary
   - Implementation details
   - Next steps

## Testing

**Build Status**: ✅ Passing
```bash
npm run lint   # ✓ No errors
npm run build  # ✓ Built successfully
```

**Verification**: Updated park files manually inspected
- Geometry changed from Point to Polygon/MultiPolygon
- Coordinates verified against known park boundaries
- File sizes reasonable (largest ~50KB for complex parks)

## Next Steps

### Option 1: Download and Process Data (Recommended)

1. Download National Forest boundaries from USFS
2. Download Wildlife Refuge boundaries from USFWS
3. Place files in `public/data/geojson/sources/`
4. Run `node scripts/extract-boundaries-from-sources.cjs`
5. Verify updates and commit

**Time Estimate**: 1-2 hours (including download and processing)

### Option 2: Use PADUS Comprehensive Dataset

1. Download PADUS 3.0 state files for relevant states
2. Place in sources directory
3. Run extraction script
4. More comprehensive but larger downloads

**Time Estimate**: 2-4 hours (larger downloads)

### Option 3: Request Data in Code Review

If data download is not feasible in the current environment:
1. Document data requirements in code review
2. Request team member to download and process
3. Provide scripts and instructions for easy integration

## Benefits of This Approach

1. **Incremental Progress**: 19 parks completed immediately
2. **Clear Path Forward**: Scripts and documentation ready for remaining 60 sites
3. **Authoritative Sources**: All data from official government sources
4. **Automated Processing**: Scripts handle matching and updating
5. **Quality Metadata**: Track data sources and quality levels
6. **Maintainable**: Easy to add more sites or update boundaries in the future

## File Size Impact

**Before**:
- Site files: ~350 bytes each (Point geometry only)
- Total: ~28 KB for 79 sites

**After (Parks only)**:
- Updated park files: 1-50 KB each (depending on boundary complexity)
- Remaining site files: ~350 bytes each
- Total: ~150 KB (parks) + 21 KB (others) = ~171 KB

**After (All sites complete)**:
- Estimated: 300-500 KB total for all 79 sites
- Still reasonable for web delivery
- Can be further optimized with simplification if needed

## Simplification

For very large/complex boundaries, use the simplification script:

```bash
node scripts/simplify-geojson.cjs input.geojson output.geojson 0.001
```

This reduces coordinate points while maintaining visual accuracy.

## Dependencies

**No new dependencies required** ✅
- All scripts use Node.js built-in modules
- Compatible with existing build process

## Backward Compatibility

✅ **Fully backward compatible**
- App already handles both Point and Polygon geometries
- See `ConservationMap.jsx` lines 19-45 (centroid calculation)
- Heat map calculations work with both types

## Security

✅ **No security concerns**
- Data from official government sources (public domain)
- No API keys or credentials needed
- Files processed locally, not uploaded anywhere

## Conclusion

**Completed**: 37% (29 of 79 sites) with accurate boundaries
- 19 National Parks
- 10 Missouri conservation sites

**Ready for**: 63% (50 of 79 sites) once data is downloaded
**Blocker**: Need to download boundary data from USFS/USFWS or PADUS

The infrastructure is in place to quickly complete the remaining updates once boundary data is obtained.
