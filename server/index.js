import { WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import { RingBuffer } from './ringBuffer.js'

// Hosting platforms (Railway/Render/etc.) inject PORT and expect the app to
// listen on it; CHAT_PORT is for manual/local overrides, 8787 is the plain-local default.
const PORT = process.env.PORT || process.env.CHAT_PORT || 8787
const MAX_HISTORY = 50
const MAX_MESSAGE_LENGTH = 500

const ADJECTIVES = ['노란', '초록', '파란', '보라', '분홍', '주황', '하얀', '까만']
const NOUNS = ['민들레', '나뭇잎', '구름', '고양이', '토끼', '바람', '고슴도치', '수달']
const COLORS = ['#f4c542', '#7ec97e', '#3a7fd0', '#b388f0', '#f2a6d8', '#f5a25d', '#5ac8c8', '#e07a7a']

function randomNickname() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}${noun}`
}

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

const wss = new WebSocketServer({ port: PORT })
const clients = new Map() // ws -> { id, nickname, color }
const history = new RingBuffer(MAX_HISTORY)

function broadcast(payload) {
  const raw = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(raw)
  }
}

function pushHistory(entry) {
  history.push(entry)
}

wss.on('connection', (ws) => {
  const id = randomUUID()
  const nickname = randomNickname()
  const color = randomColor()
  clients.set(ws, { id, nickname, color })

  ws.send(
    JSON.stringify({
      type: 'init',
      selfId: id,
      messages: history.toArray(),
      participantCount: clients.size,
    })
  )

  const joinNotice = {
    type: 'system',
    id: randomUUID(),
    text: `${nickname}님이 입장했어요`,
    participantCount: clients.size,
  }
  pushHistory(joinNotice)
  broadcast(joinNotice)

  ws.on('message', (raw) => {
    let data
    try {
      data = JSON.parse(raw)
    } catch {
      return
    }

    if (data.type === 'chat' && typeof data.text === 'string') {
      const text = data.text.trim().slice(0, MAX_MESSAGE_LENGTH)
      if (!text) return
      const msg = {
        type: 'chat',
        id: randomUUID(),
        senderId: id,
        sender: nickname,
        color,
        text,
        ts: Date.now(),
      }
      pushHistory(msg)
      broadcast(msg)
      return
    }

    if (data.type === 'announce' && typeof data.text === 'string') {
      const text = data.text.trim().slice(0, MAX_MESSAGE_LENGTH)
      if (!text) return
      const notice = { type: 'system', id: randomUUID(), text }
      pushHistory(notice)
      broadcast(notice)
    }
  })

  ws.on('close', () => {
    clients.delete(ws)
    const leaveNotice = {
      type: 'system',
      id: randomUUID(),
      text: `${nickname}님이 퇴장했어요`,
      participantCount: clients.size,
    }
    pushHistory(leaveNotice)
    broadcast(leaveNotice)
  })
})

console.log(`chat ws server listening on ws://localhost:${PORT}`)
