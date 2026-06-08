export function formatDate(ts: number): string {
  const d = new Date(ts)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const diffDays = Math.round((target - today) / 86_400_000)

  let dayLabel: string
  if (diffDays === 0) dayLabel = '今日'
  else if (diffDays === 1) dayLabel = '聽日'
  else if (diffDays === -1) dayLabel = '昨日'
  else if (diffDays > 1 && diffDays < 7) dayLabel = `${diffDays}日後`
  else dayLabel = `${d.getMonth() + 1}月${d.getDate()}日`

  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${dayLabel} ${hh}:${mm}`
}

export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function getNextRecurringDate(ts: number, recurring: string): number {
  const d = new Date(ts)
  switch (recurring) {
    case 'daily':   d.setDate(d.getDate() + 1); break
    case 'weekly':  d.setDate(d.getDate() + 7); break
    case 'monthly': d.setMonth(d.getMonth() + 1); break
    default: return ts
  }
  return d.getTime()
}

export const RECURRING_OPTIONS = [
  { value: 'none',   label: '無' },
  { value: 'daily',  label: '每日' },
  { value: 'weekly', label: '每週' },
  { value: 'monthly',label: '每月' },
] as const
