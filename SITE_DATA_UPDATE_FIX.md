# Site Data Update Fix

## Problem

The site data in `public/data/sites/*.json` was not being updated during build and deploy. Each deployment used stale data from the repository, even though the workflow was fetching updated boundary data from government APIs.

## Root Cause

The `azure-static-web-apps-deploy.yml` workflow had a step to fetch real boundary data from government APIs (`fetch-all-real-boundaries.cjs`) before building, but it did NOT commit the updated data back to the repository.

**What was happening:**
1. Workflow checks out code from git
2. Workflow fetches updated boundary data (modifying `public/data/sites/*.json` files)
3. Workflow builds the application (using the updated data)
4. Workflow deploys to Azure
5. **Updated data is lost** - not committed back to git
6. Next deployment starts over with the stale data from step 1

This meant that:
- Each deployment would fetch the same data again (wasting API calls)
- The `fetch-all-real-boundaries.cjs` script is rate-limited to 10 sites per run
- Sites that were already marked as "high quality" would be skipped
- But since changes were never committed, ALL sites would always appear as needing updates

## Solution

Modified the deployment workflow to commit and push updated site data back to the repository after fetching boundaries and before building.

### Changes Made

1. **Changed `persist-credentials: false` to `persist-credentials: true`** in the checkout step
   - This allows the workflow to push commits back to the repository
   - Previously set to `false` which prevented pushing

2. **Added a "Check for site data changes" step**
   - Detects if any `public/data/sites/*.json` files were modified by the fetch step
   - Uses `git diff --exit-code` to check for changes
   - Sets an output variable that can be used in subsequent steps

3. **Added a "Commit and push updated site data" step**
   - Only runs if changes were detected
   - Only runs on push to main branch (not on pull requests)
   - Commits the updated site data with a clear automated message
   - Pushes the changes back to the repository

### Workflow Logic

```yaml
# 1. Checkout with credentials enabled
- uses: actions/checkout@v3
  with:
    persist-credentials: true  # Changed from false

# 2. Fetch boundaries (may update files)
- name: Fetch real boundaries before build
  run: node scripts/fetch-all-real-boundaries.cjs

# 3. Check if any files changed
- name: Check for site data changes
  id: check-changes
  run: |
    if git diff --exit-code public/data/sites/*.json; then
      echo "changes=false" >> $GITHUB_OUTPUT
    else
      echo "changes=true" >> $GITHUB_OUTPUT
    fi

# 4. Commit and push if changes detected AND on main branch
- name: Commit and push updated site data
  if: steps.check-changes.outputs.changes == 'true' && github.event_name == 'push' && github.ref == 'refs/heads/main'
  run: |
    git config --local user.email "github-actions[bot]@users.noreply.github.com"
    git config --local user.name "github-actions[bot]"
    git add public/data/sites/*.json
    git commit -m "chore: update site data during deployment [automated]"
    git push

# 5. Build application (uses updated data)
- name: Build application
  run: npm run build

# 6. Deploy to Azure (with updated data included)
```

## Benefits

1. **Persistent Updates**: Site data updates are now preserved in the repository
2. **Incremental Progress**: The `fetch-all-real-boundaries.cjs` script processes 10 sites per run, and these updates accumulate over time
3. **Efficient API Usage**: Sites with "high quality" data are skipped on subsequent runs, reducing unnecessary API calls
4. **Audit Trail**: Git history shows when and which site data was automatically updated
5. **Consistent State**: All developers and deployments use the same up-to-date data

## Testing

To verify the fix works:

1. **Monitor the deployment workflow:**
   - Go to Actions tab in GitHub
   - Watch for the "Check for site data changes" step
   - If changes detected, verify the "Commit and push updated site data" step succeeds

2. **Check git history:**
   ```bash
   git log --author="github-actions" --oneline
   ```
   - Should show automated commits like "chore: update site data during deployment [automated]"

3. **Verify site data updates:**
   ```bash
   git show <commit-hash> -- public/data/sites/
   ```
   - Should show which site files were updated and what changed

## Related Workflows

This fix is complementary to the existing `fetch-real-boundaries.yml` workflow:
- **`fetch-real-boundaries.yml`**: Dedicated workflow that runs weekly (Monday 2 AM UTC) or can be manually triggered to fetch boundaries
- **`azure-static-web-apps-deploy.yml`**: Now also fetches and commits boundaries during each deployment to main

Both workflows help keep the site data up to date, with the deployment workflow providing more frequent updates.

## Files Modified

- `.github/workflows/azure-static-web-apps-deploy.yml` - Added commit/push steps and enabled persist-credentials

## Impact

- **No breaking changes**: The deployment process remains the same from a user perspective
- **Backward compatible**: Works with existing site data files
- **Transparent**: Automated commits are clearly labeled and attributed to github-actions[bot]
