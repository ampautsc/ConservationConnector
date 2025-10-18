# GitHub Actions Workflows for Boundary Data

## Overview

This repository includes automated GitHub Actions workflows to fetch and update conservation area boundary data from official U.S. government APIs.

## Workflows

### 1. Fetch Real Boundaries Workflow

**File**: `.github/workflows/fetch-real-boundaries.yml`

This workflow automatically fetches real boundary data from government APIs and updates site files in the repository.

#### Triggers

- **Manual**: Can be triggered manually via GitHub Actions UI
- **Scheduled**: Runs automatically every Monday at 2 AM UTC
- **On Push**: Runs when `scripts/fetch-all-real-boundaries.cjs` is updated

#### What It Does

1. Checks out the repository
2. Sets up Node.js environment
3. Installs dependencies
4. Runs `scripts/fetch-all-real-boundaries.cjs` to fetch boundaries from:
   - USFS API (National Forests)
   - USFWS API (Wildlife Refuges)
   - NPS API (National Park Service units)
5. Commits and pushes any updated site files
6. Generates a summary report showing:
   - Number of sites with high-quality boundaries
   - Number of sites with medium-quality boundaries
   - Whether any changes were made

#### Manual Trigger

To manually trigger the workflow:

1. Go to the repository on GitHub
2. Click on **Actions** tab
3. Select **Fetch Real Conservation Area Boundaries**
4. Click **Run workflow**
5. Select branch (typically `main`)
6. Click **Run workflow** button

The workflow will execute and fetch the latest boundary data from government APIs.

### 2. Azure Deployment with Pre-Build Boundary Fetch

**File**: `.github/workflows/azure-static-web-apps-deploy.yml`

This workflow has been updated to include a pre-build step that fetches boundary data before building and deploying the application.

#### Pre-Build Step

Before the application is built, the workflow now:

1. Attempts to fetch real boundary data from government APIs
2. Uses `continue-on-error: true` so deployment continues even if the fetch fails
3. Ensures the most up-to-date boundary data is included in each deployment

This means every deployment will have the latest boundary data available from government sources.

#### Deployment Flow

```
Install Dependencies
    ↓
Fetch Real Boundaries (before firewall restrictions)
    ↓
Build Application
    ↓
Deploy to Azure Static Web Apps
```

The key advantage is that the boundary fetch happens **before** any firewall restrictions, ensuring access to government API endpoints.

## Benefits

### Automated Updates

- Boundaries are automatically refreshed weekly
- No manual intervention required
- Always uses the most current official data

### Fresh Data on Every Deploy

- Each deployment includes the latest boundary data
- Reduces risk of deploying with outdated boundaries
- Ensures consistency between source control and deployed app

### Access to Government APIs

- GitHub Actions runners have unrestricted internet access
- Can successfully query USFS, USFWS, and NPS APIs
- Bypasses any firewall restrictions in other environments

### Audit Trail

- All boundary updates are committed to the repository
- Clear commit messages show when automated updates occur
- Git history provides complete audit trail

## Monitoring

### Check Workflow Status

1. Go to **Actions** tab in GitHub
2. View recent workflow runs
3. Click on a run to see detailed logs and summary

### Summary Reports

Each workflow run generates a summary showing:
- ✅ Success or failure status
- 📊 Current counts of high vs. medium quality boundaries
- 📝 Whether changes were committed

### Notifications

You can configure notifications in GitHub Settings:
- **Settings** → **Notifications** → **Actions**
- Choose to be notified on workflow failures
- Get alerts if boundary fetches fail

## Troubleshooting

### Workflow Fails to Fetch Boundaries

If the workflow fails:

1. Check the workflow logs for API errors
2. Verify the government API endpoints are accessible
3. Check if API field names have changed
4. Review rate limiting (workflow includes 1-second delays)

The workflow uses `continue-on-error: true` in the deployment workflow, so failures won't block deployments.

### No Changes Detected

If the workflow runs but shows "No changes detected":

- This is normal - it means all boundaries are already up to date
- No action needed
- The workflow will continue to check weekly

### API Rate Limiting

The fetch script includes:
- 1-second delay between requests
- Respectful rate limiting
- Should not trigger API restrictions

If rate limiting occurs, the workflow will:
- Log the error
- Continue with existing data
- Retry on next scheduled run

## Configuration

### Scheduled Runs

To change the schedule, edit `.github/workflows/fetch-real-boundaries.yml`:

```yaml
schedule:
  - cron: '0 2 * * 1'  # Every Monday at 2 AM UTC
```

Use [crontab.guru](https://crontab.guru/) to create custom schedules.

### Manual Trigger Options

The workflow includes an optional `force_update` parameter (future enhancement) to force updates even for high-quality data.

## Security

- Workflows use `GITHUB_TOKEN` for authentication
- No additional secrets required for public APIs
- All API endpoints are official U.S. government sources
- Data is public domain

## Related Documentation

- `FETCH_BOUNDARIES_README.md` - Detailed guide for the fetch script
- `GEOJSON_BOUNDARY_UPDATE_SUMMARY.md` - Technical implementation details
- `scripts/fetch-all-real-boundaries.cjs` - The actual fetch script

## Summary

These workflows ensure that conservation area boundaries are:
- ✅ Always up to date
- ✅ Fetched from authoritative sources
- ✅ Automatically maintained
- ✅ Available before firewall restrictions
- ✅ Included in every deployment

No manual intervention is required once the workflows are set up.
