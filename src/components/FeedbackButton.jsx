import './FeedbackButton.css';

/**
 * @param {Object} props
 * @param {() => void} props.onClick
 */
const FeedbackButton = ({ onClick }) => {
  return (
    <button
      className="feedback-button"
      onClick={onClick}
      aria-label="Send feedback"
      title="Send feedback"
    >
      💬
    </button>
  );
};

export default FeedbackButton;
