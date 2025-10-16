import { useState } from 'react'
import ConservationMap from './components/ConservationMap'
import FeedbackButton from './components/FeedbackButton'
import FeedbackModal from './components/FeedbackModal'
import './App.css'

function App() {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  return (
    <>
      <ConservationMap />
      <FeedbackButton onClick={() => setShowFeedbackModal(true)} />
      <FeedbackModal 
        isOpen={showFeedbackModal} 
        onClose={() => setShowFeedbackModal(false)} 
      />
    </>
  )
}

export default App
