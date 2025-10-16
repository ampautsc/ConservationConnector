import { useState, useMemo } from 'react';
import { GitHubAdapter } from '../api/GitHubAdapter';
import './FeedbackModal.css';

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 */
const FeedbackModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    feedbackType: 'general',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const githubAdapter = useMemo(() => new GitHubAdapter(), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in both subject and message fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const feedback = {
        timestamp: new Date().toISOString(),
        feedbackType: formData.feedbackType,
        subject: formData.subject,
        message: formData.message,
        userAgent: navigator.userAgent,
        url: window.location.href,
      };

      await githubAdapter.submitFeedback(feedback);
      
      setSubmitStatus('success');
      setFormData({
        feedbackType: 'general',
        subject: '',
        message: '',
      });

      // Close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  const isConfigured = githubAdapter.isConfigured();

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="feedback-modal-header">
          <h2>📝 Send Feedback</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {!isConfigured && (
          <div className="feedback-warning">
            ⚠️ Feedback submission is not configured. Please contact the administrator to set up the GitHub token.
          </div>
        )}

        <form onSubmit={handleSubmit} className="feedback-form">
          <div className="form-group">
            <label htmlFor="feedbackType">Feedback Type</label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="bug">🐛 Bug Report</option>
              <option value="feature">💡 Feature Request</option>
              <option value="improvement">✨ Improvement</option>
              <option value="general">💬 General Feedback</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Brief description of your feedback"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please provide detailed feedback..."
              rows={6}
              disabled={isSubmitting}
              required
            />
          </div>

          {submitStatus === 'success' && (
            <div className="feedback-success">
              ✅ Thank you! Your feedback has been submitted successfully.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="feedback-error">
              ❌ {errorMessage || 'Failed to submit feedback. Please try again.'}
            </div>
          )}

          <div className="feedback-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting || !isConfigured}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
