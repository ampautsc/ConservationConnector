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

2. **Add the token to your environment:**
   - For local development: Create a `.env` file in the project root with:
     ```
     VITE_GITHUB_TOKEN=your_github_token_here
     ```
   - For Azure Static Web Apps: Add it in the Configuration settings as `VITE_GITHUB_TOKEN`

⚠️ **Important:** Never commit your `.env` file or expose your GitHub token in code.

## Notes

- The token needs the "repo" scope to create files in this repository
- Feedback files are automatically named with timestamps to ensure uniqueness
- Without the token configured, the feedback form will still appear but will display a warning that submission is not configured
