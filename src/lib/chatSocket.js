// Single shared WebSocket connection for the whole page, created once when
// this module is first imported. Kept outside React's component lifecycle
// on purpose: effects in React.StrictMode mount/cleanup/remount once in dev,
// and a WebSocket opened inside an effect can still complete its handshake
// with the server even after being closed mid-CONNECTING, leaving a real
// duplicate connection behind. A module-level singleton sidesteps that —
// React components just subscribe/unsubscribe to it.

const WS_URL = `ws://${window.location.hostname}:8787`
const RECONNECT_DELAY = 2000

let socket = null
let selfId = null
let connected = false
let participantCount = 0
let history = []

const messageListeners = new Set()
const connectionListeners = new Set()

function normalize(entry) {
  if (entry.type === 'system') {
    return { id: entry.id, system: true, text: entry.text }
  }
  return {
    id: entry.id,
    sender: entry.sender,
    text: entry.text,
    isMe: entry.senderId === selfId,
    color: entry.color,
  }
}

function emitMessage(msg) {
  messageListeners.forEach((fn) => fn(msg))
}

function emitConnection() {
  connectionListeners.forEach((fn) => fn({ connected, participantCount }))
}

function connect() {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return
  }

  socket = new WebSocket(WS_URL)

  socket.onopen = () => {
    connected = true
    emitConnection()
  }

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)

    if (data.type === 'init') {
      selfId = data.selfId
      participantCount = data.participantCount
      history = data.messages.map(normalize)
      emitConnection()
      history.forEach(emitMessage)
      return
    }

    if (data.type === 'chat' || data.type === 'system') {
      const msg = normalize(data)
      history.push(msg)
      if (typeof data.participantCount === 'number') participantCount = data.participantCount
      emitMessage(msg)
      emitConnection()
    }
  }

  socket.onclose = () => {
    connected = false
    emitConnection()
    setTimeout(connect, RECONNECT_DELAY)
  }

  socket.onerror = () => socket.close()
}

connect()

export function getSnapshot() {
  return { messages: history.slice(), connected, participantCount }
}

export function subscribeMessages(fn) {
  messageListeners.add(fn)
  return () => messageListeners.delete(fn)
}

export function subscribeConnection(fn) {
  connectionListeners.add(fn)
  return () => connectionListeners.delete(fn)
}

export function sendChat(text) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'chat', text }))
  }
}

export function sendAnnounce(text) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: 'announce', text }))
  }
}
