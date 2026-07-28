import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import pg from 'pg'
import { INITIAL_POINTS } from '../src/data/seed.js'

// Points and chat history live in Postgres when DATABASE_URL is set (Render,
// etc.) so they survive a redeploy — the container's own disk gets wiped on
// redeploy, but an external DB doesn't. With no DATABASE_URL (plain local
// dev), we fall back to the same points.json/chatHistory.json files this
// used before, so local dev needs no DB setup.
const DATA_DIR = path.dirname(fileURLToPath(import.meta.url))
const POINTS_FILE = path.join(DATA_DIR, 'points.json')
const CHAT_HISTORY_FILE = path.join(DATA_DIR, 'chatHistory.json')

const databaseUrl = process.env.DATABASE_URL
const isLocalDb = databaseUrl?.includes('localhost') || databaseUrl?.includes('127.0.0.1')

const pool = databaseUrl
  ? new pg.Pool({
      connectionString: databaseUrl,
      ssl: isLocalDb ? false : { rejectUnauthorized: false },
    })
  : null

// Single key/value table is enough for this app's two small blobs (a number
// and a short message array) — no need for a full relational schema.
export async function init() {
  if (!pool) return
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL
    )
  `)
}

async function loadValue(key, fallback) {
  const { rows } = await pool.query('SELECT value FROM app_state WHERE key = $1', [key])
  return rows.length ? rows[0].value : fallback
}

async function saveValue(key, value) {
  // pg serializes JS arrays as Postgres array literals, not JSON, so
  // chatHistory (an array) must be stringified ourselves before it hits the
  // jsonb column — otherwise Postgres rejects it as malformed JSON.
  await pool.query(
    `INSERT INTO app_state (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = $2::jsonb`,
    [key, JSON.stringify(value)]
  )
}

export async function loadPoints() {
  if (pool) return (await loadValue('points', { points: INITIAL_POINTS })).points
  try {
    return JSON.parse(readFileSync(POINTS_FILE, 'utf-8')).points
  } catch {
    return INITIAL_POINTS
  }
}

export async function savePoints(points) {
  if (pool) return saveValue('points', { points })
  writeFileSync(POINTS_FILE, JSON.stringify({ points }))
}

export async function loadHistory() {
  if (pool) return loadValue('chatHistory', [])
  try {
    return JSON.parse(readFileSync(CHAT_HISTORY_FILE, 'utf-8'))
  } catch {
    return []
  }
}

export async function saveHistory(entries) {
  if (pool) return saveValue('chatHistory', entries)
  writeFileSync(CHAT_HISTORY_FILE, JSON.stringify(entries))
}
