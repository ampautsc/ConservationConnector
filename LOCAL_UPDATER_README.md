# Local Boundary Updater - Quick Start Guide

## Overview

This tool allows you to **run the boundary data fetch locally on your computer** (where you have internet access) and optionally commit and push the changes directly to GitHub.

## What It Does

1. **Downloads** GeoJSON boundary data from official U.S. government APIs:
   - USFS (National Forest boundaries)
   - USFWS (Wildlife Refuge boundaries)
   - NPS (National Park Service units)

2. **Processes** the data and updates site JSON files with high-quality boundaries

3. **Optionally commits** the changes and pushes to GitHub

## Prerequisites

- Node.js installed (download from https://nodejs.org/)
- Git installed and configured
- Internet access to reach government APIs
- (Optional) Git authenticated to push to GitHub

## Quick Start

### Windows

Simply double-click the batch file:

```
update-boundaries.bat
```

Or from command prompt:

```cmd
# Download and process only
update-boundaries.bat

# Download, process, and commit locally
update-boundaries.bat commit

# Download, process, commit, and push to GitHub
update-boundaries.bat commit push
```

### Mac/Linux

Make sure the script is executable (already done in repo):

```bash
# Download and process only
./update-boundaries.sh

# Download, process, and commit locally
./update-boundaries.sh commit

# Download, process, commit, and push to GitHub
./update-boundaries.sh commit push
```

### Direct Node.js (All Platforms)

```bash
# Download and process only
node scripts/local-boundary-updater.cjs

# Download, process, and commit locally
node scripts/local-boundary-updater.cjs --commit

# Download, process, commit, and push to GitHub
node scripts/local-boundary-updater.cjs --commit --push
```

## What Happens

### Step 1: Download
The script queries government APIs for each of the 49 sites that need updates:
- 31 National Forests
- 13 Wildlife Refuges
- 5 Other sites (preserves, recreation areas)

**Time:** Approximately 10-15 minutes (2 seconds between requests to be respectful to APIs)

**Output:**
```
📥 angelina-nf
    ✓ Updated successfully
📥 apache-sitgreaves-nf
    ✓ Updated successfully
⊗ angeles-nf (already high quality)
...
```

### Step 2: Process
For each site, the script:
- Downloads the official polygon boundary
- Updates the site JSON file
- Sets `dataQuality: "high"`
- Records the data source
- Updates the last modified date

### Step 3: Commit (if --commit flag used)
```
🔍 Checking for changes...
📝 Staging changes...
💾 Committing changes...
✓ Changes committed locally
```

### Step 4: Push (if --push flag used)
```
🚀 Pushing to GitHub...
✓ Changes pushed to GitHub
```

## Summary Report

At the end, you'll see a summary:

```
═══════════════════════════════════════════════════════════
Summary:
  Total sites: 49
  Successfully updated: 42
  Failed: 3
  Skipped (already high quality): 4
═══════════════════════════════════════════════════════════

✅ Boundary data successfully downloaded and processed!
```

## Sites That Will Be Updated

The script automatically updates all sites with "medium" quality data:

### National Forests (31)
- angelina-nf, apache-sitgreaves-nf, apalachicola-nf
- beaverhead-deerlodge-nf, bighorn-nf, bridger-teton-nf
- caribou-targhee-nf, chugach-nf, coconino-nf, coronado-nf
- custer-gallatin-nf, davy-crockett-nf, flathead-nf
- helena-lewis-clark-nf, inyo-nf, kaibab-nf, kootenai-nf
- lewis-and-clark-nf, lolo-nf, medicine-bow-routt-nf
- ocala-nf, prescott-nf, sabine-nf, sam-houston-nf
- san-bernardino-nf, sequoia-nf, shoshone-nf, sierra-nf
- tongass-nf, tonto-nf

### Wildlife Refuges (13)
- aransas-nwr, arctic-nwr, buenos-aires-nwr
- ding-darling-nwr, florida-panther-nwr, laguna-atascosa-nwr
- loxahatchee-nwr, merritt-island-nwr, national-elk-refuge
- seedskadee-nwr, st-marks-nwr, ten-thousand-islands-nwr
- yukon-delta-nwr

### Other Sites (5)
- big-cypress-national-preserve, big-thicket-national-preserve
- flaming-gorge-nra, mojave-national-preserve, padre-island-ns

Sites already marked as "high quality" will be automatically skipped.

## Troubleshooting

### "Node.js is not installed"
- Download and install from https://nodejs.org/
- Choose LTS (Long Term Support) version
- Restart your terminal/command prompt

### API Timeouts or Failures
- Some APIs may be temporarily down or slow
- The script has retry logic built in
- Failed sites will be reported in the summary
- You can run the script again to retry failed sites

### "No changes to commit"
- All sites already have high-quality data
- Or the downloads failed for all sites
- Check the summary to see what happened

### Git Push Fails
- Make sure you're authenticated to GitHub
- Check that you have write permissions to the repository
- You can commit locally and push manually later

### Permission Denied (Mac/Linux)
```bash
chmod +x update-boundaries.sh
./update-boundaries.sh
```

## Manual Alternative

If the automated script doesn't work, you can still update manually:

1. See `MANUAL_BOUNDARY_UPDATE_GUIDE.md`
2. Download bulk datasets (PADUS, USFS, USFWS)
3. Run extraction scripts
4. Commit manually

## What Gets Changed

Only the site JSON files in `public/data/sites/*.json` are modified:
- The `geometry` field is updated with actual polygon boundaries
- The `metadata.dataQuality` is changed from "medium" to "high"
- The `metadata.geometrySource` records the data source
- The `metadata.lastUpdated` is set to current date

**No other files are changed.**

## After Running

Once complete:
1. Your local site files are updated with real boundaries
2. (If --commit used) Changes are committed to your local git repository
3. (If --push used) Changes are pushed to GitHub
4. The deployment workflow will automatically deploy with updated data

## Support

- For API issues: Check government data portal status
- For script issues: Open an issue on GitHub
- For manual process: See `MANUAL_BOUNDARY_UPDATE_GUIDE.md`

---

**Happy boundary updating! 🗺️**
