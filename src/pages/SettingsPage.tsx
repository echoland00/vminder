import { useNavigate } from 'react-router-dom'
import { logOut } from '../firebase/auth'
import { useAuth } from '../hooks/useAuth'

export default function SettingsPage() {
  const { user } = useAuth()
  const nav = useNavigate()

  async function handleLogout() {
    if (confirm('確定登出？')) {
      await logOut()
      nav('/login')
    }
  }

  async function enableNotifications() {
    if (!('Notification' in window)) {
      alert('此瀏覽器不支援通知')
      return
    }
    const perm = await Notification.requestPermission()
    alert(perm === 'granted' ? '已開啟通知 ✓' : '通知被拒')
  }

  return (
    <div className="mx-auto max-w-2xl pb-24">
      <h1 className="mb-6 text-3xl font-bold tracking-tight pt-2">設定</h1>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-medium text-slate-500">帳戶</h2>
        <p className="text-sm text-slate-700">{user?.email}</p>
        <button onClick={handleLogout} className="btn-danger mt-4 w-full">登出</button>
      </section>

      <section className="card mb-4">
        <h2 className="mb-3 text-sm font-medium text-slate-500">通知</h2>
        <p className="text-sm text-slate-700">開啟瀏覽器通知，確保提醒準時送達。</p>
        <button onClick={enableNotifications} className="btn-primary mt-4 w-full">開啟通知</button>
      </section>

      <section className="card">
        <h2 className="mb-3 text-sm font-medium text-slate-500">關於</h2>
        <p className="text-sm text-slate-700">Vminder · 智能語音提醒</p>
        <p className="mt-1 text-xs text-slate-400">v1.0.0 · Web build</p>
      </section>
    </div>
  )
}
