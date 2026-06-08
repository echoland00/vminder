import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useContacts } from '../hooks/useContacts'
import { addContact, updateContact, deleteContact } from '../firebase/firestore'
import type { Contact } from '../types'

export default function ContactsPage() {
  const { user } = useAuth()
  const contacts = useContacts(user?.uid)
  const [showForm, setShowForm]   = useState(false)
  const [editing, setEditing]     = useState<Contact | null>(null)
  const [search, setSearch]       = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <div className="mb-6 flex items-end justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">聯絡人</h1>
          <p className="mt-1 text-sm text-slate-500">{contacts.length} 位</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true) }} className="btn-primary">
          <span className="text-lg leading-none">＋</span> 新增
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜尋名稱或電話…"
          className="input"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <span className="text-3xl">👤</span>
          </div>
          <p className="text-sm text-slate-500">
            {search ? '搵唔到相關聯絡人' : '未有聯絡人 — 撳「新增」開始'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(c => (
            <li key={c.id} className="card flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-purple-500 text-sm font-semibold text-white">
                {c.name.charAt(0).toUpperCase()}
              </div>
              <button onClick={() => { setEditing(c); setShowForm(true) }} className="flex-1 text-left">
                <p className="card-title">{c.name}</p>
                <p className="card-meta">{c.phone}</p>
              </button>
              <button
                onClick={async () => {
                  if (!user) return
                  if (confirm(`確定刪除 ${c.name}？`)) await deleteContact(user.uid, c.id)
                }}
                className="flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50"
                title="刪除"
              >✕</button>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <ContactForm
          uid={user!.uid}
          editing={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
        />
      )}
    </div>
  )
}

function ContactForm({ uid, editing, onClose }: { uid: string; editing: Contact | null; onClose: () => void }) {
  const [name, setName]   = useState(editing?.name ?? '')
  const [phone, setPhone] = useState(editing?.phone ?? '')

  async function save() {
    if (!name || !phone) return
    if (editing) await updateContact(uid, editing.id, { name, phone })
    else         await addContact(uid, { name, phone })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md animate-slide-up rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl" onClick={e => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{editing ? '編輯聯絡人' : '新增聯絡人'}</h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100">✕</button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">名稱</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input" placeholder="例如：Jay" autoFocus />
          </div>
          <div>
            <label className="label">電話</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} className="input" type="tel" placeholder="9123 4567" />
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="btn-ghost flex-1">取消</button>
          <button onClick={save} disabled={!name || !phone} className="btn-primary flex-1 disabled:opacity-50">儲存</button>
        </div>
      </div>
    </div>
  )
}
