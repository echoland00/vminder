import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import LoginPage from './pages/LoginPage'
import RemindersPage from './pages/RemindersPage'
import ContactsPage from './pages/ContactsPage'
import SettingsPage from './pages/SettingsPage'
import { useAuth } from './hooks/useAuth'
import type { ReactNode } from 'react'

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/reminders" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/login" element={<PublicOnly><LoginPage /></PublicOnly>} />
        <Route path="/reminders" element={<Protected><RemindersPage /></Protected>} />
        <Route path="/contacts"  element={<Protected><ContactsPage /></Protected>} />
        <Route path="/settings"  element={<Protected><SettingsPage /></Protected>} />
        <Route path="*" element={<Navigate to="/reminders" replace />} />
      </Route>
    </Routes>
  )
}
