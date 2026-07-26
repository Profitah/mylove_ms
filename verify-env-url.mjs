import { chromium } from 'playwright'

const browser = await chromium.launch({ args: ['--no-sandbox'] })
const page = await browser.newPage()

const wsUrls = []
page.on('websocket', (ws) => wsUrls.push(ws.url()))

await page.goto('http://localhost:5173')
await page.waitForSelector('text=채팅방')
await page.waitForTimeout(1000)

console.log('WebSocket URL(s) the page attempted to connect to:', JSON.stringify(wsUrls))

await browser.close()
