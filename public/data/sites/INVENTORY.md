# Conservation Site Inventory

This file contains an inventory of significant protected natural areas across the United States. The data crawler uses this inventory to generate individual site data files.

## Format

Each site should be listed in the following format:
```
### [Site Name]
- **ID**: unique-site-id
- **State**: XX
- **Designation**: Type of protected area
- **Area**: Size in acres or km²
- **Coordinates**: lat, lng
- **Status**: active|pending|archived
```

## Instructions

1. Add new sites by following the format above
2. Ensure the ID is unique and uses kebab-case (lowercase with hyphens)
3. Run the data crawler workflow to generate/update site data files
4. The crawler will validate entries and create corresponding JSON files

---

## Alaska (AK)

### Wrangell-St. Elias National Park and Preserve
- **ID**: wrangell-st-elias-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 13,175,799 acres (20,587 sq mi)
- **Coordinates**: 61.7104, -142.9857
- **Status**: active

### Gates of the Arctic National Park and Preserve
- **ID**: gates-of-arctic-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 8,472,506 acres (13,238 sq mi)
- **Coordinates**: 67.7879, -153.2952
- **Status**: active

### Denali National Park and Preserve
- **ID**: denali-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 6,045,153 acres (9,446 sq mi)
- **Coordinates**: 63.1148, -151.1926
- **Status**: active

### Katmai National Park and Preserve
- **ID**: katmai-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 4,093,077 acres (6,395 sq mi)
- **Coordinates**: 58.5975, -155.0649
- **Status**: active

### Glacier Bay National Park and Preserve
- **ID**: glacier-bay-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 3,223,384 acres (5,037 sq mi)
- **Coordinates**: 58.6658, -136.9003
- **Status**: active

### Lake Clark National Park and Preserve
- **ID**: lake-clark-np
- **State**: AK
- **Designation**: National Park and Preserve
- **Area**: 4,030,015 acres (6,297 sq mi)
- **Coordinates**: 60.9672, -153.4358
- **Status**: active

### Tongass National Forest
- **ID**: tongass-nf
- **State**: AK
- **Designation**: National Forest
- **Area**: 16,700,000 acres
- **Coordinates**: 57.0000, -133.5000
- **Status**: active

### Chugach National Forest
- **ID**: chugach-nf
- **State**: AK
- **Designation**: National Forest
- **Area**: 6,908,540 acres
- **Coordinates**: 60.5833, -147.1667
- **Status**: active

### Arctic National Wildlife Refuge
- **ID**: arctic-nwr
- **State**: AK
- **Designation**: National Wildlife Refuge
- **Area**: 19,286,722 acres (30,136 sq mi)
- **Coordinates**: 68.5833, -145.0000
- **Status**: active

### Yukon Delta National Wildlife Refuge
- **ID**: yukon-delta-nwr
- **State**: AK
- **Designation**: National Wildlife Refuge
- **Area**: 19,624,458 acres
- **Coordinates**: 61.3333, -163.0000
- **Status**: active

## California (CA)

### Death Valley National Park
- **ID**: death-valley-np
- **State**: CA,NV
- **Designation**: National Park
- **Area**: 3,408,395 acres (5,326 sq mi)
- **Coordinates**: 36.5323, -116.9325
- **Status**: active

### Joshua Tree National Park
- **ID**: joshua-tree-np
- **State**: CA
- **Designation**: National Park
- **Area**: 795,156 acres (1,242 sq mi)
- **Coordinates**: 33.8734, -115.9010
- **Status**: active

### Mojave National Preserve
- **ID**: mojave-national-preserve
- **State**: CA
- **Designation**: National Preserve
- **Area**: 1,542,776 acres (2,410 sq mi)
- **Coordinates**: 35.1411, -115.5125
- **Status**: active

### Angeles National Forest
- **ID**: angeles-nf
- **State**: CA
- **Designation**: National Forest
- **Area**: 700,176 acres
- **Coordinates**: 34.3705, -118.0489
- **Status**: active

### Sierra National Forest
- **ID**: sierra-nf
- **State**: CA
- **Designation**: National Forest
- **Area**: 1,300,000 acres
- **Coordinates**: 37.2333, -119.2167
- **Status**: active

### Sequoia National Forest
- **ID**: sequoia-nf
- **State**: CA
- **Designation**: National Forest
- **Area**: 1,193,315 acres
- **Coordinates**: 36.0000, -118.5000
- **Status**: active

### San Bernardino National Forest
- **ID**: san-bernardino-nf
- **State**: CA
- **Designation**: National Forest
- **Area**: 823,816 acres
- **Coordinates**: 34.1805, -116.9100
- **Status**: active

### Inyo National Forest
- **ID**: inyo-nf
- **State**: CA,NV
- **Designation**: National Forest
- **Area**: 1,903,381 acres
- **Coordinates**: 37.5833, -118.7500
- **Status**: active

### Yosemite National Park
- **ID**: yosemite-np
- **State**: CA
- **Designation**: National Park
- **Area**: 761,747 acres (1,190 sq mi)
- **Coordinates**: 37.8651, -119.5383
- **Status**: active

### Sequoia and Kings Canyon National Parks
- **ID**: sequoia-kings-canyon-np
- **State**: CA
- **Designation**: National Park
- **Area**: 865,964 acres (1,353 sq mi)
- **Coordinates**: 36.4864, -118.5658
- **Status**: active

## Florida (FL)

### Everglades National Park
- **ID**: everglades-np
- **State**: FL
- **Designation**: National Park
- **Area**: 1,508,976 acres (2,358 sq mi)
- **Coordinates**: 25.2866, -80.8987
- **Status**: active

### Big Cypress National Preserve
- **ID**: big-cypress-national-preserve
- **State**: FL
- **Designation**: National Preserve
- **Area**: 729,000 acres (1,139 sq mi)
- **Coordinates**: 25.9739, -81.0811
- **Status**: active

### Ocala National Forest
- **ID**: ocala-nf
- **State**: FL
- **Designation**: National Forest
- **Area**: 607,000 acres
- **Coordinates**: 29.1833, -81.8000
- **Status**: active

### Arthur R. Marshall Loxahatchee National Wildlife Refuge
- **ID**: loxahatchee-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 145,635 acres
- **Coordinates**: 26.4500, -80.2833
- **Status**: active

### J.N. "Ding" Darling National Wildlife Refuge
- **ID**: ding-darling-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 6,400 acres
- **Coordinates**: 26.4418, -82.1125
- **Status**: active

### Florida Panther National Wildlife Refuge
- **ID**: florida-panther-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 26,400 acres
- **Coordinates**: 26.0833, -81.3167
- **Status**: active

### Apalachicola National Forest
- **ID**: apalachicola-nf
- **State**: FL
- **Designation**: National Forest
- **Area**: 632,890 acres
- **Coordinates**: 30.1667, -84.5833
- **Status**: active

### Ten Thousand Islands National Wildlife Refuge
- **ID**: ten-thousand-islands-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 35,000 acres
- **Coordinates**: 25.8333, -81.4000
- **Status**: active

### St. Marks National Wildlife Refuge
- **ID**: st-marks-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 83,000 acres
- **Coordinates**: 30.0833, -84.1667
- **Status**: active

### Merritt Island National Wildlife Refuge
- **ID**: merritt-island-nwr
- **State**: FL
- **Designation**: National Wildlife Refuge
- **Area**: 140,000 acres
- **Coordinates**: 28.6333, -80.7167
- **Status**: active

## Montana (MT)

### Glacier National Park
- **ID**: glacier-np
- **State**: MT
- **Designation**: National Park
- **Area**: 1,013,125 acres (1,583 sq mi)
- **Coordinates**: 48.7596, -113.7870
- **Status**: active

### Yellowstone National Park
- **ID**: yellowstone-np
- **State**: WY,MT,ID
- **Designation**: National Park
- **Area**: 2,219,791 acres (3,468 sq mi)
- **Coordinates**: 44.4280, -110.5885
- **Status**: active

### Flathead National Forest
- **ID**: flathead-nf
- **State**: MT
- **Designation**: National Forest
- **Area**: 2,404,935 acres
- **Coordinates**: 48.2500, -113.7500
- **Status**: active

### Lewis and Clark National Forest
- **ID**: lewis-and-clark-nf
- **State**: MT
- **Designation**: National Forest
- **Area**: 1,843,000 acres
- **Coordinates**: 47.5000, -112.5000
- **Status**: active

### Kootenai National Forest
- **ID**: kootenai-nf
- **State**: MT,ID
- **Designation**: National Forest
- **Area**: 2,200,000 acres
- **Coordinates**: 48.5000, -115.5000
- **Status**: active

### Lolo National Forest
- **ID**: lolo-nf
- **State**: MT
- **Designation**: National Forest
- **Area**: 2,000,000 acres
- **Coordinates**: 47.0000, -114.5000
- **Status**: active

### Beaverhead-Deerlodge National Forest
- **ID**: beaverhead-deerlodge-nf
- **State**: MT
- **Designation**: National Forest
- **Area**: 3,360,000 acres
- **Coordinates**: 45.5000, -113.0000
- **Status**: active

### Helena-Lewis and Clark National Forest
- **ID**: helena-lewis-clark-nf
- **State**: MT
- **Designation**: National Forest
- **Area**: 1,000,000 acres
- **Coordinates**: 47.0000, -112.0000
- **Status**: active

### Custer Gallatin National Forest
- **ID**: custer-gallatin-nf
- **State**: MT,SD
- **Designation**: National Forest
- **Area**: 3,000,000 acres
- **Coordinates**: 45.5000, -110.0000
- **Status**: active

### Charles M. Russell National Wildlife Refuge
- **ID**: charles-m-russell-nwr
- **State**: MT
- **Designation**: National Wildlife Refuge
- **Area**: 1,100,000 acres
- **Coordinates**: 47.6667, -108.3333
- **Status**: active

## Wyoming (WY)

### Yellowstone National Park
- **ID**: yellowstone-np
- **State**: WY,MT,ID
- **Designation**: National Park
- **Area**: 2,219,791 acres (3,468 sq mi)
- **Coordinates**: 44.4280, -110.5885
- **Status**: active

### Grand Teton National Park
- **ID**: grand-teton-np
- **State**: WY
- **Designation**: National Park
- **Area**: 310,044 acres (485 sq mi)
- **Coordinates**: 43.7904, -110.8024
- **Status**: active

### Bridger-Teton National Forest
- **ID**: bridger-teton-nf
- **State**: WY
- **Designation**: National Forest
- **Area**: 3,400,000 acres
- **Coordinates**: 43.5000, -110.0000
- **Status**: active

### Shoshone National Forest
- **ID**: shoshone-nf
- **State**: WY
- **Designation**: National Forest
- **Area**: 2,433,000 acres
- **Coordinates**: 44.0000, -109.5000
- **Status**: active

### Bighorn National Forest
- **ID**: bighorn-nf
- **State**: WY
- **Designation**: National Forest
- **Area**: 1,107,000 acres
- **Coordinates**: 44.5000, -107.5000
- **Status**: active

### Medicine Bow-Routt National Forest
- **ID**: medicine-bow-routt-nf
- **State**: WY,CO
- **Designation**: National Forest
- **Area**: 2,900,000 acres
- **Coordinates**: 41.0000, -106.5000
- **Status**: active

### Caribou-Targhee National Forest
- **ID**: caribou-targhee-nf
- **State**: ID,WY
- **Designation**: National Forest
- **Area**: 3,000,000 acres
- **Coordinates**: 44.0000, -111.0000
- **Status**: active

### National Elk Refuge
- **ID**: national-elk-refuge
- **State**: WY
- **Designation**: National Wildlife Refuge
- **Area**: 24,700 acres
- **Coordinates**: 43.4833, -110.7167
- **Status**: active

### Seedskadee National Wildlife Refuge
- **ID**: seedskadee-nwr
- **State**: WY
- **Designation**: National Wildlife Refuge
- **Area**: 27,230 acres
- **Coordinates**: 41.7667, -109.8333
- **Status**: active

### Flaming Gorge National Recreation Area
- **ID**: flaming-gorge-nra
- **State**: WY,UT
- **Designation**: National Recreation Area
- **Area**: 207,363 acres
- **Coordinates**: 40.9189, -109.4194
- **Status**: active

## Texas (TX)

### Big Bend National Park
- **ID**: big-bend-np
- **State**: TX
- **Designation**: National Park
- **Area**: 801,163 acres (1,252 sq mi)
- **Coordinates**: 29.1275, -103.2428
- **Status**: active

### Guadalupe Mountains National Park
- **ID**: guadalupe-mountains-np
- **State**: TX
- **Designation**: National Park
- **Area**: 86,367 acres (135 sq mi)
- **Coordinates**: 31.8977, -104.8608
- **Status**: active

### Padre Island National Seashore
- **ID**: padre-island-ns
- **State**: TX
- **Designation**: National Seashore
- **Area**: 130,434 acres
- **Coordinates**: 27.4500, -97.3167
- **Status**: active

### Big Thicket National Preserve
- **ID**: big-thicket-national-preserve
- **State**: TX
- **Designation**: National Preserve
- **Area**: 113,122 acres
- **Coordinates**: 30.4572, -94.3850
- **Status**: active

### Sam Houston National Forest
- **ID**: sam-houston-nf
- **State**: TX
- **Designation**: National Forest
- **Area**: 163,000 acres
- **Coordinates**: 30.5333, -95.3000
- **Status**: active

### Davy Crockett National Forest
- **ID**: davy-crockett-nf
- **State**: TX
- **Designation**: National Forest
- **Area**: 161,000 acres
- **Coordinates**: 31.2667, -95.2000
- **Status**: active

### Angelina National Forest
- **ID**: angelina-nf
- **State**: TX
- **Designation**: National Forest
- **Area**: 153,000 acres
- **Coordinates**: 31.2833, -94.5833
- **Status**: active

### Sabine National Forest
- **ID**: sabine-nf
- **State**: TX
- **Designation**: National Forest
- **Area**: 160,000 acres
- **Coordinates**: 31.3167, -93.8500
- **Status**: active

### Aransas National Wildlife Refuge
- **ID**: aransas-nwr
- **State**: TX
- **Designation**: National Wildlife Refuge
- **Area**: 115,000 acres
- **Coordinates**: 28.2333, -96.8000
- **Status**: active

### Laguna Atascosa National Wildlife Refuge
- **ID**: laguna-atascosa-nwr
- **State**: TX
- **Designation**: National Wildlife Refuge
- **Area**: 97,000 acres
- **Coordinates**: 26.2333, -97.3500
- **Status**: active

## Arizona (AZ)

### Grand Canyon National Park
- **ID**: grand-canyon-np
- **State**: AZ
- **Designation**: National Park
- **Area**: 1,201,647 acres (1,877 sq mi)
- **Coordinates**: 36.0544, -112.1401
- **Status**: active

### Petrified Forest National Park
- **ID**: petrified-forest-np
- **State**: AZ
- **Designation**: National Park
- **Area**: 221,390 acres (346 sq mi)
- **Coordinates**: 34.9099, -109.7817
- **Status**: active

### Saguaro National Park
- **ID**: saguaro-np
- **State**: AZ
- **Designation**: National Park
- **Area**: 91,716 acres (143 sq mi)
- **Coordinates**: 32.2500, -110.7500
- **Status**: active

### Coconino National Forest
- **ID**: coconino-nf
- **State**: AZ
- **Designation**: National Forest
- **Area**: 1,856,000 acres
- **Coordinates**: 35.0000, -111.5000
- **Status**: active

### Tonto National Forest
- **ID**: tonto-nf
- **State**: AZ
- **Designation**: National Forest
- **Area**: 2,873,000 acres
- **Coordinates**: 33.8333, -111.2500
- **Status**: active

### Prescott National Forest
- **ID**: prescott-nf
- **State**: AZ
- **Designation**: National Forest
- **Area**: 1,237,062 acres
- **Coordinates**: 34.5000, -112.5000
- **Status**: active

### Apache-Sitgreaves National Forests
- **ID**: apache-sitgreaves-nf
- **State**: AZ
- **Designation**: National Forest
- **Area**: 2,000,000 acres
- **Coordinates**: 34.5000, -109.5000
- **Status**: active

### Kaibab National Forest
- **ID**: kaibab-nf
- **State**: AZ
- **Designation**: National Forest
- **Area**: 1,600,000 acres
- **Coordinates**: 36.2500, -112.2500
- **Status**: active

### Coronado National Forest
- **ID**: coronado-nf
- **State**: AZ,NM
- **Designation**: National Forest
- **Area**: 1,780,000 acres
- **Coordinates**: 31.8333, -110.5000
- **Status**: active

### Buenos Aires National Wildlife Refuge
- **ID**: buenos-aires-nwr
- **State**: AZ
- **Designation**: National Wildlife Refuge
- **Area**: 117,464 acres
- **Coordinates**: 31.6500, -111.5000
- **Status**: active

## Missouri (MO)

### Mark Twain National Forest
- **ID**: mark-twain-nf
- **State**: MO
- **Designation**: National Forest
- **Area**: 3,044,784 acres
- **Coordinates**: 37.5000, -91.5000
- **Status**: active

### Big Muddy National Fish and Wildlife Refuge
- **ID**: big-muddy-nwr
- **State**: MO
- **Designation**: National Wildlife Refuge
- **Area**: 823,214 acres
- **Coordinates**: 38.8833, -91.3833
- **Status**: active

### Ozark National Scenic Riverways
- **ID**: ozark-nsr
- **State**: MO
- **Designation**: National Scenic Riverways
- **Area**: 82,332 acres
- **Coordinates**: 37.1333, -91.1667
- **Status**: active

### Mingo National Wildlife Refuge
- **ID**: mingo-nwr
- **State**: MO
- **Designation**: National Wildlife Refuge
- **Area**: 21,699 acres
- **Coordinates**: 36.9667, -90.1167
- **Status**: active

### Irish Wilderness
- **ID**: irish-wilderness
- **State**: MO
- **Designation**: Wilderness Area
- **Area**: 16,509 acres
- **Coordinates**: 37.1500, -91.0833
- **Status**: active

### Eleven Point Wild and Scenic River
- **ID**: eleven-point-river
- **State**: MO,AR
- **Designation**: Wild and Scenic River
- **Area**: 15,418 acres
- **Coordinates**: 36.6667, -91.2500
- **Status**: active

### Middle Mississippi River National Wildlife Refuge
- **ID**: middle-mississippi-river-nwr
- **State**: MO,IL
- **Designation**: National Wildlife Refuge
- **Area**: 12,465 acres
- **Coordinates**: 39.7500, -91.0000
- **Status**: active

### Hercules Glades Wilderness
- **ID**: hercules-glades-wilderness
- **State**: MO
- **Designation**: Wilderness Area
- **Area**: 12,425 acres
- **Coordinates**: 36.7500, -92.6667
- **Status**: active

### Piney Creek Wilderness
- **ID**: piney-creek-wilderness
- **State**: MO
- **Designation**: Wilderness Area
- **Area**: 8,142 acres
- **Coordinates**: 37.0833, -91.5500
- **Status**: active

### Swan Lake National Wildlife Refuge
- **ID**: swan-lake-nwr
- **State**: MO
- **Designation**: National Wildlife Refuge
- **Area**: 10,795 acres
- **Coordinates**: 39.6833, -93.2667
- **Status**: active

---

## Notes

- This inventory focuses on the largest protected natural areas in each state
- Multi-state sites are listed under all applicable states
- Coordinates represent approximate center points
- Area measurements are approximate and based on official sources
- Status indicates whether the site is actively managed (active), pending establishment (pending), or no longer designated (archived)
- Run the data crawler workflow to sync this inventory with individual site data files
