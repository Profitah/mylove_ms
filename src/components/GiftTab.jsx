import { useEffect, useState } from 'react'
import { giftOptions } from '../data/seed'
import hachiwareImg from '../assets/하치와레.webp'
import BoomButton from './BoomButton'

export default function GiftTab({ points, onMow, onGift }) {
  const [feedback, setFeedback] = useState('')
  const [pulse, setPulse] = useState(false)

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

  const handleMow = () => {
    onMow()
    setFeedback('좋았어, 돈이 생겼다! (+10P)')
    setPulse(true)
  }

  const handleGift = (option) => {
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
            onClick={handleMow}
          >
            제초하기
          </button>
        </div>
        {feedback && <div className="feedback">{feedback}</div>}
      </div>

      <div className="gift-options">
        {giftOptions.map((option) => (
          <BoomButton
            key={option.id}
            className="gift-card"
            disabled={points < option.price}
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
