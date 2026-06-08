import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useContacts } from '../hooks/useContacts'
import { useReminders } from '../hooks/useReminders'
import {
  addReminder, updateReminder, deleteReminder, addReminder as addRecurringReminder,
} from '../firebase/firestore'
import { parseCantoneseInput } from '../lib/parser'
import { formatDate, getNextRecurringDate, RECURRING_OPTIONS } from '../lib/dateUtils'
import { createSpeechController } from '../lib/speech'
import type { Reminder, Recurring } from '../types'

export default function RemindersPage() {
  const { user } = useAuth()
  const contacts  = useContacts(user?.uid)
  const reminders = useReminders(user?.uid)

  const [showForm, setShowForm]   = useState(false)
  const [editing,  setEditing]    = useState<Reminder | null>(null)

  const pending = useMemo(
    () => reminders.filter(r => r.status === 'pending').sort((a, b) => a.scheduledFor - b.scheduledFor),
    [reminders]
  )

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="mb-6 flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">提緊</h1>
          <p className="mt-1 text-sm text-slate-500">{pending.length} 個待辦</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true) }}
          className="btn-primary"
        >
          <span className="text-lg leading-none">＋</span> 新提醒
        </button>
      </div>

      {pending.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <span className="text-3xl">🔔</span>
          </div>
          <p className="text-sm text-slate-500">未有提醒 — 撳「新提醒」開始</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pending.map(r => (
            <li key={r.id} className="card flex items-center gap-3">
              <button
                onClick={() => { setEditing(r); setShowForm(true) }}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-2">
                  <p className="card-title">提 {r.contactName}</p>
                  {r.recurring !== 'none' && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                      {RECURRING_OPTIONS.find(o => o.value === r.recurring)?.label}
                    </span>
                  )}
                </div>
                <p className="card-meta">{r.message}</p>
                <p className="card-time">{formatDate(r.scheduledFor)}</p>
              </button>
              <button
                onClick={async () => {
                  if (!user) return
                  await updateReminder(user.uid, r.id, { status: 'sent' })
                  if (r.recurring !== 'none') {
                    await addRecurringReminder(user.uid, {
                      contactId: r.contactId, contactName: r.contactName,
                      message: r.message, scheduledFor: getNextRecurringDate(r.scheduledFor, r.recurring),
                      status: 'pending', recurring: r.recurring, createdAt: Date.now(),
                    })
                  }
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-emerald-600 transition-colors hover:bg-emerald-50"
                title="完成"
              >✓</button>
              <button
                onClick={async () => {
                  if (!user) return
                  if (confirm('確定刪除此提醒？')) await deleteReminder(user.uid, r.id)
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                title="刪除"
              >✕</button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <ReminderForm
          uid={user!.uid}
          contacts={contacts}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

// ============================================================
// Reminder form — voice input + manual override
// ============================================================
function ReminderForm({
  uid, contacts, editing, onClose,
}: {
  uid: string
  contacts: ReturnType<typeof useContacts>
  editing: Reminder | null
  onClose: () => void
}) {
  const [inputText, setInputText]   = useState(editing?.message ?? '')
  const [contactId, setContactId]   = useState(editing?.contactId ?? '')
  const [message, setMessage]       = useState(editing?.message ?? '')
  const [date, setDate]             = useState(editing ? new Date(editing.scheduledFor) : new Date())
  const [hour, setHour]             = useState(editing ? new Date(editing.scheduledFor).getHours() : 12)
  const [minute, setMinute]         = useState(editing ? new Date(editing.scheduledFor).getMinutes() : 0)
  const [recurring, setRecurring]   = useState<Recurring>(editing?.recurring ?? 'none')
  const [isListening, setListening] = useState(false)
  const [voiceError, setVoiceError] = useState('')
  const speechRef = useRef<ReturnType<typeof createSpeechController> | null>(null)

  // Auto-parse Cantonese text → preview
  useEffect(() => {
    if (!inputText || inputText.length < 4) return
    const parsed = parseCantoneseInput(inputText)
    if (parsed) {
      setMessage(parsed.message)
      setDate(parsed.scheduledFor)
      setHour(parsed.scheduledFor.getHours())
      setMinute(parsed.scheduledFor.getMinutes())
      const c = contacts.find(c => c.name.includes(parsed.contactName) || parsed.contactName.includes(c.name))
      if (c) setContactId(c.id)
    }
  }, [inputText, contacts])

  function startMic() {
    setVoiceError('')
    const c = createSpeechController(
      (text, isFinal) => {
        setInputText(text)
        if (isFinal) {
          setTimeout(() => { c.stop(); setListening(false) }, 600)
        }
      },
      (msg) => { setVoiceError(`語音錯誤: ${msg}`); setListening(false) }
    )
    speechRef.current = c
    if (!c.supported) {
      setVoiceError('瀏覽器不支援語音識別。請用 Chrome / Edge。')
      return
    }
    c.start()
    setListening(true)
  }

  function stopMic() {
    speechRef.current?.stop()
    setListening(false)
  }

  async function save() {
    if (!contactId || !message) return
    const scheduled = new Date(date)
    scheduled.setHours(hour, minute, 0, 0)
    const data = {
      contactId,
      contactName: contacts.find(c => c.id === contactId)?.name || 'Unknown',
      message,
      scheduledFor: scheduled.getTime(),
      status: 'pending' as const,
      recurring,
    }
    if (editing) await updateReminder(uid, editing.id, data)
    else         await addReminder(uid, { ...data, createdAt: Date.now() })
    onClose()
  }

  const Y = date.getFullYear()
  const M = String(date.getMonth() + 1).padStart(2, '0')
  const D = String(date.getDate()).padStart(2, '0')
  const dateStr = `${Y}-${M}-${D}`

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div
        className="w-full max-w-lg animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{editing ? '編輯提醒' : '新提醒'}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">✕</button>
        </div>

        {/* Voice / text input */}
        <div className="mb-4 flex items-start gap-2">
          <div className="flex-1">
            <label className="label">講出或輸入</label>
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="例如：聽日下午3點提Jay食藥"
              className="input min-h-[60px] resize-none"
              rows={2}
            />
            {voiceError && <p className="mt-2 text-xs text-red-600">{voiceError}</p>}
          </div>
          <button
            onClick={isListening ? stopMic : startMic}
            className={`mt-7 flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-lg transition-all ${
              isListening ? 'bg-red-500 shadow-red-500/40 animate-pulse-ring' : 'bg-brand-500 shadow-brand-500/30 hover:bg-brand-600'
            }`}
            title={isListening ? '停止' : '錄音'}
          >
            <span className="text-xl">{isListening ? '⏹' : '🎤'}</span>
          </button>
        </div>

        {/* Contact chips */}
        <div className="mb-4">
          <label className="label">聯絡人</label>
          {contacts.length === 0 ? (
            <p className="text-sm text-slate-400">先去「聯絡人」分頁加一個</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setContactId(c.id)}
                  className={`chip ${contactId === c.id ? 'chip-active' : ''}`}
                >{c.name}</button>
              ))}
            </div>
          )}
        </div>

        {/* Date / time */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="col-span-3 sm:col-span-2">
            <label className="label">日期</label>
            <input type="date" value={dateStr} onChange={e => setDate(new Date(e.target.value))} className="input" />
          </div>
          <div className="col-span-3 sm:col-span-1">
            <label className="label">時間</label>
            <div className="flex items-center gap-1">
              <input type="number" min="0" max="23" value={hour}   onChange={e => setHour(parseInt(e.target.value) || 0)}   className="input w-1/2 text-center" />
              <span className="text-slate-400">:</span>
              <input type="number" min="0" max="59" value={minute} onChange={e => setMinute(parseInt(e.target.value) || 0)} className="input w-1/2 text-center" />
            </div>
          </div>
        </div>

        {/* Recurring */}
        <div className="mb-6">
          <label className="label">重覆</label>
          <div className="flex flex-wrap gap-2">
            {RECURRING_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => setRecurring(o.value as Recurring)}
                className={`chip ${recurring === o.value ? 'chip-active' : ''}`}
              >{o.label}</button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">取消</button>
          <button onClick={save} disabled={!contactId || !message} className="btn-primary flex-1 disabled:opacity-50">
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
