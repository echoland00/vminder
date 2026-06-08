// Ported from native App.tsx — Cantonese voice/text parser
// Strategy: progressive strip → trigger word + ampm + day + time → remaining = "name + message"
import type { ParsedInput } from '../types'

const TRIGGER_WORDS = ['提醒', '通知', '提', '叫']   // long-first so 提醒 matches before 提
const DAY_KEYWORDS  = ['聽日', '听日', '明天', '後天', '后天', '今日', '今天', '聽晚', '听晚', '今晚']
const AMPM_PM       = ['晏晝', '下午', '下晝']
const AMPM_AM       = ['上晝', '上午', '朝早']
const MESSAGE_VERBS = ['食藥', '吃藥', '食嘢', '飲水', '覆診', '睇醫生', '開會', '買菜', '食飯', '打針', '覆call', '打電話']

export function parseCantoneseInput(text: string): ParsedInput | null {
  const now = new Date()
  let hour = 12
  let minute = 0
  let dayOffset = 0
  let ampm: 'am' | 'pm' | null = null

  if      (AMPM_PM.some(k => text.includes(k))) ampm = 'pm'
  else if (AMPM_AM.some(k => text.includes(k))) ampm = 'am'

  // Time extraction — supports both Arabic ("3點") and Chinese ("三點") digits + "半"
  const cnDigitChars = '一二三四五六七八九兩十半'
  const timePatterns = [
    new RegExp(`([0-9${cnDigitChars}]+)\\s*[點点]\\s*(?:([0-9${cnDigitChars}]+)\\s*[分分]?)?`),
    /([0-9]+)\s*:\s*([0-9]+)/,
  ]
  const cnDigitMap: Record<string, number> = { '一':1,'二':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10,'兩':2,'半':0.5 }
  const parseCnNum = (s: string): number => {
    if (/^[0-9]+$/.test(s)) return parseInt(s)
    if (s === '半') return 0.5
    if (s.length === 1 && cnDigitMap[s] !== undefined) return cnDigitMap[s]
    // Handle 十X (10+x) and X十 (x*10)
    if (s.includes('十')) {
      const [tens, ones] = s.split('十')
      const t = tens ? cnDigitMap[tens] || 1 : 1
      const o = ones ? cnDigitMap[ones] || 0 : 0
      return t * 10 + o
    }
    return parseInt(s) || 0
  }
  for (const pattern of timePatterns) {
    const m = text.match(pattern)
    if (m) {
      const h = Math.floor(parseCnNum(m[1]) || 12)
      const min = m[2] ? Math.floor(parseCnNum(m[2]) || 0) : 0
      let hh = h
      if (ampm === 'pm' && hh < 12) hh += 12
      if (ampm === 'am' && hh === 12) hh = 0
      hour = hh
      minute = min
      break
    }
  }

  if      (text.includes('聽日') || text.includes('听日') || text.includes('明天')) dayOffset = 1
  else if (text.includes('後天') || text.includes('后天'))                          dayOffset = 2
  else if (text.includes('今日') || text.includes('今天'))                          dayOffset = 0
  else if (text.includes('聽晚') || text.includes('听晚') || text.includes('今晚'))  dayOffset = 0

  const scheduledFor = new Date(now)
  scheduledFor.setDate(now.getDate() + dayOffset)
  scheduledFor.setHours(hour, minute, 0, 0)
  // Default times for non-time-explicit phrases
  if (hour === 12 && minute === 0) {
    if (text.includes('朝早') || text.includes('早上')) { hour = 9; ampm = 'am' }
    else if (text.includes('下晝') || text.includes('晏晝') || text.includes('下午')) { hour = 14; ampm = 'pm' }
    else if (text.includes('聽晚') || text.includes('今晚') || text.includes('晚上')) { hour = 20; ampm = 'pm' }
  }

  // Progressive strip: remove day, ampm, time, trigger
  let remaining = text
  // Remove all day keywords
  for (const k of DAY_KEYWORDS) remaining = remaining.split(k).join('')
  // Remove all ampm keywords
  for (const k of [...AMPM_PM, ...AMPM_AM]) remaining = remaining.split(k).join('')
  // Remove time patterns (Arabic and Chinese digits)
  remaining = remaining
    .replace(/[0-9]+\s*:\s*[0-9]+/g, '')
    .replace(new RegExp(`[0-9${cnDigitChars}]+\\s*[點点]\\s*(?:[0-9${cnDigitChars}]+\\s*[分分]?)?`, 'g'), '')
    .replace(/\b半\b/g, '')
  // Remove first trigger word
  for (const tw of TRIGGER_WORDS) {
    if (remaining.includes(tw)) {
      remaining = remaining.split(tw).join('')
      break
    }
  }
  // Strip whitespace
  remaining = remaining.replace(/\s+/g, ' ').trim()

  // remaining is now: "<contactName><messageVerb>" or "<messageVerb><contactName>" or "<contactName>"
  // Try to split at first message verb
  let contactName = ''
  let message = ''
  let splitIdx = -1
  for (const v of MESSAGE_VERBS) {
    const idx = remaining.indexOf(v)
    if (idx !== -1 && (splitIdx === -1 || idx < splitIdx)) {
      splitIdx = idx
    }
  }
  if (splitIdx !== -1) {
    contactName = remaining.substring(0, splitIdx).trim()
    message     = remaining.substring(splitIdx).trim()
  } else {
    // No known message verb — try heuristic: first 2-3 chars are name, rest is message
    const m = remaining.match(/^([\S]{1,8}?)([\S].*)$/)
    if (m && m[1].length <= 12) {
      contactName = m[1]
      message     = m[2]
    } else {
      return null
    }
  }

  // Clean contact name (strip particles)
  contactName = contactName.replace(/^(佢|你|我|他|她|它|請|麻烦|同|和)\s*/, '').trim()
  // Clean message
  message = message.trim()

  if (!contactName || !message) return null
  if (contactName.length > 12) return null

  return { contactName, message, scheduledFor }
}
