import { WebSocketServer } from 'ws'
import { randomUUID } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { RingBuffer } from './ringBuffer.js'
import { giftOptions, INITIAL_POINTS } from '../src/data/seed.js'

// Hosting platforms (Railway/Render/etc.) inject PORT and expect the app to
// listen on it; CHAT_PORT is for manual/local overrides, 8787 is the plain-local default.
const PORT = process.env.PORT || process.env.CHAT_PORT || 8787
const MAX_HISTORY = 30
const MAX_MESSAGE_LENGTH = 804

const DATA_DIR = path.dirname(fileURLToPath(import.meta.url))

// All connected clients share one points pool. Persisted to disk so a server
// restart doesn't reset everyone back to INITIAL_POINTS.
const POINTS_FILE = path.join(DATA_DIR, 'points.json')

function loadPoints() {
  try {
    return JSON.parse(readFileSync(POINTS_FILE, 'utf-8')).points
  } catch {
    return INITIAL_POINTS
  }
}

function savePoints() {
  writeFileSync(POINTS_FILE, JSON.stringify({ points }))
}

let points = loadPoints()

// Recent chat/system messages, persisted the same way so a restart doesn't
// wipe the conversation.
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'chatHistory.json')

function loadHistoryEntries() {
  try {
    return JSON.parse(readFileSync(CHAT_HISTORY_FILE, 'utf-8'))
  } catch {
    return []
  }
}

function saveHistory() {
  writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(history.toArray()))
}

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

// Per-connection rate limit: at most RATE_LIMIT_MAX messages per
// RATE_LIMIT_WINDOW_MS. Tripping that burst limit locks the connection out
// for RATE_LIMIT_PENALTY_MS before it can send anything in that category
// again. Blocks spamming the shared points pool or flooding chat, without
// trusting the client to police itself.
//
// Chat and gift-related actions (mow/gift/the system announce a gift posts)
// are tracked as two independent buckets — sending a burst of gifts
// shouldn't lock you out of chatting, and vice versa.
const RATE_LIMIT_WINDOW_MS = 5000
const RATE_LIMIT_MAX = 10
const RATE_LIMIT_PENALTY_MS = 2 * 60 * 1000

// mow (제초하기) is intentionally excluded from rate limiting — returns null,
// which skips the check entirely.
function categoryFor(type) {
  if (type === 'mow') return null
  return type === 'gift' || type === 'announce' ? 'gift' : 'chat'
}

function createRateLimitState() {
  return { windowStart: Date.now(), messageCount: 0, blockedUntil: 0 }
}

// Returns ms remaining before the client may send again, or 0 if the message
// is allowed (and counts toward the current window).
function checkRateLimit(state) {
  const now = Date.now()

  if (state.blockedUntil > now) {
    return state.blockedUntil - now
  }

  if (now - state.windowStart >= RATE_LIMIT_WINDOW_MS) {
    state.windowStart = now
    state.messageCount = 0
  }
  state.messageCount += 1

  if (state.messageCount > RATE_LIMIT_MAX) {
    state.blockedUntil = now + RATE_LIMIT_PENALTY_MS
    return RATE_LIMIT_PENALTY_MS
  }

  return 0
}

const wss = new WebSocketServer({ port: PORT })
const clients = new Map() // ws -> { id, nickname, color, rateLimits: { chat, gift } }
const history = new RingBuffer(MAX_HISTORY)
for (const entry of loadHistoryEntries()) history.push(entry)

function broadcast(payload) {
  const raw = JSON.stringify(payload)
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) client.send(raw)
  }
}

function pushHistory(entry) {
  history.push(entry)
  saveHistory()
}

wss.on('connection', (ws) => {
  const id = randomUUID()
  const nickname = randomNickname()
  const color = randomColor()
  clients.set(ws, {
    id,
    nickname,
    color,
    rateLimits: { chat: createRateLimitState(), gift: createRateLimitState() },
  })

  ws.send(
    JSON.stringify({
      type: 'init',
      selfId: id,
      messages: history.toArray(),
      participantCount: clients.size,
      points,
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

    const client = clients.get(ws)
    const category = categoryFor(data.type)
    if (category) {
      const retryAfterMs = checkRateLimit(client.rateLimits[category])
      if (retryAfterMs > 0) {
        ws.send(JSON.stringify({ type: 'rate_limited', category, retryAfterMs }))
        return
      }
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
      const notice = { type: 'system', id: randomUUID(), text, senderId: id, sender: nickname }
      pushHistory(notice)
      broadcast(notice)
      return
    }

    if (data.type === 'mow') {
      points += 1000
      savePoints()
      broadcast({ type: 'points', points })
      return
    }

    if (data.type === 'gift') {
      const option = giftOptions.find((o) => o.id === data.optionId)
      if (!option || points < option.price) return
      points -= option.price
      savePoints()
      broadcast({ type: 'points', points })
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
