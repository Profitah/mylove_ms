import { useCallback, useEffect, useState } from 'react'
import { getSnapshot, subscribePoints, subscribeRateLimited, sendMow, sendGift } from '../lib/chatSocket'

// Points pool shared by every connected client, backed by the same WebSocket
// singleton as useChatMessages. The server holds the authoritative value and
// persists it to disk, so it survives refreshes and is identical for everyone.
//
// `cooldown` reflects the server's per-connection rate limit. The server only
// ever sends a rate_limited reply to the socket that tripped it, so this can
// only ever be set by this user's own actions — never by another user's mow
// or gift.
export function usePoints() {
  const [points, setPoints] = useState(() => getSnapshot().points)
  const [cooldown, setCooldown] = useState(null)

  useEffect(() => {
    setPoints(getSnapshot().points)
    const unsubPoints = subscribePoints(setPoints)
    const unsubRateLimit = subscribeRateLimited(setCooldown)
    return () => {
      unsubPoints()
      unsubRateLimit()
    }
  }, [])

  const mow = useCallback(() => sendMow(), [])
  const gift = useCallback((option) => sendGift(option.id), [])

  return { points, mow, gift, cooldown }
}
