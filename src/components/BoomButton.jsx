import { useRef } from 'react'
import { boom } from '../utils/boom'

// Drop-in <button> replacement that bursts a shower of little confetti
// shapes from the click point. Used on the 선물하기 tab's action buttons.
// The particle layer is a sibling (not a child) of the button, painted
// underneath it, so the burst never covers the button's own label.
export default function BoomButton({ className, onClick, children, ...rest }) {
  const layerRef = useRef(null)

  const handleClick = (e) => {
    if (layerRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      boom(layerRef.current, e.clientX - rect.left, e.clientY - rect.top)
    }
    onClick?.(e)
  }

  return (
    <span className="boom-contain">
      <button type="button" className={`boom-btn ${className}`} onClick={handleClick} {...rest}>
        {children}
      </button>
      <span className="boom-layer" ref={layerRef} aria-hidden="true" />
    </span>
  )
}
