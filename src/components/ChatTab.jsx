import { useEffect, useState } from 'react'
import { subscribeRateLimited } from '../lib/chatSocket'

export default function ChatTab({ messages, onSend, participantCount, connected }) {
  const [draft, setDraft] = useState('')
  const [cooldown, setCooldown] = useState(null)
  const [cooldownMs, setCooldownMs] = useState(0)

  useEffect(
    () => subscribeRateLimited((info) => {
      if (info.category === 'chat') setCooldown(info)
    }),
    []
  )

  useEffect(() => {
    if (!cooldown) return
    const until = cooldown.at + cooldown.retryAfterMs
    const tick = () => setCooldownMs(Math.max(0, until - Date.now()))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  const cooldownActive = cooldownMs > 0
  const cooldownSeconds = Math.ceil(cooldownMs / 1000)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSend(draft)
    setDraft('')
  }

  return (
    <div className="chat-tab">
      {cooldownActive && (
        <div className="toast">메시지를 너무 빨리 보냈어요! {cooldownSeconds}초 후 다시 시도해주세요</div>
      )}

      <div className="chat-header">
        채팅방 · 익명 {participantCount}명
        {!connected && <span className="connection-status">연결 중...</span>}
      </div>

      <div className="chat-messages">
        {messages.map((msg) =>
          msg.system ? (
            <div key={msg.id} className="system-message">
              {msg.sender ? `${msg.isMe ? '나' : msg.sender}: ${msg.text}` : msg.text}
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
