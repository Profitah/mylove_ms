import { useEffect, useState } from 'react'
import { giftOptions } from '../data/seed'
import hachiwareImg from '../assets/하치와레.webp'
import BoomButton from './BoomButton'

export default function GiftTab({ points, onMow, onGift, cooldown }) {
  const [feedback, setFeedback] = useState('')
  const [pulse, setPulse] = useState(false)
  const [cooldownMs, setCooldownMs] = useState(0)

  useEffect(() => {
    if (!feedback) return
    const timer = setTimeout(() => setFeedback(''), 2000)
    return () => clearTimeout(timer)
  }, [feedback])

  useEffect(() => {
    if (!pulse) return
    const timer = setTimeout(() => setPulse(false), 400)
    return () => clearTimeout(timer)
  }, [pulse])

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

  const handleMow = () => {
    if (cooldownActive) return
    onMow()
    setFeedback('좋았어, 돈이 생겼다! (+1000P)')
    setPulse(true)
  }

  const handleGift = (option) => {
    if (cooldownActive) return
    if (points < option.price) {
      setFeedback('포인트가 부족해요')
      return
    }
    onGift(option)
    setFeedback(`${option.label} 선물 보내기 완료! (-${option.price}P)`)
  }

  return (
    <div className="gift-tab">
      <div className="points-display">
        보유 포인트: <span className="value">{points.toLocaleString()}</span>
      </div>

      <div className="cat-panel">
        <div className="cat-avatar">
          <img src={hachiwareImg} alt="하치와레" />
        </div>
        <div className="mow-btn-wrap">
          <span className="mow-btn-glow" aria-hidden="true" />
          <button
            type="button"
            className={`mow-btn${pulse ? ' pulse' : ''}`}
            disabled={cooldownActive}
            onClick={handleMow}
          >
            제초하기
          </button>
        </div>
        <div className="feedback">
          {cooldownActive ? `너무 빨라요! ${cooldownSeconds}초 후 다시 시도해주세요` : feedback}
        </div>
      </div>

      <div className="gift-options">
        {giftOptions.map((option) => (
          <BoomButton
            key={option.id}
            className="gift-card"
            disabled={points < option.price || cooldownActive}
            onClick={() => handleGift(option)}
          >
            <div className="gift-icon" style={{ background: option.color }} />
            <span>{option.label}</span>
            <span className="gift-price">{option.price}P</span>
          </BoomButton>
        ))}
      </div>
    </div>
  )
}
