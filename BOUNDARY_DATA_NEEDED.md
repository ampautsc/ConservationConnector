# Boundary Data Needed for Conservation Sites

## Status Summary

**Total Sites**: 79
- ✅ **Completed**: 19 National Parks (with accurate polygon boundaries)
- ⏳ **Needed**: 60 sites requiring polygon boundary data

## Data Requirements by Type

### 1. National Forests (32 sites) - USFS Data Needed

**Source**: US Forest Service - National Forest System Boundaries
- **URL**: https://data.fs.usda.gov/geodata/edw/edw_resources/fc/S_USA.AdministrativeForest.zip
- **Format**: Shapefile (can be converted to GeoJSON)
- **Coverage**: All National Forests in the United States

**Sites Requiring Data**:
1. Angeles National Forest (CA)
2. Angelina National Forest (TX)
3. Apache-Sitgreaves National Forest (AZ)
4. Apalachicola National Forest (FL)
5. Beaverhead-Deerlodge National Forest (MT)
6. Bighorn National Forest (WY)
7. Bridger-Teton National Forest (WY)
8. Caribou-Targhee National Forest (ID, WY)
9. Chugach National Forest (AK)
10. Coconino National Forest (AZ)
11. Coronado National Forest (AZ, NM)
12. Custer Gallatin National Forest (MT, SD)
13. Davy Crockett National Forest (TX)
14. Flathead National Forest (MT)
15. Helena-Lewis and Clark National Forest (MT)
16. Inyo National Forest (CA, NV)
17. Kaibab National Forest (AZ)
18. Kootenai National Forest (MT, ID)
19. Lewis and Clark National Forest (MT)
20. Lolo National Forest (MT)
21. Mark Twain National Forest (MO)
22. Medicine Bow-Routt National Forest (WY, CO)
23. Ocala National Forest (FL)
24. Prescott National Forest (AZ)
25. Sabine National Forest (TX)
26. Sam Houston National Forest (TX)
27. San Bernardino National Forest (CA)
28. Sequoia National Forest (CA)
29. Shoshone National Forest (WY)
30. Sierra National Forest (CA)
31. Tongass National Forest (AK)
32. Tonto National Forest (AZ)

**Instructions**:
1. Download the shapefile from the USFS link above
2. Convert to GeoJSON using ogr2ogr:
   ```bash
   ogr2ogr -f GeoJSON national-forests.geojson S_USA.AdministrativeForest.shp -t_srs EPSG:4326
   ```
3. Place in `/home/runner/work/ConservationConnector/ConservationConnector/public/data/geojson/`
4. Run the extraction script (to be created)

### 2. National Wildlife Refuges (18 sites) - USFWS Data Needed

**Source**: US Fish and Wildlife Service - National Wildlife Refuge Boundaries
- **URL**: https://www.fws.gov/dataset/national-wildlife-refuge-boundaries
- **Alternative**: https://gis-fws.opendata.arcgis.com/datasets/fws::fws-national-realty-boundaries
- **Format**: Shapefile or GeoJSON

**Sites Requiring Data**:
1. Aransas National Wildlife Refuge (TX)
2. Arctic National Wildlife Refuge (AK)
3. Big Muddy National Fish and Wildlife Refuge (MO)
4. Buenos Aires National Wildlife Refuge (AZ)
5. Charles M. Russell National Wildlife Refuge (MT)
6. J.N. "Ding" Darling National Wildlife Refuge (FL)
7. Florida Panther National Wildlife Refuge (FL)
8. Laguna Atascosa National Wildlife Refuge (TX)
9. Arthur R. Marshall Loxahatchee National Wildlife Refuge (FL)
10. Merritt Island National Wildlife Refuge (FL)
11. Middle Mississippi River National Wildlife Refuge (MO, IL)
12. Mingo National Wildlife Refuge (MO)
13. National Elk Refuge (WY)
14. Seedskadee National Wildlife Refuge (WY)
15. St. Marks National Wildlife Refuge (FL)
16. Swan Lake National Wildlife Refuge (MO)
17. Ten Thousand Islands National Wildlife Refuge (FL)
18. Yukon Delta National Wildlife Refuge (AK)

**Instructions**:
1. Download the refuge boundaries dataset
2. Convert to GeoJSON if needed
3. Place in `/home/runner/work/ConservationConnector/ConservationConnector/public/data/geojson/`
4. Run the extraction script

### 3. Other Protected Areas (10 sites) - NPS/PADUS Data

**Source**: Multiple sources or comprehensive PADUS dataset

**National Preserves** (3 sites):
- Big Cypress National Preserve (FL) - NPS
- Big Thicket National Preserve (TX) - NPS
- Mojave National Preserve (CA) - NPS

**Source**: https://public-nps.opendata.arcgis.com/ or PADUS

**Recreation & Scenic Areas** (3 sites):
- Flaming Gorge National Recreation Area (WY, UT) - USFS
- Padre Island National Seashore (TX) - NPS
- Ozark National Scenic Riverways (MO) - NPS

**Wilderness & Rivers** (4 sites):
- Eleven Point Wild and Scenic River (MO, AR) - USFS
- Hercules Glades Wilderness (MO) - USFS
- Irish Wilderness (MO) - USFS
- Piney Creek Wilderness (MO) - USFS

**Instructions**:
For these mixed designations, use either:
1. **PADUS Comprehensive Dataset**: Download state-specific PADUS data
2. **Individual Agency APIs**: Download from respective managing agencies

## Alternative: Use PADUS for All Remaining Sites

**Recommended Approach** 🌟

Instead of downloading from multiple sources, use PADUS which includes all federal lands:

**PADUS 3.0 Download**:
- **URL**: https://www.sciencebase.gov/catalog/item/626f6d39d34e915b67c3f3c6
- **Format**: State-by-state GeoDatabase or GeoJSON
- **Coverage**: Comprehensive - includes all designation types

**States to Download**:
- Alaska (AK)
- Arizona (AZ)
- California (CA)
- Colorado (CO)
- Florida (FL)
- Idaho (ID)
- Missouri (MO) - ✅ Already have
- Montana (MT)
- New Mexico (NM)
- South Dakota (SD)
- Texas (TX)
- Utah (UT)
- Wyoming (WY)

**Processing Script**: `scripts/extract-from-padus.cjs` (to be created)

## Temporary Workaround - Approximation

While sourcing authoritative data, we could:
1. ✅ Use existing National Park polygons (completed)
2. Generate approximate circles based on area data (current state for 60 sites)
3. Mark data quality as "low" or "approximate" in metadata
4. Replace with accurate boundaries when data becomes available

## Data Quality Metadata

All site files include `metadata.dataQuality` field:
- **high**: Accurate polygon boundaries from authoritative sources (19 National Parks)
- **medium**: Approximate boundaries (to be used for interim solution)
- **low**: Point coordinates only with calculated radius (current state for 60 sites)

## Next Actions

**Option 1 - Ask for Data in Review** (Recommended):
Document in code review that the following data files are needed:
1. National Forest boundaries (USFS)
2. Wildlife Refuge boundaries (USFWS)
3. PADUS state datasets

**Option 2 - Interim Solution**:
1. Mark current 60 sites as "approximate" in metadata
2. Document that accurate boundaries are pending data availability
3. Create issues/tickets to source accurate data

**Option 3 - Download and Process**:
1. Download datasets from public sources
2. Process with extraction scripts
3. Update all 60 remaining sites

## Contact Information

**For Data Requests**:
- USFS Geodata: geodata_admin@fs.fed.us
- USFWS GIS: https://www.fws.gov/gis/
- PADUS: https://www.usgs.gov/programs/gap-analysis-project
