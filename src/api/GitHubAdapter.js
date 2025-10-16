/**
 * GitHub Adapter for submitting user feedback
 * Stores feedback as JSON files in the UserFeedback folder
 * 
 * Configuration:
 * To enable feedback submission, set the VITE_GITHUB_TOKEN environment variable.
 * This can be done by:
 * 1. Creating a .env file in the project root with: VITE_GITHUB_TOKEN=your_github_token
 * 2. Setting it in your build/deployment environment (e.g., Azure Static Web Apps Configuration)
 * 
 * The GitHub token needs the following permissions:
 * - repo scope (to create files in the repository)
 * 
 * To create a GitHub token:
 * 1. Go to GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
 * 2. Click "Generate new token (classic)"
 * 3. Give it a descriptive name (e.g., "ConservationConnector Feedback")
 * 4. Select the "repo" scope
 * 5. Generate the token and copy it
 * 6. Add it as VITE_GITHUB_TOKEN in your environment
 */
export class GitHubAdapter {
  constructor() {
    // Get GitHub token from environment variable
    // In production, this should be set in GitHub Secrets (embedded at build time)
    this.token = import.meta.env.VITE_GITHUB_TOKEN || '';
    this.owner = 'ampautsc';
    this.repo = 'ConservationConnector';
    this.branch = 'main';
  }

  /**
   * Submit feedback to the GitHub repository
   * Creates a new file in the UserFeedback folder
   * @param {import('../types/Feedback').UserFeedback} feedback - The feedback to submit
   * @returns {Promise<void>}
   */
  async submitFeedback(feedback) {
    if (!this.token) {
      throw new Error('GitHub token is not configured. Please set VITE_GITHUB_TOKEN environment variable.');
    }

    // Generate a unique filename based on timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `feedback-${timestamp}.json`;
    const path = `UserFeedback/${filename}`;

    // Prepare the content
    const content = JSON.stringify(feedback, null, 2);
    const encodedContent = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));

    // Prepare commit message
    const commitMessage = `Add user feedback: ${feedback.subject}`;

    // GitHub API endpoint
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          branch: this.branch,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(`Failed to submit feedback: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  /**
   * Check if the adapter is properly configured
   * @returns {boolean}
   */
  isConfigured() {
    return !!this.token;
  }
}
