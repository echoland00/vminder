// Ported from native App.tsx — Cantonese voice/text parser
// Returns null if it cannot confidently extract contact + message

import type { ParsedInput } from '../types'

export function parseCantoneseInput(text: string): ParsedInput | null {
  const now = new Date()
  let hour = 12
  let minute = 0
  let dayOffset = 0

  // Time patterns: "3點", "3點30分", "15:30", "下晝3點"
  const ampm = /晏晝|下午|下晝/i.test(text) ? 'pm' : /上晝|上午|朝早/i.test(text) ? 'am' : null

  const timePatterns = [
    /([0-9]+)\s*[點点]\s*(?:([0-9]+)\s*[分分])?/,
    /([0-9]+)\s*:\s*([0-9]+)/,
  ]

  for (const pattern of timePatterns) {
    const m = text.match(pattern)
    if (m) {
      let h = parseInt(m[1]) || 12
      const min = m[2] ? parseInt(m[2]) : 0
      if (ampm === 'pm' && h < 12) h += 12
      if (ampm === 'am' && h === 12) h = 0
      hour = h
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

  // If "tonight" + no explicit time, default to 20:00
  if ((text.includes('聽晚') || text.includes('今晚')) && !text.match(/[0-9]/)) {
    scheduledFor.setHours(20, 0, 0, 0)
  }

  // Extract contact name — pattern: 提/叫/提醒/通知 [name]
  let contactName = ''
  const contactPatterns = [
    /(?:提|叫|提醒|通知)\s*([^\s聽日聽晚今日後天今晚明天點分:.0-9]{1,10})/,
    /(?:提|叫|提醒|通知)\s*(\S{1,10})/,
  ]
  for (const pattern of contactPatterns) {
    const m = text.match(pattern)
    if (m) {
      contactName = m[1].replace(/[\s去食做喊]/g, '').trim()
      if (contactName.length > 0) break
    }
  }

  // Strip modifiers out of the message
  let message = text
    .replace(/聽日|聽晚|今日|後天|明天|今晚|今天|听日|听晚|今日|后天/g, '')
    .replace(/(?:晏晝|下午|下晝|上晝|上午|朝早)/g, '')
    .replace(/[0-9]+\s*:\s*[0-9]+/g, '')
    .replace(/[0-9]+\s*[點点]\s*(?:[0-9]+\s*[分分])?/g, '')
    .replace(/(提|叫|提醒|通知)\s*([^\s]+)/, '')   // removes "提Jay" etc
    .trim()

  if (!contactName || !message) return null
  return { contactName, message, scheduledFor }
}
