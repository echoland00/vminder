import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function AppShell() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-500" />
      </div>
    )
  }

  if (!user) return <Outlet />

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="px-5 pt-8 sm:px-8">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-2xl">
          {[
            { to: '/reminders', icon: '🔔', label: '提緊' },
            { to: '/contacts',  icon: '👤', label: '聯絡人' },
            { to: '/settings',  icon: '⚙️', label: '設定' },
          ].map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-xl">{item.icon}</span>
                  <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
