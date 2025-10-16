# User Feedback

This directory stores user feedback submitted through the Conservation Connector application.

## How it works

When users submit feedback through the feedback button in the application, a JSON file is created in this directory with the following structure:

```json
{
  "timestamp": "2025-10-16T16:23:45.678Z",
  "feedbackType": "bug|feature|improvement|general",
  "subject": "Brief description",
  "message": "Detailed feedback message",
  "userAgent": "Browser user agent string",
  "url": "URL where feedback was submitted"
}
```

## Configuration Required

To enable feedback submission, you need to configure a GitHub Personal Access Token:

1. **Create a GitHub Personal Access Token:**
   - Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - Click "Generate new token (classic)"
   - Give it a descriptive name (e.g., "ConservationConnector Feedback")
   - Select the **"repo"** scope
   - Generate the token and copy it

2. **Add the token as a GitHub Secret:**
   - **For production (GitHub Actions):**
     1. Go to your GitHub repository
     2. Navigate to Settings > Secrets and variables > Actions
     3. Click "New repository secret"
     4. Name: `VITE_GITHUB_TOKEN`
     5. Value: Paste your GitHub Personal Access Token
     6. Click "Add secret"
   - **For local development:** Create a `.env` file in the project root with:
     ```
     VITE_GITHUB_TOKEN=your_github_token_here
     ```

⚠️ **Important:** Never commit your `.env` file or expose your GitHub token in code. Always use GitHub Secrets for production deployments.

## Notes

- The token needs the "repo" scope to create files in this repository
- Feedback files are automatically named with timestamps to ensure uniqueness
- Without the token configured, the feedback form will still appear but will display a warning that submission is not configured
