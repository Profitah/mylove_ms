import { useCallback, useEffect, useState } from 'react'
import { getSnapshot, subscribePoints, sendMow, sendGift } from '../lib/chatSocket'

// Points pool shared by every connected client, backed by the same WebSocket
// singleton as useChatMessages. The server holds the authoritative value and
// persists it to disk, so it survives refreshes and is identical for everyone.
export function usePoints() {
  const [points, setPoints] = useState(() => getSnapshot().points)

  useEffect(() => {
    setPoints(getSnapshot().points)
    return subscribePoints(setPoints)
  }, [])

  const mow = useCallback(() => sendMow(), [])
  const gift = useCallback((option) => sendGift(option.id), [])

  return { points, mow, gift }
}
