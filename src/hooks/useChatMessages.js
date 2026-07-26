import { useCallback, useEffect, useState } from 'react'
import {
  getSnapshot,
  subscribeMessages,
  subscribeConnection,
  sendChat,
  sendAnnounce,
} from '../lib/chatSocket'

// Realtime chat store backed by the shared WebSocket singleton in
// src/lib/chatSocket.js. Call sites (ChatTab/App) are unchanged from the
// local-state version — only what's inside this hook talks to the network.
export function useChatMessages() {
  const [state, setState] = useState(getSnapshot)

  useEffect(() => {
    setState(getSnapshot())

    const unsubscribeMessages = subscribeMessages((msg) => {
      setState((prev) => ({ ...prev, messages: [...prev.messages, msg] }))
    })
    const unsubscribeConnection = subscribeConnection(({ connected, participantCount }) => {
      setState((prev) => ({ ...prev, connected, participantCount }))
    })

    return () => {
      unsubscribeMessages()
      unsubscribeConnection()
    }
  }, [])

  const sendMessage = useCallback((text) => {
    const trimmed = text.trim()
    if (trimmed) sendChat(trimmed)
  }, [])

  const addSystemMessage = useCallback((text) => sendAnnounce(text), [])

  return {
    messages: state.messages,
    participantCount: state.participantCount,
    connected: state.connected,
    sendMessage,
    addSystemMessage,
  }
}
