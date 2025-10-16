/**
 * @typedef {'bug' | 'feature' | 'improvement' | 'general'} FeedbackType
 */

/**
 * @typedef {Object} UserFeedback
 * @property {string} timestamp - ISO timestamp of when feedback was submitted
 * @property {FeedbackType} feedbackType - Type of feedback
 * @property {string} subject - Brief description of feedback
 * @property {string} message - Detailed feedback message
 * @property {string} [userAgent] - Browser user agent
 * @property {string} [url] - URL where feedback was submitted
 */

/**
 * @typedef {Object} FeedbackFormData
 * @property {FeedbackType} feedbackType - Type of feedback
 * @property {string} subject - Brief description
 * @property {string} message - Detailed message
 */

export {};
