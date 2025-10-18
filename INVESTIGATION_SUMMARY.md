# Investigation Summary: Site Data Not Updating During Deployment

## Issue Reported
The data in `public/data/sites/*.json` was not being updated during build and deploy to Azure Static Web Apps.

## Investigation Findings

### The Problem
The deployment workflow (`azure-static-web-apps-deploy.yml`) was fetching real boundary data from government APIs before each build, but **was not committing the changes back to the repository**. This created a cycle where:

1. ✅ Workflow fetches updated boundary data (modifies `public/data/sites/*.json`)
2. ✅ Workflow builds the application (using the updated data)
3. ✅ Workflow deploys to Azure
4. ❌ **Updated data is discarded** (not committed to git)
5. ❌ Next deployment starts over with stale data from step 1

### Why This Happened
- The checkout step had `persist-credentials: false`, preventing the workflow from pushing to the repository
- No step existed to commit and push the updated site data
- The boundary fetch script (`fetch-all-real-boundaries.cjs`) processes 10 sites per run and skips sites with "high quality" data
- Since changes were never committed, the script thought all sites always needed updating

## The Fix

### Changes Made

#### 1. Enable Git Push Capability
**File:** `.github/workflows/azure-static-web-apps-deploy.yml` (line 26)
```yaml
# Before:
persist-credentials: false

# After:
persist-credentials: true
```

#### 2. Check for Data Changes
**File:** `.github/workflows/azure-static-web-apps-deploy.yml` (lines 48-57)
```yaml
- name: Check for site data changes
  id: check-changes
  run: |
    if git diff --exit-code -- public/data/sites/*.json > /dev/null 2>&1; then
      echo "changes=false" >> $GITHUB_OUTPUT
      echo "No changes to site data"
    else
      echo "changes=true" >> $GITHUB_OUTPUT
      echo "Site data has been updated"
    fi
```

This step uses `git diff` to detect if any JSON files in `public/data/sites/` were modified by the boundary fetch step.

#### 3. Commit and Push Updates
**File:** `.github/workflows/azure-static-web-apps-deploy.yml` (lines 59-66)
```yaml
- name: Commit and push updated site data
  if: steps.check-changes.outputs.changes == 'true' && github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
    git add -- public/data/sites/*.json
    git commit -m "chore: update site data during deployment [automated]"
    git push
```

This step:
- Only runs if changes were detected
- Only runs on pushes to the main branch (not on PRs)
- Commits only JSON files (not documentation like README.md or INVENTORY.md)
- Uses clear automated commit message
- Pushes changes back to the repository

### Documentation Created
- **`SITE_DATA_UPDATE_FIX.md`**: Comprehensive documentation of the issue and solution

## How It Works Now

### Deployment Flow (Push to Main)
```
1. Checkout code (with persist-credentials: true)
   ↓
2. Install dependencies
   ↓
3. Fetch real boundaries from government APIs
   - Updates up to 10 sites per run
   - Skips sites with "high quality" data
   ↓
4. Check for changes to *.json files
   ↓
5. If changes detected: Commit and push to git
   ↓
6. Build application (includes updated data)
   ↓
7. Deploy to Azure Static Web Apps
```

### Key Improvements
✅ **Persistent Updates**: Site data updates are saved in git and persist across deployments
✅ **Incremental Progress**: 10 sites per deployment × multiple deployments = cumulative updates
✅ **Efficient API Usage**: Sites with "high quality" data are skipped, reducing API calls
✅ **Audit Trail**: Git history shows when and which sites were updated
✅ **No Manual Intervention**: Fully automated process

## Testing Results

### Validation Performed
- ✅ Workflow YAML syntax validated
- ✅ Build process tested (79 site files correctly copied to dist/)
- ✅ Linting passed (no errors)
- ✅ Change detection tested manually (works correctly)
- ✅ Code review completed (all feedback addressed)
- ✅ Security scan passed (0 alerts)

### Expected Behavior After Merge
Once this PR is merged to main:

1. **First Deployment After Merge**:
   - Workflow will fetch boundaries for up to 10 sites
   - If any sites are updated, workflow will commit and push them
   - You'll see an automated commit like: "chore: update site data during deployment [automated]"

2. **Subsequent Deployments**:
   - Each deployment processes another batch of up to 10 sites
   - Updates accumulate over time
   - Sites that already have "high quality" data are skipped

3. **Monitoring**:
   - Check GitHub Actions logs for "Check for site data changes" step
   - Look for automated commits from github-actions[bot]
   - View git history: `git log --author="github-actions"`

## Impact Assessment

### What Changes
- Deployment workflow now commits updated site data back to repository
- More automated commits from github-actions[bot]

### What Stays the Same
- Build process unchanged
- Deployment process unchanged
- Site data file format unchanged
- No breaking changes

### Benefits
- Site data stays up-to-date automatically
- Reduced API calls (no redundant fetches)
- Clear audit trail of data updates
- No manual intervention required

## Related Systems

### Complementary Workflows
This fix works alongside existing workflows:

1. **`fetch-real-boundaries.yml`**: 
   - Runs weekly (Monday 2 AM UTC)
   - Can be manually triggered
   - Dedicated to fetching boundaries

2. **`azure-static-web-apps-deploy.yml`** (this fix):
   - Runs on every push to main
   - Fetches boundaries as part of deployment
   - Now also commits the updates

Both workflows help keep site data current, with the deployment workflow providing more frequent updates.

## Files Modified
- `.github/workflows/azure-static-web-apps-deploy.yml` - Added commit/push logic
- `SITE_DATA_UPDATE_FIX.md` - Detailed documentation
- `INVESTIGATION_SUMMARY.md` - This file

## Conclusion

**Root Cause**: Deployment workflow fetched data but didn't commit it back to the repository.

**Solution**: Added logic to detect changes and commit/push updated site data (JSON files only, main branch only).

**Status**: Ready to merge. All tests passed, security scan clean, thoroughly documented.

**Next Steps**: 
1. Merge this PR to main
2. Monitor first deployment to verify automated commit
3. Check git history for accumulated site data updates
4. Site data will now stay current automatically! 🎉
