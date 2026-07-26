import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import ChatTab from './components/ChatTab'
import GiftTab from './components/GiftTab'
import { useChatMessages } from './hooks/useChatMessages'
import { INITIAL_POINTS } from './data/seed'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const [points, setPoints] = useState(INITIAL_POINTS)
  const { messages, sendMessage, addSystemMessage, participantCount, connected } =
    useChatMessages()

  const handleMow = () => setPoints((p) => p + 10)

  const handleGift = (option) => {
    setPoints((p) => p - option.price)
    addSystemMessage(`나: ${option.label}(을)를 선물했어요! 🎁`)
  }

  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="main-content">
        {activeTab === 'chat' ? (
          <ChatTab
            messages={messages}
            onSend={sendMessage}
            participantCount={participantCount}
            connected={connected}
          />
        ) : (
          <GiftTab points={points} onMow={handleMow} onGift={handleGift} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  )
}
