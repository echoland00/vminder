import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../firebase/auth'

export default function LoginPage() {
  const nav = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin]   = useState(true)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      if (isLogin) await signIn(email, password)
      else         await signUp(email, password)
      nav('/reminders')
    } catch (err: any) {
      setError(err.message?.replace('Firebase:', '').trim() || '登入失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-purple-500 shadow-lg shadow-brand-500/30">
            <svg className="h-9 w-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Vminder</h1>
          <p className="mt-1 text-sm text-slate-500">智能語音提醒</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">電郵</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">密碼</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} minLength={6} />
          </div>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? '處理中…' : (isLogin ? '登入' : '註冊')}
          </button>

          <button type="button" onClick={() => { setIsLogin(!isLogin); setError('') }} className="w-full text-center text-sm text-brand-600 hover:text-brand-700">
            {isLogin ? '未有帳戶？註冊' : '已有帳戶？登入'}
          </button>
        </form>
      </div>
    </div>
  )
}
