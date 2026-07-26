import { useState } from 'react'

export default function ChatTab({ messages, onSend, participantCount, connected }) {
  const [draft, setDraft] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSend(draft)
    setDraft('')
  }

  return (
    <div className="chat-tab">
      <div className="chat-header">
        채팅방 · 익명 {participantCount}명
        {!connected && <span className="connection-status">연결 중...</span>}
      </div>

      <div className="chat-messages">
        {messages.map((msg) =>
          msg.system ? (
            <div key={msg.id} className="system-message">
              {msg.text}
            </div>
          ) : (
            <div key={msg.id} className={`msg-row${msg.isMe ? ' me' : ''}`}>
              {!msg.isMe && (
                <div className="avatar" style={{ background: msg.color }} />
              )}
              <div className="msg-col">
                {!msg.isMe && <span className="sender-name">{msg.sender}</span>}
                <div className={`bubble${msg.isMe ? ' me' : ''}`}>{msg.text}</div>
              </div>
              {msg.isMe && (
                <div className="avatar" style={{ background: msg.color }} />
              )}
            </div>
          )
        )}
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={connected ? '메시지를 입력하세요' : '연결 중...'}
          aria-label="메시지 입력"
          disabled={!connected}
        />
        <button type="submit" className="send-btn" disabled={!connected}>
          전송
        </button>
      </form>
    </div>
  )
}
