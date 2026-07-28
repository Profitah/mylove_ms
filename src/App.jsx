import { useState } from 'react'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import ChatTab from './components/ChatTab'
import GiftTab from './components/GiftTab'
import { useChatMessages } from './hooks/useChatMessages'
import { usePoints } from './hooks/usePoints'
import './App.css'

export default function App() {
  const [activeTab, setActiveTab] = useState('chat')
  const { points, mow, gift, cooldown } = usePoints()
  const { messages, sendMessage, addSystemMessage, participantCount, connected } =
    useChatMessages()

  const handleMow = () => mow()

  const handleGift = (option) => {
    gift(option)
    addSystemMessage(`${option.label}(을)를 선물했어요! 🎁`)
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
          <GiftTab points={points} onMow={handleMow} onGift={handleGift} cooldown={cooldown} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  )
}
