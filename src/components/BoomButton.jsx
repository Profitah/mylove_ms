import { useRef } from 'react'
import { boom, BOOM_LIFETIME_MS } from '../utils/boom'

// Drop-in <button> replacement that bursts a shower of little confetti
// shapes from the click point. Used on the 선물하기 tab's action buttons.
// The particle layer is a sibling (not a child) of the button, painted
// above it (pointer-events: none so clicks still reach the button)
// so the burst stays visible instead of hiding under the button's
// own opaque background.
export default function BoomButton({ className, onClick, children, ...rest }) {
  const containerRef = useRef(null)
  const layerRef = useRef(null)
  const resetTimerRef = useRef(null)

  const handleClick = (e) => {
    if (layerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      boom(layerRef.current, e.clientX - rect.left, e.clientY - rect.top)
    }
    // Particles can spray past this card's own bounds into neighboring
    // gift cards; lift this card's stacking context for the burst's
    // duration so it never renders underneath the card next to it.
    if (containerRef.current) {
      containerRef.current.classList.add('is-bursting')
      clearTimeout(resetTimerRef.current)
      resetTimerRef.current = setTimeout(() => {
        containerRef.current?.classList.remove('is-bursting')
      }, BOOM_LIFETIME_MS)
    }
    onClick?.(e)
  }

  return (
    <span className="boom-contain" ref={containerRef}>
      <button type="button" className={`boom-btn ${className}`} onClick={handleClick} {...rest}>
        {children}
      </button>
      <span className="boom-layer" ref={layerRef} aria-hidden="true" />
    </span>
  )
}
